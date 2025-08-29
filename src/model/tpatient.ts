export interface IPatientInfo {
  Hoten: string;
  Ngaysinh: string;
  Thangsinh: string;
  Namsinh: string;
  Gioitinh: string;
  Diachi: string;
  Dienthoai: string;
  SoCMND: string;
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
