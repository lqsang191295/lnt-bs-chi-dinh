export interface IUserItem {
  cid: string; // ID user
  ctaikhoan: string; // Tài khoản
  choten: string; // Họ tên
  cngaysinh: string; // Ngày sinh
  cmadonvi: string; // Mã đơn vị
  cmanhomnguoidung: string; // Mã nhóm người dùng
  cdiachi: string; // Địa chỉ
  cdienthoai: string; // Điện thoại
  ccchn: string; // CCHN
  cemail: string; // Email
  cchucdanh: string; // Chức danh
  cghichu: string; // Ghi chú
  cmatkhau: string; // Mật khẩu
  cxacthuc2lop: string; // Xác thực 2 lớp
  ctrangthai: number | string; // Trạng thái
  cngaytao: string; // Ngày tạo
}

export interface IPatientOtp {
  phone: number;
  logged: boolean;
  loginAt: Date;
}
