export interface IPatientInfo {
  Ma: string;
  Hoten: string;
  Ngaysinh: string;
  Thangsinh: string;
  Namsinh: string;
  Gioitinh: string;
  Diachi: string;
  Dienthoai: string;
  SoCMND: string;
}

export interface IPatientInfoCanKyTay {
  Ma: string;
  Sovaovien: string;
  Hoten: string;
  Ngaysinh: string;
  Thangsinh: string;
  Namsinh: string;
  Gioitinh: string;
  Diachi: string;
  Dienthoai: string;
  SoCMND: string;
  TaiLieuKy: string;
  FilePdfKySo: string;
  LoaiPhieu: string;
  ID: number;
}

export interface IPatientInfoCanKyTayGroup {
  key: string;
  Ma: string;
  Hoten: string;
  Gioitinh: string;
  Namsinh: number;
  children: IPatientInfoCanKyTay[];
}

export interface IPatientLichSuKham {
  MaBN: string;
  SoVaoVien: string;
  TGVao: string;
  TGRa: string;
  VVIET_ChanDoanChinh: string;
}

export interface IPatientChiDinh {
  ID: string;
  ID_Toa: string;
  Ma: string;
  Ten: string;
  Ngay: string;
  TGKetoa: string;
  TGCapthuoc: string;
  FilePdfKySo: string;
  TenLoaiPhieuY: string;
}

export interface IPatientToaThuoc {
  ID: string;
  ID_Toa: string;
  Ma: string;
  Ten: string;
  Ngay: string;
  TGKetoa: string;
  TGCapthuoc: string;
  FilePdfKySo: string;
  TenLoaiPhieuY: string;
}

export interface IPatientBangKe {
  ID: string;
  ID_Toa: string;
  Ma: string;
  Ten: string;
  Ngay: string;
  TGKetoa: string;
  TGCapthuoc: string;
  FilePdfKySo: string;
  TenLoaiPhieuY: string;
}

export interface IPatientPkBenh {
  ID: string;
  ID_Toa: string;
  Ma: string;
  Ten: string;
  Ngay: string;
  TGKetoa: string;
  TGCapthuoc: string;
  FilePdfKySo: string;
  TenLoaiPhieuY: string;
}
