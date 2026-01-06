import { post } from "@/api/client";
import { IPatientInfo, IPatientLichSuKham } from "@/model/tpatient";

export const getPatientInfoByMaBN = async (
  mabn: string,
  sovaovien: string = ""
): Promise<IPatientInfo | null> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 0 },
        { paraName: "mabn", paraValue: mabn },
        { paraName: "sovaovien", paraValue: sovaovien },
        { paraName: "sdt", paraValue: null },
      ],
    });

    if (response.status === "error") {
      return null;
    }

    const result = response.message;

    if (Array.isArray(result) && result.length > 0) {
      return result[0] as IPatientInfo;
    }

    return response.message;
  } catch {
    return null;
  }
};

export const getPatientLichSuKhamByMaBN = async (
  mabn: string,
  sovaovien: string = ""
): Promise<IPatientLichSuKham[] | null> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 1 },
        { paraName: "mabn", paraValue: mabn },
        { paraName: "sovaovien", paraValue: sovaovien },
        { paraName: "sdt", paraValue: null },
      ],
    });

    if (response.status === "error") {
      return null;
    }
    return response.message;
  } catch {
    return null;
  }
};

export const getPatientToaThuocByMaBN_SoVaoVien = async (
  mabn: string,
  sovaovien: string
) => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 3 },
        { paraName: "mabn", paraValue: mabn },
        { paraName: "sovaovien", paraValue: sovaovien },
        { paraName: "sdt", paraValue: null },
      ],
    });

    if (response.status === "error") {
      return null;
    }
    return response.message;
  } catch {
    return null;
  }
};

export const getPatientChiDinhByMaBN_SoVaoVien = async (
  mabn: string,
  sovaovien: string
) => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 2 },
        { paraName: "mabn", paraValue: mabn },
        { paraName: "sovaovien", paraValue: sovaovien },
        { paraName: "sdt", paraValue: null },
      ],
    });

    if (response.status === "error") {
      return null;
    }
    return response.message;
  } catch {
    return null;
  }
};

export const getPatientBangKeByMaBN_SoVaoVien = async (
  mabn: string,
  sovaovien: string
) => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 4 },
        { paraName: "mabn", paraValue: mabn },
        { paraName: "sovaovien", paraValue: sovaovien },
        { paraName: "sdt", paraValue: null },
      ],
    });

    if (response.status === "error") {
      return null;
    }
    return response.message;
  } catch {
    return null;
  }
};

export const getPatientPkBenhByMaBN_SoVaoVien = async (
  mabn: string,
  sovaovien: string
) => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 5 },
        { paraName: "mabn", paraValue: mabn },
        { paraName: "sovaovien", paraValue: sovaovien },
        { paraName: "sdt", paraValue: null },
      ],
    });

    if (response.status === "error") {
      return null;
    }
    return response.message;
  } catch {
    return null;
  }
};

export const getPatientBySoDienThoai = async (
  sodienthoai: string
): Promise<IPatientInfo[] | null> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 6 },
        { paraName: "mabn", paraValue: null },
        { paraName: "sdt", paraValue: sodienthoai },
        { paraName: "sovaovien", paraValue: null },
      ],
    });

    if (response.status === "error") {
      return null;
    }
    return response.message;
  } catch {
    return null;
  }
};

export const searchPartient = async (
  textSearch: string
): Promise<IPatientInfo[] | null> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "2",
      funcName: "dbo.emr_psearch_patient",
      paraData: [
        { paraName: "popt", paraValue: "0" },
        { paraName: "puser", paraValue: "0" },
        { paraName: "textSearch", paraValue: textSearch },
      ],
    });

    if (response.status === "error") {
      return null;
    }

    return response.message;
  } catch {
    return null;
  }
};

export const saveChuKyPartient = async (
  Ma: string,
  ChuKy: string
): Promise<void> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      optionId: "2",
      funcName: "dbo.sp_Act_BV_ChuKy",
      paraData: [
        { paraName: "popt", paraValue: 1 },
        { paraName: "Ma", paraValue: Ma },
        { paraName: "ChuKy", paraValue: ChuKy },
      ],
    });

    if (response.status === "error") {
      return;
    }

    return response.message;
  } catch {
    return;
  }
};
