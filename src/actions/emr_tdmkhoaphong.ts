import { post } from "@/api/client";

export const gettDMKhoaPhongs = async () => {
  try {
    //console.log("Fetching tDMKhoaPhongs...");
    // Gọi API để lấy danh sách khoa phòng
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