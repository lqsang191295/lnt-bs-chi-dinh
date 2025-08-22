import { post } from "@/api/client";
import { IUserItem } from "@/model/tuser";

export const getMenuItems = async (userData: IUserItem) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_tmenu",
      paraData: [
        { paraName: "puser", paraValue: "0" },
        { paraName: "popt", paraValue: "0" },
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
