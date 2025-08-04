import { post } from "@/api/client";


export const getHosobenhan = async (pUser: string, pOpt: string,KhoaDieuTri: string, TuNgay: string, DenNgay: string) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pins_tnguoidung",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "cid", paraValue: KhoaDieuTri },
        { paraName: "ctaikhoan", paraValue: TuNgay },
        { paraName: "choten", paraValue: DenNgay },
        { paraName: "cngaysinh", paraValue: DenNgay },
        { paraName: "cmadonvi", paraValue: DenNgay },
        { paraName: "cmanhomnguoidung", paraValue: DenNgay },
        { paraName: "cdiachi", paraValue: DenNgay },
        { paraName: "cdienthoai", paraValue: DenNgay },
        { paraName: "ccchn", paraValue: DenNgay },
        { paraName: "cemail", paraValue: DenNgay },
        { paraName: "cchucdanh", paraValue: DenNgay },
        { paraName: "cghichu", paraValue: DenNgay },
        { paraName: "cmatkhau", paraValue: DenNgay },
        { paraName: "cxacthuc2lop", paraValue: DenNgay },
        { paraName: "ctrangthai", paraValue: DenNgay },
      ],
    });
//     @puser nvarchar(100),
// 	   @popt nvarchar(100),
//     @cid bigint,
//     @ctaikhoan nvarchar(256),
//     @choten nvarchar(1000),
//     @cngaysinh nvarchar(100),
//     @cmadonvi int,
//     @cmanhomnguoidung int,
//     @cdiachi nvarchar(2000),
//     @cdienthoai nvarchar(100),
//     @ccchn nvarchar(100),
//     @cemail nvarchar(100),
//     @cchucdanh nvarchar(100),
//     @cghichu nvarchar(3000),
//     @cmatkhau nvarchar(3000),
//     @cxacthuc2lop nvarchar(100),
//     @ctrangthai int 
    if (response.status === "error") {
      return [];
    }

    return response.message;
  } catch {
    return [];
  }
};