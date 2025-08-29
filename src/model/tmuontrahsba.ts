export interface ITMuonTraHSBA {
  cid: number;
  cmabenhan?: string | null;
  cthaotac?: string | null; //  -- 'MUON','TRA'
  cngaythaotac?: string | null;
  cnguoithaotac?: string | null;
  cngaytradukien?: string | null;
  cnguoimuon?: string | null;
  ctennguoimuon?: string | null;
  cghichumuon?: string | null;
  cngaytra?: string | null;
  cghichutra?: string | null;
  ctrangthaitra?: string | null; // -- '0' là chưa trả, '1' là đã trả
  MaBN: string | null;
  Hoten: string | null;
  Ngaysinh: string | null;
  Gioitinh: string | null;
  Dienthoai: string | null;
  Diachi: string | null;
  SoCCCD: string | null;
  SoNhapVien: string | null;
  SoVaoVien: string | null;
  SoLuuTru: string | null;
  KhoaVaoVien: string | null;
  KhoaDieuTri: string | null;
  TenKhoaDieuTri: string | null;
  NgayVao: string | null;
  NgayRa: string | null;
  LoaiBenhAn: string | null;
}
