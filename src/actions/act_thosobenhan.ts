import { post } from "@/api/client";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { ITMuonTraHSBA } from "@/model/tmuontrahsba";

export const getHosobenhan = async (
  pUser: string,
  pOpt: string,
  KhoaDieuTri: string,
  TuNgay: string,
  DenNgay: string
) => {
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

export const getChiTietHSBA = async (
  pUser: string,
  pOpt: string,
  ID: string
) => {
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
//  "5" - Cập nhật PDF KẾT XUẤT hồ sơ bệnh án
export const capnhathosobenhan = async (
  pUser: string,
  pOpt: string,
  hsba: IHoSoBenhAn
) => {
  try {
    //console.log("Fetching HoSoBenhAn...");  
    // console.log(`'${pUser}'
    // , '${pOpt}'
    // , '${hsba.ID}'
    // , '${hsba.SoBenhAn}'
    // , '${hsba.MaBANoiTru}'
    // , '${hsba.MaBN}'
    // , '${hsba.Hoten}'
    // , '${hsba.Ngaysinh}'
    // , '${hsba.Gioitinh}'
    // , '${hsba.Dienthoai}'
    // , '${hsba.Diachi?.substring(0, 50)}...'
    // , '${hsba.SoCCCD}'
    // , '${hsba.SoNhapVien}'
    // , '${hsba.SoVaoVien}'
    // , '${hsba.SoLuuTru}'
    // , '${hsba.KhoaVaoVien}'
    // , '${hsba.KhoaDieuTri}'
    // , '${hsba.NgayVao}'
    // , '${hsba.NgayRa}'
    // , '${hsba.LoaiBenhAn}'
    // , '${hsba.NoiDungJson?.substring(0, 50)}...'
    // , '${hsba.NoiDungXml?.substring(0, 50)}...'
    // , '${hsba.NoiDungPdf?.substring(0, 50)}...'
    // , '${hsba.TruongKhoaKyTen}'
    // , '${hsba.GdbvKyTen}'
    // , '${hsba.BsLamBAKyTen}'
    // , '${hsba.BsDieuTriKyTen}'
    // , '${hsba.TrangThaiBA}'
    // , '${hsba.ViTriLuuTru}'
    // , '${hsba.LoaiLuuTru}'
    // , '${hsba.NgayLuuTru}'
    // , '${hsba.NguoiKetXuat}'`);
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
        { paraName: "NguoiKetXuat", paraValue: hsba.NguoiKetXuat },
      ],
    });
    // console.log("Response from capnhathosobenhan:", response);
    if (response.status === "error") {
      return [];
    }
    return response.message;
  } catch {
    return [];
  }
};

///
/// Kết xuất hồ sơ bệnh án
/// popt:
//  "5" - Cập nhật PDF KẾT XUẤT hồ sơ bệnh án
export const ketxuathosobenhan = async (
  pUser: string,
  pOpt: string,
  hsba: IHoSoBenhAn
) => {
  try {
    //console.log("Fetching HoSoBenhAn...");  
    // console.log(`'${pUser}'
    // , '${pOpt}'
    // , '${hsba.ID}'  
    // , '${hsba.NoiDungPdf?.substring(0, 50)}...' 
    // , '${hsba.NguoiKetXuat}'`);
    // Gọi API để lấy danh sách hồ sơ bệnh án
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pupd_HoSoBenhAn",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "ID", paraValue: hsba.ID }, 
        { paraName: "NoiDungPdf", paraValue: hsba.NoiDungPdf },
        { paraName: "NguoiKetXuat", paraValue: hsba.NguoiKetXuat },
      ],
    });
    // console.log("Response from capnhathosobenhan:", response);
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
export const themmuontraHSBA = async (
  pUser: string,
  pOpt: string,
  hsba: ITMuonTraHSBA
) => {
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
        { paraName: "cghichumuon", paraValue: hsba.cghichumuon },
        { paraName: "cngaytra", paraValue: hsba.cngaytra },
        { paraName: "cghichutra", paraValue: hsba.cghichutra },
      ],
    });
    //console.log("Response from themmuontraHSBA:", response);
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
/// popt:
// "1" - Lấy danh sách phiếu mượn - trả hồ sơ bệnh án theo mã bệnh án
// "2" - Lấy danh sách phiếu mượn - trả hồ sơ bệnh án theo ngày
//  cmaba: Mã bệnh án
//  ctungay: Ngày bắt đầu,
//  cdenngay: Ngày kết thúc
export const getmuontraHSBA = async (
  pUser: string,
  pOpt: string,
  cmaba: string,
  ctungay: string,
  cdenngay: string
) => {
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
    //console.log("Response from getmuontraHSBA:", response);
    if (response.status === "error") {
      return [];
    }

    return response.message;
  } catch {
    return [];
  }
};

export const getnhatkythaotacba = async (
  pUser: string,
  pOpt: string,
  sTuNgay: string,
  sDenNgay: string
) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_tnhatkythaotacba",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "tungay", paraValue: sTuNgay },
        { paraName: "denngay", paraValue: sDenNgay },
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

export const getnhatkyketxuatba = async (
  pUser: string,
  pOpt: string,
  KhoaDieuTri: string,
  sTuNgay: string,
  sDenNgay: string
) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_tnhatkyketxuatba",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "khoadieutri", paraValue: KhoaDieuTri },
        { paraName: "tungay", paraValue: sTuNgay },
        { paraName: "denngay", paraValue: sDenNgay },
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
/// Kiểm tra số lưu trữ đã tồn tại hay chưa
/// pUser: Tên người dùng
/// pOpt: Tùy chọn kiểm tra
/// "1" - Tự động tạo số lưu trữ mới
/// "2" - Kiểm tra số lưu trữ đã tồn tại
/// soluutru: Số lưu trữ cần kiểm tra
export const checkSoLuuTru = async (
  pUser: string,
  pOpt: string,
  soluutru: string
) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_soluutru",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "soluutru", paraValue: soluutru },
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
