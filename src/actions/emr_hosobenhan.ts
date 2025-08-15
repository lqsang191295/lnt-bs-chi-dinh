import { post } from "@/api/client";
import { IHoSoBenhAn} from "@/model/thosobenhan";
import { ITMuonTraHSBA } from "@/model/tmuontrahsba";
import { IHoSoBenhAnChiTiet } from "@/model/thosobenhan_chitiet";

export const getHosobenhan = async (pUser: string, pOpt: string,KhoaDieuTri: string, TuNgay: string, DenNgay: string) => {
  try {
    //console.log("Fetching HoSoBenhAn...");
    // Gọi API để lấy danh sách hồ sơ bệnh án
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

export const getChiTietHSBA = async (pUser: string, pOpt: string, ID: string) => {
  try {
    //console.log("Fetching HoSoBenhAn...");
    // Gọi API để lấy danh sách hồ sơ bệnh án
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_hosobenhan_chitiet",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "ID", paraValue: ID },
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
///
/// Cập nhật hồ sơ bệnh án
/// popt: 
//  "1" - Thêm mới, 
//  "2" - Cập nhật, 
//  "3" - Cập nhật lưu trữ hsba SoLuuTru,VitriLuuTru,LoaiLuuTru,NgayLuuTru,
//  "4" - Cập nhật trạng thái hồ sơ bệnh án [đóng/mở]
export const capnhathosobenhan = async (pUser: string, pOpt: string, hsba: IHoSoBenhAn) => {
  try {
    //console.log("Fetching HoSoBenhAn...");
    // Gọi API để lấy danh sách hồ sơ bệnh án
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pins_HoSoBenhAn",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "ID", paraValue: hsba.ID },
        { paraName: "MaBANoiTru", paraValue: hsba.MaBANoiTru },
        { paraName: "SoBenhAn", paraValue: hsba.SoBenhAn },
        { paraName: "MaBN", paraValue: hsba.MaBN },
        { paraName: "Hoten", paraValue: hsba.Hoten },
        { paraName: "Ngaysinh", paraValue: hsba.Ngaysinh },
        { paraName: "Gioitinh", paraValue: hsba.Gioitinh },
        { paraName: "Dienthoai", paraValue: hsba.Dienthoai },
        { paraName: "Diachi", paraValue: hsba.Diachi },
        { paraName: "SoCCCD", paraValue: hsba.SoCCCD },
        { paraName: "SoNhapVien", paraValue: hsba.SoNhapVien },
        { paraName: "SoVaoVien", paraValue: hsba.SoVaoVien },
        { paraName: "SoLuuTru", paraValue: hsba.SoLuuTru },
        { paraName: "KhoaVaoVien", paraValue: hsba.KhoaVaoVien },
        { paraName: "KhoaDieuTri", paraValue: hsba.KhoaDieuTri },
        { paraName: "NgayVao", paraValue: hsba.NgayVao },
        { paraName: "NgayRa", paraValue: hsba.NgayRa },
        { paraName: "LoaiBenhAn", paraValue: hsba.LoaiBenhAn },
        { paraName: "NoiDungJson", paraValue: hsba.NoiDungJson },
        { paraName: "NoiDungXml", paraValue: hsba.NoiDungXml },
        { paraName: "NoiDungPdf", paraValue: hsba.NoiDungPdf },
        { paraName: "TruongKhoaKyTen", paraValue: hsba.TruongKhoaKyTen },
        { paraName: "GdbvKyTen", paraValue: hsba.GdbvKyTen },
        { paraName: "BsLamBAKyTen", paraValue: hsba.BsLamBAKyTen },
        { paraName: "BsDieuTriKyTen", paraValue: hsba.BsDieuTriKyTen },
        { paraName: "TrangThaiBA", paraValue: hsba.TrangThaiBA },
        { paraName: "ViTriLuuTru", paraValue: hsba.ViTriLuuTru },
        { paraName: "LoaiLuuTru", paraValue: hsba.LoaiLuuTru },
        { paraName: "NgayLuuTru", paraValue: hsba.NgayLuuTru },
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

///
/// Thêm phiếu mượn - trả hồ sơ bệnh án
/// popt: 
//  "1" - Thêm mới, 
//  "2" - Cập nhật, 
//  hsba.cthaotac: - THAO TÁC MƯỢN TRẢ
//  "MUON" - mượn hsba
//  "TRA" - trả hsba
export const themmuontraHSBA = async (pUser: string, pOpt: string, hsba: ITMuonTraHSBA) => {
  try {
    // Gọi API để them phiếu mượn - trả hồ sơ bệnh án
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pins_tmuontrahsba",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "cid", paraValue: hsba.cid },
        { paraName: "cmabenhan", paraValue: hsba.cmabenhan },
        { paraName: "cthaotac", paraValue: hsba.cthaotac },
        { paraName: "cnguoithaotac", paraValue: hsba.cnguoithaotac },
        { paraName: "cngaytradukien", paraValue: hsba.cngaytradukien },
        { paraName: "cnguoimuon", paraValue: hsba.cnguoimuon },
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


///
/// Lấy lịch sử phiếu mượn - trả hồ sơ bệnh án
/// popt: "1" - Lấy danh sách phiếu mượn - trả hồ sơ bệnh án 
//  ctungay: Ngày bắt đầu,
//  cdenngay: Ngày kết thúc
export const getmuontraHSBA = async (pUser: string, pOpt: string, cmaba: string, ctungay: string, cdenngay: string) => {
  try {
    // Gọi API để them phiếu mượn - trả hồ sơ bệnh án
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_tmuontrahsba",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "cmaba", paraValue: cmaba },
        { paraName: "ctungay", paraValue: ctungay },
        { paraName: "cdenngay", paraValue: cdenngay },
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