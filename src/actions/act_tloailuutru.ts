import { post } from "@/api/client";

export const getloailuutru = async () => {
  try {
    //console.log("Fetching HoSoBenhAn...");
    // Gọi API để lấy danh sách hồ sơ bệnh án
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_tloailuutru",
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