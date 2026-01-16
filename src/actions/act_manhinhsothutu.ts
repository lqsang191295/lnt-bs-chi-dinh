import { post } from "@/api/client";
import { IDMQuayDangKy, IThuTuHienTai } from "@/model/tsothutuhientai";
export const getCurrentSTTQuay = async (): Promise<IThuTuHienTai[]> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "3",
      funcName: "dbo.sp_get_current_sothutu_byquay",
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

export const getDM_QuayDangKy = async (): Promise<IDMQuayDangKy[]> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "3",
      funcName: "dbo.sp_get_HT_DMQuayDangKy",
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
