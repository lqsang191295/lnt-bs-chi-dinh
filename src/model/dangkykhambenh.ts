export interface PatientInfo {
  id?: string // ID nội bộ
  fullname: string // Họ tên
  phone: string // Số điện thoại
  address: string // Địa chỉ
  birthDate?: Date // DD-MM-YYYY
  birthDateString?: string // DD-MM-YYYY
  gender: string // Nam/Nữ
  idNumber: string // Số CMND/CCCD
  insuranceNumber?: string // Số thẻ BHYT
  queueNumber?: string // Số thứ tự
  registrationTime?: string // Thời gian đăng ký
  chiefComplaint?: string // Lý do khám
  quay?: string // Quầy đăng ký
  anh?: string // Ảnh bệnh nhân (base64)
}
export interface BV_QlyCapThe{
  Ma: string;
  Hoten: string;
  Birthday: string;
  Gioitinh: string;
  SoCMND: string;
  SoBHYT: string;
  Dienthoai: string;
  Diachi: string;
}
export interface IQueueNumber {
  SoThuTu: string; // Số thứ tự
}

export interface ICurrentQueueNumber {
  MaQuay: string;
  Hoten: string; 
  NamSinh: number; 
  STT: number;
}

export interface IDangKyKhamBenh {
  id?: number;
  maBN: string;
  maPhieu: string; // Mã phiếu đăng ký
  ngayDangKy: string;
  gioDangKy: string;
  lyDoKham: string;
  trangThai: number; // 1: Chờ khám, 2: Đang khám, 3: Hoàn thành, 4: Hủy
  ghiChu?: string;
  nguoiDangKy?: string;
  ngayTao?: string;
}

export interface IPhieuDangKy {
  maPhieu: string;
  ngayDangKy: string;
  gioDangKy: string;
  trangThai: number;
  benhNhan: PatientInfo;
}

export interface IResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
  error?: string;
}

export interface ErrorDialog {
  open: boolean
  title: string
  message: string
  type: "error" | "warning" | "info"
}
