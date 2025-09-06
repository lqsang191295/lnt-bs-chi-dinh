import { post, postExternal } from "@/api/client";
import { 
  PatientInfo, 
  ICurrentQueueNumber, 
  IQueueNumber,
  IResponse,
  BV_QlyCapThe,
  APIKey
} from "@/model/dangkykhambenh";
import { IDMQuayDangKy } from "@/model/tsothutuhientai";
import {ObBHXH} from "@/model/baohiemxahoimodel";

// lấy danh sách quầy đăng ký
export const getDM_QuayDangKy = async (): Promise<IDMQuayDangKy[]> => {
  try {
    const response = await post(`/his/call`, {
      funcName: "dbo.sp_get_HT_DMQuayDangKy"
    });

    if (response.status === "error") {
      return [];
    }
    return response.message || "";
  } catch (error) {
    console.error("Lỗi tìm kiếm bệnh nhân:", error);
    return [];
  }
};
// lấy danh sách bệnh nhân hiện tại ở các quầy
export const fetchCurrentQueueNumbers = async (): Promise<IResponse<ICurrentQueueNumber[]>> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      option: "",
      funcName: "dbo.sp_get_danhsachdangkyhientai_trangthai",
      paraData: [],
    });
    if (response.status === "error") {
      return {
        status: "error",
        message: response.message || "Lỗi lấy số thứ tự hiện tại",
        error: response.message
      };
    }
    return {
      status: "success",
      message: "Lấy số thứ tự hiện tại thành công",
      data: response.message
    };
  } catch (error) {
    console.error("Lỗi lấy số thứ tự hiện tại:", error);
    return {
      status: "error",
      message: "Lỗi hệ thống khi lấy số thứ tự hiện tại",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
export const getTokenBHXH = async (): Promise<APIKey | null>=> {
  try{
    const respone = await postExternal(`https://egw.baohiemxahoi.gov.vn/api/token/take`, {
      Username: "72122_BV",
      Password: "9FBEE874F62B8D7B486EFE31CC9E178B"
    })
    if (respone.maKetQua === "200"){
      return respone.APIKey
    }
    console.error("getTokenBHXH respone", respone)
    return null;
  }
  catch (ex){
    console.error("getTokenBHXH exeption", ex);
    return null;
  }
}
export const CheckBHXHByPatientInfo = async (hoten: string, cccd: string, ngaysinh: string): Promise<ObBHXH | null> => {
  try {
    const responeAPIKey = await postExternal(`https://egw.baohiemxahoi.gov.vn/api/token/take`, {
      Username: "72122_BV",
      Password: "9FBEE874F62B8D7B486EFE31CC9E178B"
    })
    if (responeAPIKey.maKetQua === "200"){
      const apiUrl = `https://egw.baohiemxahoi.gov.vn/api/egw/KQNhanLichSuKCB2024?token=${responeAPIKey.APIKey.access_token}&id_token=${responeAPIKey.APIKey.id_token}&username=${responeAPIKey.APIKey.username}&password=9FBEE874F62B8D7B486EFE31CC9E178B`;
      const response = await postExternal(apiUrl, {
        maThe: cccd,
        hoTen: hoten,
        ngaySinh: ngaysinh.split("/")[2],
        hoTenCb: "Nguyễn Thảo Chi",
        cccdCb: "072188004365"
      });
      return response
    }
    return null;
  }
  catch (ex){
    console.error("Lỗi tìm kiếm bệnh nhân:", ex);
    return null;
  }
}

// Tìm kiếm bệnh nhân theo CCCD hoặc số điện thoại
export const searchPatientInfoByType = async (params: string, type: number): Promise<BV_QlyCapThe[]> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      option: "",
      funcName: "dbo.sp_get_benhnhan_search",
      paraData: [
        { paraName: "search", paraValue: params || "" },
        { paraName: "type", paraValue: type || "" },
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
export const searchByBHYTCode = async (params: string): Promise<PatientInfo[]> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      option: "",
      funcName: "dbo.sp_search_bhyt",
      paraData: [
        { paraName: "bhyt", paraValue: params || "" }
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

// Đăng ký khám bệnh
export const dangKyKhamBenh = async (dangKy: PatientInfo): Promise<IResponse<IQueueNumber[]>> => {
  try {
    console.log("dk",dangKy )
    const response = await post(`/his/call`, {
      userId: "",
      option: "",
      funcName: "dbo.sp_BV_DangKyLaySo",
      paraData: [
        { paraName: "hoten", paraValue: dangKy.fullname },
        { paraName: "cccd", paraValue: dangKy.idNumber || null },
        { paraName: "ngaysinh", paraValue: dangKy.birthDate ? dangKy.birthDate.getDate() : null },
        { paraName: "thangsinh", paraValue: dangKy.birthDate ? (dangKy.birthDate.getMonth() + 1).toString().padStart(2, '0') : null },
        { paraName: "namsinh", paraValue: dangKy.birthDate ? dangKy.birthDate.getFullYear().toString() : null },
        { paraName: "gioitinh", paraValue: dangKy.gender || null },
        { paraName: "diachi", paraValue: dangKy.address || null },
        { paraName: "dienthoai", paraValue: dangKy.phone || null },
        { paraName: "bhyt", paraValue: dangKy.insuranceNumber || null },
        { paraName: "quay", paraValue: dangKy.quay || null },
        { paraName: "lydokham", paraValue: dangKy.chiefComplaint || null },
        { paraName: "anhBN", paraValue: dangKy.anh || null },
      ],
    });
    console.log("Response đăng ký khám bệnh:", response);
    if (response.message === null || response.message === undefined) {
      return {
        status: "error",
        message: "Lỗi đăng ký khám bệnh, vui lòng liên hệ quầy đăng ký để được hỗ trợ.",
        error: "Lỗi"
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

