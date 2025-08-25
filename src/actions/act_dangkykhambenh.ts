import { post } from "@/api/client";
import { 
  IBenhNhan, 
  IDangKyKhamBenh, 
  ITimKiemBenhNhan, 
  IPhieuDangKy,
  IResponse 
} from "@/model/dangkykhambenh";

// Tìm kiếm bệnh nhân theo CCCD hoặc số điện thoại
export const timKiemBenhNhan = async (params: ITimKiemBenhNhan): Promise<IBenhNhan[]> => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_benhnhan_search",
      paraData: [
        { paraName: "pcccd", paraValue: params.cccd || "" },
        { paraName: "psdt", paraValue: params.soDienThoai || "" },
        { paraName: "photen", paraValue: params.hoTen || "" },
      ],
    });

    if (response.status === "error") {
      return [];
    }

    return response.message || [];
  } catch (error) {
    console.error("Lỗi tìm kiếm bệnh nhân:", error);
    return [];
  }
};

// Lấy thông tin bệnh nhân từ CCCD (quét CCCD)
export const layThongTinTuCCCD = async (cccd: string): Promise<IBenhNhan | null> => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_benhnhan_by_cccd",
      paraData: [
        { paraName: "pcccd", paraValue: cccd },
      ],
    });

    if (response.status === "error") {
      return null;
    }

    return response.message || null;
  } catch (error) {
    console.error("Lỗi lấy thông tin từ CCCD:", error);
    return null;
  }
};

// Thêm bệnh nhân mới
export const themBenhNhan = async (benhNhan: IBenhNhan): Promise<IResponse<IBenhNhan>> => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pinsert_benhnhan",
      paraData: [
        { paraName: "photen", paraValue: benhNhan.hoTen },
        { paraName: "pcccd", paraValue: benhNhan.cccd },
        { paraName: "pngaysinh", paraValue: benhNhan.ngaySinh },
        { paraName: "pgioitinh", paraValue: benhNhan.gioiTinh },
        { paraName: "psdt", paraValue: benhNhan.soDienThoai },
        { paraName: "pdiachi", paraValue: benhNhan.diaChi },
      ],
    });

    if (response.status === "error") {
      return {
        status: "error",
        message: response.message || "Lỗi thêm bệnh nhân",
        error: response.message
      };
    }

    return {
      status: "success",
      message: "Thêm bệnh nhân thành công",
      data: response.message
    };
  } catch (error) {
    console.error("Lỗi thêm bệnh nhân:", error);
    return {
      status: "error",
      message: "Lỗi hệ thống",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};



// Đăng ký khám bệnh
export const dangKyKhamBenh = async (dangKy: IDangKyKhamBenh): Promise<IResponse<IDangKyKhamBenh>> => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pinsert_dangkykhambenh",
      paraData: [
        { paraName: "pmanbn", paraValue: dangKy.maBN },
        { paraName: "pngaydangky", paraValue: dangKy.ngayDangKy },
        { paraName: "pgiogio", paraValue: dangKy.gioDangKy },
        { paraName: "plydokham", paraValue: dangKy.lyDoKham },
        { paraName: "pghichu", paraValue: dangKy.ghiChu || "" },
        { paraName: "pnguoidangky", paraValue: dangKy.nguoiDangKy || "" },
      ],
    });

    if (response.status === "error") {
      return {
        status: "error",
        message: response.message || "Lỗi đăng ký khám bệnh",
        error: response.message
      };
    }

    return {
      status: "success",
      message: "Đăng ký khám bệnh thành công",
      data: response.message
    };
  } catch (error) {
    console.error("Lỗi đăng ký khám bệnh:", error);
    return {
      status: "error",
      message: "Lỗi hệ thống",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};



// Tạo mã phiếu đăng ký tự động
export const taoMaPhieuTuDong = async (): Promise<string> => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_maphieu_tudong",
      paraData: [],
    });

    if (response.status === "error") {
      return `PK${new Date().getTime()}`; // Fallback mã phiếu
    }

    return response.message || `PK${new Date().getTime()}`;
  } catch (error) {
    console.error("Lỗi tạo mã phiếu:", error);
    return `PK${new Date().getTime()}`; // Fallback mã phiếu
  }
};
