import { HT_ThamSo } from "@/model/HT_ThamSo";
import type { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL = "http://172.16.0.10:3003";
/**
 * API lấy Access Token SmartCA
 * POST /api/ky-so?action=getAccessToken
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const fileName = req.body.fileName;

  if (!fileName) {
    return res.status(400).json({ message: "Missing fileName parameter" });
  }

  const fileBase64 = req.body.fileBase64;

  if (!fileBase64) {
    return res.status(400).json({ message: "Missing fileBase64 parameter" });
  }

  try {
    const strMa =
      "client_id_VNPTCA;client_secret_VNPTCA;password_VNPTCA;uid_VNPTCA;user_secret_VNPTCA";

    const resDataThamSo = await fetch(`${API_BASE_URL}/his/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "",
        optionId: "1",
        funcName: "dbo.sp_Get_HT_ThamSo_By_List_Ma",
        paraData: [{ paraName: "ListMa", paraValue: strMa }],
      }),
    });
    let dataThamSoJson;
    let dataThamSo;
    if (!resDataThamSo.ok) {
      dataThamSo = [
        {
          Ma: "client_id_VNPTCA",
          Thamso: "438c-638163930840242283.apps.smartcaapi.com",
        },
        { Ma: "client_secret_VNPTCA", Thamso: "ZjNjOWY2NDU-MDA3ZS00Mzhj" },
        { Ma: "password_VNPTCA", Thamso: "Lnt1234@" },
        { Ma: "uid_VNPTCA", Thamso: "3900836096_002" },
        {
          Ma: "user_secret_VNPTCA",
          Thamso: "MEE2MjRFODFCMjAzRTQyRUUyMzM2RDhCRDc0MDA1MzA=",
        },
      ];

      //return null;
    } else {
      dataThamSoJson = await resDataThamSo.json();
      dataThamSo = dataThamSoJson.message as HT_ThamSo[];
    }

    const mapThamSo = new Map<string, string>();

    dataThamSo.forEach((item: HT_ThamSo) => {
      mapThamSo.set(item.Ma, item.Thamso);
    });

    const resKySo = await fetch(`${API_BASE_URL}/kyso/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: mapThamSo.get("client_id_VNPTCA"),
        client_secret: mapThamSo.get("client_secret_VNPTCA"),
        user_secret: mapThamSo.get("user_secret_VNPTCA"),
        uid: mapThamSo.get("uid_VNPTCA"),
        password: mapThamSo.get("password_VNPTCA"),
        fileName: fileName,
        fileBase64: fileBase64,
      }),
    });
    const resKySoJson = await resKySo.json();

    if (resKySoJson.status !== "success") {
      return res.status(500).json({
        message: resKySoJson.message,
      });
    }
    return res.status(200).json(resKySoJson.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";

    return res.status(500).json({
      message,
    });
  }
}
