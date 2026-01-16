import { v4 as uuidv4 } from "uuid";
import { HashRequest, SignHashRequest, SmartCAClient } from "./smartca.client";

export interface SignProcessResult {
  success: boolean;
  tranId?: string;
  message: string;
}

/**
 * Hàm thực hiện quy trình ký số PDF
 * @param accessToken Token lấy từ hàm getAccessToken
 * @param pdfBase64 Nội dung file PDF dạng chuỗi Base64
 */
export async function processSignPdf(
  accessToken: string,
  pdfBase64: string
): Promise<SignProcessResult> {
  const client = new SmartCAClient(accessToken);

  try {
    // 1. Lấy danh sách chứng thư
    const creds = await client.getCredentials();
    if (!creds.content || creds.content.length === 0) {
      return { success: false, message: "Không tìm thấy chứng thư số nào." };
    }
    const credentialId = creds.content[0];

    // 2. Tính toán Hash (Tương đương logic signature_curl.php)
    const calculateHashPayload: HashRequest = {
      fileContent: pdfBase64,
      hashResps: [
        {
          fileName: "document_to_sign.pdf",
          appearance: {
            fontName: "Time",
            fontSize: 13,
            page: 1,
            rectangle: "0,517,199,721",
            text: "Ký bởi: NextJS System",
            type: 2,
          },
          signatures: [{ page: 1, rectangle: "0,581,200,657" }],
        },
      ],
    };

    const hashRes = await client.calculateHash(calculateHashPayload);
    const hashInfo = hashRes.hashResps[0];

    if (hashInfo.code !== "sigSuccess") {
      return {
        success: false,
        message: `Lỗi tính toán hash: ${hashInfo.code}`,
      };
    }

    // 3. Gửi yêu cầu ký lên App SmartCA
    const signPayload: SignHashRequest = {
      credentialId: credentialId,
      refTranId: uuidv4(),
      description: "Yêu cầu ký số tài liệu PDF",
      authorize_mode: "implicit",
      response_type: "code",
      datas: [
        {
          name: "document_to_sign.pdf",
          hash: hashInfo.hash,
          fileID: hashInfo.fileID,
        },
      ],
    };

    const signResult = await client.signHash(signPayload);

    return {
      success: true,
      tranId: signResult.tranId,
      message: "Vui lòng mở ứng dụng SmartCA trên điện thoại để xác nhận ký.",
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
    return {
      success: false,
      message: `Lỗi hệ thống SmartCA: ${errorMsg}`,
    };
  }
}
