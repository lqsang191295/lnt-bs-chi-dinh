import { post } from "@/api/client";


export const getHosobenhan = async (pUser: string, pOpt: string,KhoaDieuTri: string, TuNgay: string, DenNgay: string) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_HoSoBenhAn_SelectByDate",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "KhoaDieuTri", paraValue: KhoaDieuTri },
        { paraName: "TuNgay", paraValue: TuNgay },
        { paraName: "DenNgay", paraValue: DenNgay },
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