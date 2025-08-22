import { post } from "@/api/client";
import { IUserItem } from "@/model/tuser";

export const getMenuItems = async (userData: IUserItem) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_tmenu",
      paraData: [
        { paraName: "puser", paraValue: userData.ctaikhoan },
        { paraName: "popt", paraValue: "1" },
      ],
    });

    if (response.status === "error") {
      return [];
    }

    return response.message;
  } catch {
    return [];
  }
};
