import { post } from "@/api/client";
import { IUserItem } from "@/model/tuser";
import { sha256 } from "@/utils/auth"; 
/** * Hàm thực hiện các thao tác với người dùng
 * @param pUser Tên người dùng thực hiện thao tác
 * @param pOpt Loại thao tác (1 thêm, 2 sửa, 3 xóa, 4 đổi mật khẩu )
 * @param user Thông tin người dùng cần thao tác
 * @return Kết quả trả về: popt=1 _ID của dữ liệu được thêm, popt=2,3,4 ROW_COUNT số dòng được cập nhật ;
 */
export const instnguoidung = async (
  pUser: string,
  pOpt: string,
  user: IUserItem
) => {
  try {
    // console.log("=======debug update user==================", "");
    // console.log("puser", pUser);
    // console.log("popt", pOpt);
    // console.log("user", user);
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pins_tnguoidung",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "cid", paraValue: user.cid },
        { paraName: "ctaikhoan", paraValue: user.ctaikhoan },
        { paraName: "choten", paraValue: user.choten },
        { paraName: "cngaysinh", paraValue: user.cngaysinh },
        { paraName: "cmadonvi", paraValue: user.cmadonvi },
        { paraName: "cmanhomnguoidung", paraValue: user.cmanhomnguoidung },
        { paraName: "cdiachi", paraValue: user.cdiachi },
        { paraName: "cdienthoai", paraValue: user.cdienthoai },
        { paraName: "ccchn", paraValue: user.ccchn },
        { paraName: "cemail", paraValue: user.cemail },
        { paraName: "cchucdanh", paraValue: user.cchucdanh },
        { paraName: "cghichu", paraValue: user.cghichu },
        {
          paraName: "cmatkhau",
          paraValue: (await sha256(user.cmatkhau)).toString(),
        },
        { paraName: "cxacthuc2lop", paraValue: user.cxacthuc2lop },
        { paraName: "ctrangthai", paraValue: user.ctrangthai },
      ],
    });
    //console.log("instnguoidung response:", response);
    if (response.status === "error") {
      return [];
    }

    return response.message;
  } catch {
    return [];
  }
};

export const instnguoidungdoimatkhau = async (
  pUser: string,
  pOpt: string,
  user: { userid: string; oldPassword: string; newPassword: string }
) => {
  try {
    // console.log("ctaikhoan:", pUser);
    // console.log("popt:", pOpt);
    // console.log("userid:", user.userid);
    // console.log("old:", user.oldPassword);
    // console.log("oldhash:", (await sha256(user.oldPassword)).toString());
    // console.log("new:", user.newPassword);
    // console.log("newhash:", (await sha256(user.newPassword)).toString());
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pins_tnguoidung_doimatkhau",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "cid", paraValue: user.userid },
        {
          paraName: "cmatkhaucu",
          paraValue: (await sha256(user.oldPassword)).toString(),
        },
        {
          paraName: "cmatkhau",
          paraValue: (await sha256(user.newPassword)).toString(),
        },
      ],
    });
    if (response.status === "error") {
      return [];
    }
    //console.log("instnguoidungdoimatkhau response:", response);
    return response.message;
  } catch {
    //console.log("instnguoidungdoimatkhau error:", error);
    return [];
  }
};

export const gettnguoidung = async (pUser: string, pOpt: string) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pget_tnguoidung",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt }, // 1: Lấy thông tin người dùng
        { paraName: "ctaikhoan", paraValue: "0" },
        { paraName: "cmatkhau", paraValue: "0" },
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

export const gettnhatkynguoidung = async (
  pUser: string,
  pOpt: string,
  sTuNgay: string,
  sDenNgay: string
) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pget_tnhatkynguoidung",
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

export const gettnhomnguoidung = async (pUser: string, pOpt: string) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pget_tnhomnguoidung",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
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
/**
 * Hàm đăng nhập
 * @param username Tên đăng nhập
 * @param password Mật khẩu
 * @returns Kết quả đăng nhập
 */
export const login = async (username: string, password: string) => {
  try {
    const response = await post(`/api/Auth/login`, {
      Username: username,
      Password: password,
    });
    return response.token
      ? { status: "success", token: response.token }
      : { status: "error", message: response.message };
  } catch {
    return {
      status: "error",
      message: "Đăng nhập thất bại. Vui lòng thử lại.",
    };
  }
};

export const getphanquyenbakhoa = async (
  pUser: string,
  pOpt: string,
  ctaikhoan: string
) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pget_tphanquyenbakhoa",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "ctaikhoan", paraValue: ctaikhoan },
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

export const luuphanquyenbakhoa = async (
  pUser: string,
  pOpt: string,
  ctaikhoan: string,
  cmakhoa: string,
  ctrangthai: string
) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pins_tphanquyenbakhoa",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "ctaikhoan", paraValue: ctaikhoan },
        { paraName: "cmakhoa", paraValue: cmakhoa },
        { paraName: "ctrangthai", paraValue: ctrangthai },
        { paraName: "cnguoitao", paraValue: pUser },
        { paraName: "cnguoicapnhat", paraValue: pUser },
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

