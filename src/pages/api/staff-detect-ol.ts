import { NextApiRequest, NextApiResponse } from "next";
import * as faceapi from "@vladmandic/face-api";
import { Canvas, Image, ImageData, loadImage } from "canvas";
import path from "path";
import fs from "fs";
import {luuanhnguoidung} from "@/actions/emr_tnguoidung"; 

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;
async function loadModels() {
  if (!modelsLoaded) {
    const modelPath = path.join(process.cwd(), "models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    modelsLoaded = true;
  }
}

async function base64ToImage(base64: string) {
  const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  const buffer = Buffer.from(matches ? matches[2] : base64, "base64");
  return await loadImage(buffer);
}
// Giả sử hàm này trả về mảng nhân viên có trường cimg là base64 ảnh
async function getEmployeeImages(): Promise<Array<{ cid: number, ctaikhoan: string, choten: string, cimg: string, cngaytao: string }>> {
  // TODO: Thay bằng gọi DB hoặc service thực tế của bạn
  // Ví dụ: return await luuanhnguoidung(...);
  const result = await luuanhnguoidung("", "0", 0, "", "", "");
  const arr = result as Array<{ cid: number, ctaikhoan: string, choten: string, cimg: string, cngaytao: string }>;
    return arr;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
console.log("Received request to /api/staff-detect");
  await loadModels();
console.log("Models loaded successfully");
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ found: false, message: "Thiếu dữ liệu" });
  }
console.log("Received image:", image);
  // Lấy danh sách ảnh mẫu từ server (mỗi nhân viên có thể có nhiều ảnh)
  const arr = await getEmployeeImages();

  if (!Array.isArray(arr) || arr.length === 0) {
    return res.json({ found: false, message: "Không tìm thấy ảnh mẫu" });
  }

  const inputImage = await base64ToImage(image);
  const inputDesc = await faceapi
    .detectSingleFace(inputImage as any)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!inputDesc) {
    return res.json({ found: false, message: "Không phát hiện khuôn mặt trong ảnh gửi lên" });
  }

  // So sánh với từng ảnh mẫu
  for (const nv of arr) {
    if (!nv.cimg) continue;
    try {
      const sampleImage = await base64ToImage(nv.cimg);
      const sampleDesc = await faceapi
        .detectSingleFace(sampleImage as any)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!sampleDesc) continue;

      const distance = faceapi.euclideanDistance(
        sampleDesc.descriptor,
        inputDesc.descriptor
      );
      const threshold = 0.5;
      if (distance < threshold) {
        // Nhận diện thành công
        return res.json({
          found: true,
          nhanvien: {
            ctaikhoan: nv.ctaikhoan,
            choten: nv.choten,
            cid: nv.cid,
            cngaytao: nv.cngaytao,
          },
          distance,
        });
      }
    } catch (e) {
      // Bỏ qua ảnh lỗi
      continue;
    }
  }

  // Không trùng khớp với bất kỳ ảnh nào
  return res.json({ found: false, message: "Không trùng khớp với ảnh mẫu nào" });
}