export interface IBenhNhan {
  id?: number;
  maBN: string; // Mã bệnh nhân
  hoTen: string;
  cccd: string;
  ngaySinh: string;
  gioiTinh: "Nam" | "Nữ" | "Khác";
  soDienThoai: string;
  diaChi: string;
  ngayTao?: string;
  trangThai?: number; // 1: Hoạt động, 0: Không hoạt động
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

export interface ITimKiemBenhNhan {
  cccd?: string;
  soDienThoai?: string;
  hoTen?: string;
}

export interface IPhieuDangKy {
  maPhieu: string;
  ngayDangKy: string;
  gioDangKy: string;
  trangThai: number;
  benhNhan: IBenhNhan;
}

export interface IResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
  error?: string;
}
