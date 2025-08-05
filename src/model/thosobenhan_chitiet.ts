export interface IHoSoBenhAnChiTiet {
  ID: number;
  Stt?: number | null;
  MaBN?: string | null;
  SoVaoVien?: string | null;
  MoTaTaiLieuKy?: string | null;
  TaiLieuKy?: Uint8Array | null; // varbinary(MAX)
  ThoiGianKy?: string | null;
  TRANGTHAI?: number | null;
  ID_SUDUNG?: string | null;
  LoaiPhieu?: string | null;
  FilePdfKySo?: string | null;
  BsKy?: string | null;
  TkBsKy?: string | null;
  DieuDuongKy?: string | null;
  TkDieuDuongKy?: string | null;
  TruongKhoaKy?: string | null;
  TkTruongKhoaKy?: string | null;
  GiamDocKy?: string | null;
  TkGiamDocKy?: string | null;
  BsLamBenhAnKy?: string | null;
  TkBsLamBenhAnKy?: string | null;
  BsDieuTriKy?: string | null;
  TkBsDieuTriKy?: string | null;
}