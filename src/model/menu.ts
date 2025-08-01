export interface IMenuItem {
  cid: number; // ID menu
  cthutu: number; // Thứ tự hiển thị
  cmamenu: string; // Mã menu
  ctenmenu: string; // Tên menu
  clink: string; // Link điều hướng
  ccap: number; // Cấp độ menu (0: gốc, 1: con, ...)
  cidcha: number; // ID menu cha (null nếu là menu gốc)
  ctrangthai: number; // Trạng thái hiển thị (1: hiển thị, 0: ẩn)
}

export interface IMenuTree extends IMenuItem {
  children?: IMenuTree[];
}
