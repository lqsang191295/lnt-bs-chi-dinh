import { post } from "@/api/client";
import { IUserItem } from "@/model/user";
import { sha256 } from "@/utils/auth";
 
/** * Hàm thực hiện các thao tác với người dùng
 * @param pUser Tên người dùng thực hiện thao tác
 * @param pOpt Loại thao tác (1 thêm, 2 sửa, 3 xóa, 4 đổi mật khẩu )
 * @param user Thông tin người dùng cần thao tác      
 * @return Kết quả trả về popt=1 @@IDENTITY  as  _ID của dữ liệu được thêm, popt=2,3,4 @@ROWCOUNT  as  số dòng được cập nhật ;
  */
export const instnguoidung = async (pUser: string, pOpt: string, user:IUserItem) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
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
        { paraName: "cmatkhau", paraValue: sha256(user.cmatkhau)},
        { paraName: "cxacthuc2lop", paraValue: user.cxacthuc2lop },
        { paraName: "ctrangthai", paraValue: user.ctrangthai },
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

export const gettnguoidung = async (pUser: string, pOpt: string) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
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

export const gettnhomnguoidung = async (pUser: string, pOpt: string) => {
  try {
    const response = await post(`/api/callService`, {
      userId: "",
      option: "",
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
    return  response.token ? { status: "success", token: response.token } : { status: "error", message: response.message }  ;
  } catch (error) {
    return { status: "error", message: "Đăng nhập thất bại. Vui lòng thử lại." }; 
  }
};

