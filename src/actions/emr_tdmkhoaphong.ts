import { post } from "@/api/client";

export const gettDMKhoaPhongs = async () => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_tdmkhoaphong",
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