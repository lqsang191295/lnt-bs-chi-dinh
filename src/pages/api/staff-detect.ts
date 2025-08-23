import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Thêm vào .env.local
});

async function getEmployeeImages(token: string) {
  //: Promise<Array<{ cid: number, ctaikhoan: string, choten: string, cimg: string, cngaytao: string }>>
  //console.log("Fetching employee images from server...");

  const result = await luuanhnguoidung("0", "0", 0, "0", "0", "0", token);
  //console.log("Received employee images:", result.length, "items");

  //return arr as Array<{ cid: number, ctaikhoan: string, choten: string, cimg: string, cngaytao: string }>;
  return result;
}

async function post(
  endpoint: string,
  body: unknown,
  options: {
    token?: string; // Token để xác thực
    headers?: Record<string, unknown>; // Thêm header nếu cần
    params?: Record<string, unknown>; // Query params cho GET
    credentials?: boolean;
  }
) {
  const API_BASE_URL = "http://172.16.0.10:3003";
  const { headers, credentials = true, token } = options;

  let URL = `${API_BASE_URL}${endpoint}`;

  if (endpoint.includes("http")) URL = `${endpoint}`;

  const res = await fetch(URL, {
    method: "POST",
    ...(credentials ? { credentials: "include" } : {}),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    return { status: "error", message: res.statusText };
    //throw new Error(`POST ${endpoint} failed: ${res.statusText}`);
  }

  return res.json();
}
const luuanhnguoidung = async (
  pUser: string,
  pOpt: string,
  cid: number,
  ctaikhoan: string,
  choten: string,
  cimg: string,
  token: string
) => {
  try {
    console.log("puser:", pUser);
    console.log("popt:", pOpt);
    console.log("cid:", cid);
    console.log("ctaikhoan:", ctaikhoan);
    console.log("choten:", choten);
    const response = await post(
      `/api/callService`,
      {
        userId: "",
        option: "",
        funcName: "dbo.emr_pins_tnguoidung_img",
        paraData: [
          { paraName: "puser", paraValue: pUser },
          { paraName: "popt", paraValue: pOpt },
          { paraName: "cid", paraValue: cid },
          { paraName: "ctaikhoan", paraValue: ctaikhoan },
          { paraName: "choten", paraValue: choten },
          { paraName: "cimg", paraValue: cimg },
        ],
      },
      { token: token }
    );
    console.log(
      "luuanhnguoidung responselenght:[",
      response.message.length,
      "]"
    );
    if (response.status === "error") {
      return [];
    }
    return response.message;
  } catch {
    return [];
  }
};

async function compareWithChatGPT(inputImage: string, sampleImage: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "So sánh 2 khuôn mặt trong ảnh này. Đây có phải là cùng 1 người không? Trả lời chỉ 'YES' hoặc 'NO' và độ tin cậy từ 0-100%.",
            },
            {
              type: "image_url",
              image_url: {
                url: inputImage,
              },
            },
            {
              type: "image_url",
              image_url: {
                url: sampleImage,
              },
            },
          ],
        },
      ],
      max_tokens: 100,
    });

    const result = response.choices[0]?.message?.content || "";
    //console.log("OpenAI API Response:", result);
    const isMatch = result.toUpperCase().includes("YES");
    const confidence = result.match(/(\d+)%/)?.[1] || "0";

    return {
      isMatch,
      confidence: parseInt(confidence),
      result,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return { isMatch: false, confidence: 0, result: "" };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  console.log("Received request to /api/staff-detect");

  const { token, image } = req.body;
  if (!image || !token) {
    return res.status(400).json({ found: false, message: "Thiếu dữ liệu" });
  }

  console.log("Received image, getting employee data...");

  // Lấy danh sách ảnh mẫu từ server
  const arr = await getEmployeeImages(token);

  //console.log("Received image, getting employee data...", arr);

  if (!Array.isArray(arr) || arr.length === 0) {
    return res.json({ found: false, message: "Không tìm thấy ảnh mẫu" });
  }

  console.log(`Comparing with ${arr.length} employee images...`);

  // So sánh với từng ảnh mẫu
  for (const nv of arr) {
    if (!nv.cimg) continue;

    try {
      const comparison = await compareWithChatGPT(image, nv.cimg);

      if (comparison.isMatch && comparison.confidence >= 70) {
        // Ngưỡng tin cậy >= 70%
        console.log(
          `Match found: ${nv.ctaikhoan} with confidence ${comparison.confidence}%`
        );
        return res.json({
          found: true,
          nhanvien: {
            ctaikhoan: nv.ctaikhoan,
            choten: nv.choten,
            cid: nv.cid,
            cimg: nv.cimg,
            cngaytao: nv.cngaytao,
          },
          confidence: comparison.confidence,
          aiResult: comparison.result,
        });
      }
    } catch (e) {
      console.error("Error comparing with employee:", nv.ctaikhoan, e);
      continue;
    }
  }

  // Không trùng khớp với bất kỳ ảnh nào
  return res.json({
    found: false,
    message: "Không trùng khớp với ảnh mẫu nào",
  });
}