export const getphanquyenmenu = async (
  pUser: string,
  pOpt: string,
  ctaikhoan: string
) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pget_tphanquyenmenu",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "ctaikhoan", paraValue: ctaikhoan },
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

export const luuphanquyenmenu = async (
  pUser: string,
  pOpt: string,
  ctaikhoan: string,
  cmenu: number,
  ctrangthai: string
) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pins_tphanquyenmenu",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "ctaikhoan", paraValue: ctaikhoan },
        { paraName: "cmenu", paraValue: cmenu },
        { paraName: "ctrangthai", paraValue: ctrangthai },
        { paraName: "cnguoitao", paraValue: pUser },
        { paraName: "cnguoicapnhat", paraValue: pUser },
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

export const getphanquyenba = async (
  pUser: string,
  pOpt: string,
  ctaikhoan: string,
  KhoaDieuTri: string,
  TuNgay: string,
  DenNgay: string
) => {
  try {
    // console.log("puser:", pUser);
    // console.log("popt:", pOpt);
    // console.log("ctaikhoan:", ctaikhoan);
    // console.log("KhoaDieuTri:", KhoaDieuTri);
    // console.log("TuNgay:", TuNgay);
    // console.log("DenNgay:", DenNgay);
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pget_tphanquyenba",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "ctaikhoan", paraValue: ctaikhoan },
        { paraName: "KhoaDieuTri", paraValue: KhoaDieuTri },
        { paraName: "TuNgay", paraValue: TuNgay },
        { paraName: "DenNgay", paraValue: DenNgay },
      ],
    });
    //console.log("getphanquyenba response:", response);
    if (response.status === "error") {
      return [];
    }

    return response.message;
  } catch {
    return [];
  }
};

export const getphanquyenbaDSSovaovien = async (
  pUser: string,
  pOpt: string,
  DSSovaovien: string,
  TuNgay: string,
  DenNgay: string
) => {
  try {
    //console.log("Fetching HoSoBenhAn...");
    // Gọi API để lấy danh sách hồ sơ bệnh án
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pget_tphanquyenba_DSSovaovien",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "DSSovaovien", paraValue: DSSovaovien },
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
export const luuphanquyenba = async (
  pUser: string,
  pOpt: string,
  ctaikhoan: string,
  cmaba: string,
  ctrangthai: string
) => {
  try {
    // console.log("puser:", pUser);
    // console.log("popt:", pOpt);
    // console.log("ctaikhoan:", ctaikhoan);
    // console.log("cmaba:", cmaba);
    // console.log("ctrangthai:", ctrangthai);
    // console.log("cnguoitao:", pUser);
    // console.log("cnguoicapnhat:", pUser);
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pins_tphanquyenba",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "ctaikhoan", paraValue: ctaikhoan },
        { paraName: "cmaba", paraValue: cmaba },
        { paraName: "ctrangthai", paraValue: ctrangthai },
        { paraName: "cnguoitao", paraValue: pUser },
        { paraName: "cnguoicapnhat", paraValue: pUser },
      ],
    });
    // console.log("luuphanquyenba response:", response);
    if (response.status === "error") {
      return [];
    }

    return response.message;
  } catch {
    return [];
  }
};

export const luuanhnguoidung = async (
  pUser: string,
  pOpt: string,
  cid: number,
  ctaikhoan: string,
  choten: string,
  cimg: string
) => {
  try {
    // console.log("puser:", pUser);
    // console.log("popt:", pOpt);
    // console.log("cid:", cid);
    // console.log("ctaikhoan:", ctaikhoan);
    // console.log("choten:", choten);
    const response = await post(`/api/callService`, {
      userId: "",
      optionId: "1",
      funcName: "dbo.emr_pins_tnguoidung_img",
      paraData: [
        { paraName: "puser", paraValue: pUser },
        { paraName: "popt", paraValue: pOpt },
        { paraName: "cid", paraValue: cid },
        { paraName: "ctaikhoan", paraValue: ctaikhoan },
        { paraName: "choten", paraValue: choten },
        { paraName: "cimg", paraValue: cimg },
      ],
    });
    console.log("luuanhnguoidung response:", response);
    //console.log("luuanhnguoidung responselenght:[", response.message.length,"]");
    if (response.status === "error") {
      return [];
    }
    return response.message;
  } catch {
    return [];
  }
}; 

export async function sendOTP(phoneNumber: string) {
  try {
    const response = await fetch("/api/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      throw new Error("Failed to send OTP");
    }

    return await response.json();
  } catch (error) {
    // console.error("Error sending OTP:", error);
    throw error;
  }
}

export async function verifyOTP(otp: string, storedOtp: string) {
  // Verify OTP locally or call API
  return {
    status: otp === storedOtp ? "success" : "error",
  };
}