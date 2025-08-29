import { post } from "@/api/client";
import { IPatientInfo, IPatientLichSuKham } from "@/model/tpatient";

export const getPatientInfoByMaBN = async (
  mabn: string,
  sovaovien: string = ""
): Promise<IPatientInfo | null> => {
  try {
    const response = await post(`/his/call`, {
      userId: "",
      option: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 0 },
        { paraName: "mabn", paraValue: mabn },
        { paraName: "sovaovien", paraValue: sovaovien },
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
      option: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 1 },
        { paraName: "mabn", paraValue: mabn },
        { paraName: "sovaovien", paraValue: sovaovien },
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
      option: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 3 },
        { paraName: "mabn", paraValue: mabn },
        { paraName: "sovaovien", paraValue: sovaovien },
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
      option: "",
      funcName: "dbo.emr_pget_parientinfo_by_mabn",
      paraData: [
        { paraName: "popt", paraValue: 2 },
        { paraName: "mabn", paraValue: mabn },
        { paraName: "sovaovien", paraValue: sovaovien },
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
