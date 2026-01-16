import { post } from "@/api/client";
import { HT_ThamSo } from "@/model/HT_ThamSo";

export const getThamSoByListMa = async (ma: string): Promise<HT_ThamSo[]> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.sp_Get_HT_ThamSo_By_List_Ma",
      paraData: [{ paraName: "ListMa", paraValue: ma }],
    });

    console.log("Response tham số:", response);
    if (response.status === "error") {
      return [];
    }
    return response.message;
  } catch (error) {
    console.error("Lỗi tìm kiếm bệnh nhân:", error);
    return [];
  }
};
