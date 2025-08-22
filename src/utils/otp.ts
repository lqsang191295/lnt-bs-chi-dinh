type SendOTPResponse = unknown; // bạn có thể định nghĩa rõ hơn nếu biết cấu trúc response

export async function sentOTP(
  otp: string,
  phone: string
): Promise<SendOTPResponse> {
  const url = "http://123.31.36.151:8888/smsbn/api";

  const payload = {
    RQST: {
      name: "send_sms_list",
      REQID: "re12121",
      LABELID: "141121",
      CONTRACTTYPEID: "1",
      CONTRACTID: "13028",
      TEMPLATEID: "927969",
      PARAMS: [
        {
          NUM: "1",
          CONTENT: otp,
        },
      ],
      SCHEDULETIME: "",
      MOBILELIST: "84" + phone.replace(/^0/, ""), // thay 0 đầu tiên bằng 84
      ISTELCOSUB: "0",
      AGENTID: "181",
      APIUSER: "BV-L.N.TUNG",
      APIPASS: "Abc@123",
      USERNAME: "BV-L.N.TUNG",
      DATACODING: "8",
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`HTTP Error: ${res.status}`, errText);
      return errText;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Network or parsing error:", err);
    return null;
  }
}

export function genOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}
