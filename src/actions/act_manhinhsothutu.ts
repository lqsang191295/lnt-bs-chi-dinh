import { post } from "@/api/client";
import { IThuTuHienTai } from "@/model/tsothutuhientai";
export const getCurrentSTTQuay = async (): Promise<IThuTuHienTai[]> => {
  try {
    const response = await post(`/his/call`, {
      funcName: "dbo.sp_get_current_sothutu_byquay"
    });

    if (response.status === "error") {
      return [];
    }
    return response.message || "";
  } catch (error) {
    console.error("Lỗi tìm kiếm bệnh nhân:", error);
    return [];
  }
};