import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { luuanhnguoidung } from "@/actions/emr_tnguoidung";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Thêm vào .env.local
});

async function getEmployeeImages(): Promise<Array<{ cid: number, ctaikhoan: string, choten: string, cimg: string, cngaytao: string }>> {
  console.log("Fetching employee images from server...");

  const result = await luuanhnguoidung("0", "0", 0, "0", "0", "0");
  console.log("Received employee images:", result);
  const arr = result as Array<{ cid: number, ctaikhoan: string, choten: string, cimg: string, cngaytao: string }>;
  return arr;
}

async function compareWithChatGPT(inputImage: string, sampleImage: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "So sánh 2 khuôn mặt trong ảnh này. Đây có phải là cùng 1 người không? Trả lời chỉ 'YES' hoặc 'NO' và độ tin cậy từ 0-100%."
            },
            {
              type: "image_url",
              image_url: {
                url: inputImage
              }
            },
            {
              type: "image_url", 
              image_url: {
                url: sampleImage
              }
            }
          ]
        }
      ],
      max_tokens: 100,
    });

    const result = response.choices[0]?.message?.content || "";
    const isMatch = result.toUpperCase().includes("YES");
    const confidence = result.match(/(\d+)%/)?.[1] || "0";
    
    return {
      isMatch,
      confidence: parseInt(confidence),
      result
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return { isMatch: false, confidence: 0, result: "" };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  console.log("Received request to /api/staff-detect-ol");
  
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ found: false, message: "Thiếu dữ liệu" });
  }

  console.log("Received image, getting employee data...");
  
  // Lấy danh sách ảnh mẫu từ server
  const arr = await getEmployeeImages();

  if (!Array.isArray(arr) || arr.length === 0) {
    return res.json({ found: false, message: "Không tìm thấy ảnh mẫu" });
  }

  console.log(`Comparing with ${arr.length} employee images...`);

  // So sánh với từng ảnh mẫu
  for (const nv of arr) {
    if (!nv.cimg) continue;
    
    try {
      const comparison = await compareWithChatGPT(image, nv.cimg);
      
      if (comparison.isMatch && comparison.confidence >= 70) { // Ngưỡng tin cậy >= 70%
        console.log(`Match found: ${nv.ctaikhoan} with confidence ${comparison.confidence}%`);
        return res.json({
          found: true,
          nhanvien: {
            ctaikhoan: nv.ctaikhoan,
            choten: nv.choten,
            cid: nv.cid,
            cngaytao: nv.cngaytao,
          },
          confidence: comparison.confidence,
          aiResult: comparison.result
        });
      }
    } catch (e) {
      console.error("Error comparing with employee:", nv.ctaikhoan, e);
      continue;
    }
  }

  // Không trùng khớp với bất kỳ ảnh nào
  return res.json({ found: false, message: "Không trùng khớp với ảnh mẫu nào" });
}