// app/ket-xuat-hsba/page.tsx
"use client";

import {
  getChiTietHSBA,
  getHosobenhan,
  getnhatkyketxuatba,
  ketxuathosobenhan,
} from "@/actions/act_thosobenhan";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import HeadMetadata from "@/components/HeadMetadata";
import { PdfComponents } from "@/components/pdfComponents"; // Import PdfComponents
import { IPDFItem } from "@/model/ipdf";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { IHoSoBenhAnChiTiet } from "@/model/thosobenhan_chitiet";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useMenuStore } from "@/store/menu";
import { useUserStore } from "@/store/user";
import { mergePDFsWithProgress } from "@/utils/pdfLibs";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";
import { Download, NoteAdd, Refresh, Search } from "@mui/icons-material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import * as XLSX from 'xlsx';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

// Cập nhật interface cho dữ liệu lịch sử kết xuất
interface INhatKyKetXuat {
  cid: number;
  cmabenhan: string;
  ctaikhoan: string;
  choten: string;
  cngaysinh: string;
  cdiachi: string;
  cdienthoai: string;
  SoBenhAn: string;
  MaBN: string;
  Hoten: string;
  Ngaysinh: string;
  Gioitinh: string;
  Dienthoai: string;
  Diachi: string;
  SoCCCD: string;
  SoNhapVien: string;
  SoVaoVien: string;
  SoLuuTru: string;
  KhoaVaoVien: string;
  KhoaDieuTri: string;
  cnoidungketxuat: string; // Base64 PDF content
  cngayketxuat: string;
  tngayketxuat: string; // Formatted date
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      className="p-0 w-full h-full overflow-hidden"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && (
        <Box className="w-full h-full flex flex-col">{children}</Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

// ----------------- COMPONENT -----------------
export default function KetXuatHsbaPage() {
  const router = useRouter();
  // State quản lý các giá trị
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = React.useState(0);
  const [selectedRows, setSelectedRows] = useState<IHoSoBenhAn[]>([]);
  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [selectedKhoa, setSelectedKhoa] = useState("all");
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<IHoSoBenhAn[]>([]);
  // Thêm state cho lịch sử kết xuất
  const [lichSuRows, setLichSuRows] = useState<INhatKyKetXuat[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện
  const { data: loginedUser } = useUserStore();
  const { data: menuData } = useMenuStore();
  const [searchingData, setSearchingData] = useState<boolean>(false);
  const [searchingLichSu, setSearchingLichSu] = useState<boolean>(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const checkAccess = () => {
      // Kiểm tra xem có quyền truy cập trang "ket-xuat-hsba" không
      if (menuData.find((item) => item.clink === "ket-xuat-hsba")) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
        // Không redirect, chỉ set hasAccess = false để hiển thị AccessDeniedPage
      }
      setIsCheckingAccess(false);
    };

    // Chỉ kiểm tra khi đã có dữ liệu từ store
    if (loginedUser && menuData !== undefined) {
      checkAccess();
    }
  }, [menuData, loginedUser, router]);

  // Sử dụng PdfComponents hook
  const { downloadPdf, isLoading: pdfLoading } = PdfComponents(
    useMemo(
      () => ({
        onSuccess: (message: string) => {
          ToastSuccess(message);
        },
        onError: (error: string) => {
          ToastError(error);
        },
      }),
      []
    )
  );
  // Hàm xử lý export Excel cho tab Lịch sử
  const handleExportExcel = () => {
    if (lichSuRows.length === 0) {
      ToastError("Không có dữ liệu để export");
      return;
    }

    try {
      // Chuẩn bị dữ liệu cho Excel
      const exportData = lichSuRows.map(item => ({
        'Mã BA': item.cmabenhan,
        'Số vào viện': item.SoVaoVien,
        'Họ tên': item.Hoten,
        'Ngày sinh': item.Ngaysinh,
        'Giới tính': item.Gioitinh,
        'Địa chỉ': item.Diachi,
        'Ngày Kết xuất': item.cngayketxuat, 
        'Khoa điều trị': item.KhoaDieuTri, 
      }));

      // Tạo workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "HSBA");

      // Auto-size columns
      const colWidths = [
        { wch: 10 }, // Mã BA
        { wch: 15 }, // Số vào viện
        { wch: 25 }, // Họ tên
        { wch: 12 }, // Ngày sinh
        { wch: 10 }, // Giới tính
        { wch: 30 }, // Địa chỉ
        { wch: 12 }, // Ngày vào 
        { wch: 20 }, // Khoa điều trị 
      ];
      ws['!cols'] = colWidths;

      // Tạo tên file với timestamp
      const now = new Date();
      const timestamp = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');
      
      const fileName = `hsba_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);
      
      ToastSuccess(`Đã export thành công file ${fileName}`);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      ToastError("Lỗi khi export Excel");
    }
  };

  // Hàm xử lý download PDF cho tab Kết xuất
  const handleDownload = useCallback(
    (hsba: IHoSoBenhAn) => {
      if (!hasAccess) return;

      if (!hsba.NoiDungPdf) {
        ToastWarning("Hồ sơ bệnh án chưa được kết xuất PDF!");
        return;
      }

      if (Number(hsba.TrangThaiKetXuat) !== 1) {
        ToastWarning("Hồ sơ này chưa được kết xuất!");
        return;
      }

      const fileName = `HSBA_${hsba.MaBN}_${hsba.SoVaoVien}`;
      downloadPdf(hsba.NoiDungPdf, fileName);
    },
    [downloadPdf, hasAccess]
  );

  // Hàm xử lý download PDF cho lịch sử
  const handleDownloadLichSu = useCallback(
    (lichSu: INhatKyKetXuat) => {
      if (!hasAccess) return;

      if (!lichSu.cnoidungketxuat) {
        ToastWarning("Không có nội dung PDF để tải xuống!");
        return;
      }

      const fileName = `HSBA_${lichSu.MaBN || lichSu.cmabenhan}_${
        lichSu.SoVaoVien || "NA"
      }`;
      downloadPdf(lichSu.cnoidungketxuat, fileName);
    },
    [downloadPdf, hasAccess]
  );

  // Columns cho tab Kết xuất
  const columnsKetXuat: GridColDef[] = useMemo(
    () => [
      { field: "ID", headerName: "ID", width: 60 },
      {
        field: "TrangThaiKetXuat",
        headerName: "Trạng thái",
        width: 120,
        renderCell: (params) => (
          <Box
            sx={{
              backgroundColor: "transparent",
              color: params.value === 1 ? "#4caf50" : "#ff9800",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: params.value === 1 ? "bold" : "normal",
              textAlign: "center",
              minWidth: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}>
            {params.value === 1 ? (
              <>
                <FileDownloadOutlinedIcon sx={{ fontSize: "14px" }} />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row selection
                    handleDownload(params.row);
                  }}
                  disabled={pdfLoading || !params.row.NoiDungPdf}
                  sx={{
                    color: "inherit",
                    fontSize: "12px",
                    fontWeight: "bold",
                    p: 0.5,
                    "&:hover": {
                      backgroundColor: "rgba(76, 175, 80, 0.1)",
                    },
                  }}
                  title={
                    !params.row.NoiDungPdf
                      ? "Không có dữ liệu PDF"
                      : pdfLoading
                      ? "Đang tải..."
                      : "Tải xuống PDF"
                  }>
                  {pdfLoading ? "..." : "Tải xuống"}
                </IconButton>
              </>
            ) : (
              <>
                <KeyboardArrowDownOutlinedIcon sx={{ fontSize: "14px" }} />
                Chưa kết xuất
              </>
            )}
          </Box>
        ),
      },
      { field: "Hoten", headerName: "Họ và tên", width: 200 },
      { field: "MaBN", headerName: "Mã BN", width: 130 },
      { field: "Ngaysinh", headerName: "Ngày sinh", width: 130 },
      { field: "SoVaoVien", headerName: "Số vào viện", width: 130 },
      { field: "NgayVao", headerName: "Ngày vào viện", width: 130 },
      { field: "NgayRa", headerName: "Ngày ra viện", width: 130 },
      { field: "KhoaVaoVien", headerName: "Khoa nhập viện", width: 100 },
      { field: "KhoaDieuTri", headerName: "Khoa điều trị", width: 200 },
      { field: "LoaiBenhAn", headerName: "Loại BA", width: 130 },
      { field: "BsDieuTriKyTen", headerName: "Bác sĩ điều trị", width: 130 },
      { field: "SoLuuTru", headerName: "Số lưu trữ", width: 100 },
      { field: "NgayLuuTru", headerName: "Ngày lưu trữ", width: 100 },
      { field: "ViTriLuuTru", headerName: "Vị trí lưu trữ", width: 150 },
      { field: "TenLoaiLuuTru", headerName: "Loại lưu trữ", width: 200 },
      { field: "SoNamLuuTru", headerName: "Số năm lưu trữ", width: 150 },
    ],
    [handleDownload, pdfLoading]
  );

  // Columns cho tab Lịch sử
  const columnsLichSu: GridColDef[] = useMemo(
    () => [
      { field: "cid", headerName: "ID", width: 60 },
      {
        field: "cnoidungketxuat",
        headerName: "Trạng thái",
        width: 120,
        renderCell: (params) => (
          <Box
            sx={{
              backgroundColor: "transparent",
              color: "#4caf50",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              textAlign: "center",
              minWidth: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              cursor: "pointer",
            }}>
            <FileDownloadOutlinedIcon sx={{ fontSize: "14px" }} />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row selection
                handleDownloadLichSu(params.row);
              }}
              disabled={pdfLoading || !params.row.cnoidungketxuat}
              sx={{
                color: "inherit",
                fontSize: "12px",
                fontWeight: "bold",
                p: 0.5,
                "&:hover": {
                  backgroundColor: "rgba(76, 175, 80, 0.1)",
                },
              }}
              title={
                !params.row.cnoidungketxuat
                  ? "Không có dữ liệu PDF"
                  : pdfLoading
                  ? "Đang tải..."
                  : "Tải xuống PDF"
              }>
              {pdfLoading ? "..." : "Tải xuống"}
            </IconButton>
          </Box>
        ),
      },
      { field: "cmabenhan", headerName: "Mã bệnh án", width: 130 },
      { field: "Hoten", headerName: "Họ và tên BN", width: 200 },
      { field: "MaBN", headerName: "Mã BN", width: 130 },
      { field: "Ngaysinh", headerName: "Ngày sinh", width: 130 },
      { field: "SoVaoVien", headerName: "Số vào viện", width: 130 },
      { field: "KhoaVaoVien", headerName: "Khoa nhập viện", width: 150 },
      { field: "KhoaDieuTri", headerName: "Khoa điều trị", width: 150 },
      { field: "SoLuuTru", headerName: "Số lưu trữ", width: 130 },
      { field: "ctaikhoan", headerName: "Người kết xuất", width: 130 },
      { field: "choten", headerName: "Tên người kết xuất", width: 180 },
      { field: "tngayketxuat", headerName: "Ngày kết xuất", width: 170 },
    ],
    [handleDownloadLichSu, pdfLoading]
  );

  // Function để lấy dữ liệu lịch sử kết xuất
  const handleSearchLichSu = async () => {
    if (!hasAccess) return;

    try {
      if (!tuNgay || !denNgay) return;

      setSearchingLichSu(true);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const data = await getnhatkyketxuatba(
        loginedUser.ctaikhoan,
        popt,
        selectedKhoa,
        formatDate(tuNgay),
        formatDate(denNgay)
      );

      setLichSuRows(
        (data || []).map((item: INhatKyKetXuat, index: number) => ({
          id: item.cid || index, // Use cid or index as row ID
          ...item,
        }))
      );
    } catch (error) {
      console.error("Error fetching history data:", error);
      ToastError("Lỗi khi tải dữ liệu lịch sử kết xuất!");
    } finally {
      setSearchingLichSu(false);
    }
  };

  // Cập nhật handleChange để load data khi chuyển tab
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (!hasAccess) return;

    setValue(newValue);

    // Nếu chuyển sang tab lịch sử và chưa có dữ liệu, tự động load
    if (newValue === 1 && lichSuRows.length === 0) {
      handleSearchLichSu();
    }
  };

  // Fetch khoa list from API
  const fetchKhoaList = useCallback(async () => {
    if (!hasAccess) return;
    try {
      const dataKhoaPhong = await DataManager.getDmKhoaPhong();
      setKhoaList(dataKhoaPhong);
    } catch (error) {
      console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  }, [hasAccess]);

  // Fetch khoa list from API
  useEffect(() => {
    if (hasAccess && !isCheckingAccess) {
      fetchKhoaList();
    }
  }, [hasAccess, isCheckingAccess, fetchKhoaList]);

  // Hàm xử lý kết xuất
  const handleKetXuat = async () => {
    if (!hasAccess) return;

    try {
      // Kiểm tra có dữ liệu được chọn không
      if (!selectedRows || selectedRows.length === 0) {
        ToastWarning("Vui lòng chọn ít nhất một hồ sơ bệnh án để kết xuất!");
        return;
      }

      setLoading(true);
      setError(null);
      setProgress(0);
      let hsbaSuccess = 0;

      // Lấy PDF data cho từng HSBA được chọn
      for (const hsba of selectedRows) {
        try {
          // Tạo danh sách PDF từ selectedRows
          const pdfList: IPDFItem[] = [];

          // Gọi API để lấy chi tiết PDF của HSBA
          const chiTietData = await getChiTietHSBA(
            loginedUser.ctaikhoan,
            popt,
            hsba.ID
          );

          if (chiTietData && Array.isArray(chiTietData)) {
            chiTietData.forEach((phieu: IHoSoBenhAnChiTiet, index: number) => {
              if (phieu.FilePdfKySo) {
                pdfList.push({
                  maHSBA: `${hsba.MaBN}-${hsba.SoVaoVien}-${index + 1}`,
                  FilePdf: phieu.FilePdfKySo,
                });
              }
            });
          }

          if (pdfList.length === 0) {
            ToastError("Không tìm thấy file PDF nào để kết xuất!");
            return;
          }

          // Gọi trực tiếp mergePDFsWithProgress
          const mergedPdfBase64 = await mergePDFsWithProgress(
            pdfList,
            "HỒ SƠ BỆNH ÁN ĐIỆN TỬ BỆNH VIỆN ĐA KHOA LÊ NGỌC TÙNG",
            true,
            (current, total) => {
              setProgress((current / total) * 100);
            }
          );
          // console.log("Merged PDF Base64:", mergedPdfBase64);
          if (mergedPdfBase64) {
            try {
              const updatedHsba = {
                ...hsba,
                NoiDungPdf: mergedPdfBase64,
                TrangThaiKetXuat: "1",
                NguoiKetXuat: loginedUser.ctaikhoan,
              };
              const result = await ketxuathosobenhan(
                loginedUser.ctaikhoan,
                "5",
                updatedHsba
              );
              // console.log("Kết xuất thành công:", result);
              if (result && result[0].ROW_COUNT === 1) {
                hsbaSuccess++;
              }
            } catch (error) {
              ToastError(
                `Có lỗi xảy ra khi cập nhật kết xuất HSBA! ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
            }
          }
        } catch {
          // console.error(`Error getting PDF for HSBA ${hsba.ID}:`, error);
          continue;
        }
      }

      if (hsbaSuccess === selectedRows.length) {
        ToastSuccess(`Kết xuất thành công ${selectedRows.length} HSBA!`);
      } else {
        ToastWarning(
          `Kết xuất thành công ${hsbaSuccess} trong tổng số ${selectedRows.length} HSBA!`
        );
      }
      await handleSearch();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      ToastError(`Lỗi kết xuất: ${errorMessage}`);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Hàm xử lý khi chọn rows trong DataGrid
  const handleRowSelectionChange = (selectionModel: GridRowSelectionModel) => {
    if (!hasAccess) return;

    let selectionArray: unknown[] = [];

    if (selectionModel && selectionModel.ids) {
      selectionArray = Array.from(selectionModel.ids);
    } else if (Array.isArray(selectionModel)) {
      selectionArray = selectionModel;
    }

    const selectedRowsData = rows.filter((row) =>
      selectionArray.includes(row.ID)
    );
    setSelectedRows(selectedRowsData);
  };

  // Hàm tìm kiếm hồ sơ bệnh án
  const handleSearch = async () => {
    if (!hasAccess) return;

    try {
      if (!tuNgay || !denNgay) return;

      setSearchingData(true);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const data = await getHosobenhan(
        loginedUser.ctaikhoan,
        popt,
        selectedKhoa,
        formatDate(tuNgay),
        formatDate(denNgay)
      );
      setRows(
        (data || []).map((item: IHoSoBenhAn) => ({
          id: item.ID,
          ...item,
        }))
      );
    } catch (error) {
      console.error("Error fetching HSBA data:", error);
      ToastError("Lỗi khi tìm kiếm hồ sơ bệnh án!");
    } finally {
      setSearchingData(false);
    }
  };

  // Hiển thị loading khi đang kiểm tra quyền truy cập
  if (isCheckingAccess) {
    return (
      <Box
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}>
        <CircularProgress />
        <Typography color="textSecondary">
          Đang kiểm tra quyền truy cập...
        </Typography>
      </Box>
    );
  }

  // Hiển thị trang Access Denied nếu không có quyền
  if (!hasAccess) {
    return (
      <AccessDeniedPage
        title="BẠN KHÔNG CÓ QUYỀN KẾT XUẤT HỒ SƠ BỆNH ÁN"
        message="Bạn không có quyền truy cập chức năng kết xuất hồ sơ bệnh án. Vui lòng liên hệ quản trị viên để được cấp quyền."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata title="Kết xuất hồ sơ bệnh án" />

      {/* Container chính với height cố định */}
      <Box p={1} className="w-full h-full flex flex-col">
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          QUẢN LÝ KẾT XUẤT HỒ SƠ BỆNH ÁN
        </Typography>

        {/* Bộ lọc */}
        <Grid container spacing={1}>
          {/* Ô Select Khoa */}
          <Grid size={{ xs: 12, sm: 12, md: 6 }}>
            <Box className="flex flex-row" gap={2}>
              <Select
                value={selectedKhoa}
                size="small"
                onChange={(e) => setSelectedKhoa(e.target.value)}
                displayEmpty
                className="flex-1">
                {khoaList.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
              <RadioGroup
                row
                aria-labelledby="popt-radio-group-label"
                name="popt-radio-group"
                value={popt}
                onChange={(e) => setPopt(e.target.value)}
                className="w-auto">
                <FormControlLabel
                  value="1"
                  control={<Radio size="small" />}
                  label="Ngày vào"
                />
                <FormControlLabel
                  value="2"
                  control={<Radio size="small" />}
                  label="Ngày ra"
                />
              </RadioGroup>
            </Box>
          </Grid>

          {/* DatePicker "Từ ngày" */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <DatePicker
              label="Từ ngày"
              value={tuNgay}
              onChange={(value) => setTuNgay(value as Date)}
              format="dd/MM/yyyy"
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Grid>

          {/* DatePicker "Đến ngày" */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <DatePicker
              label="Đến ngày"
              value={denNgay}
              onChange={(value) => setDenNgay(value as Date)}
              format="dd/MM/yyyy"
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Grid>

          {/* Nút "Tìm kiếm" */}
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Button
              fullWidth
              startIcon={<Search />}
              variant="contained"
              onClick={handleSearch}
              disabled={searchingData}>
              {searchingData ? "Đang tìm..." : "Tìm kiếm"}
            </Button>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            aria-label="basic tabs example"
            value={value}
            onChange={handleChange}>
            <Tab label="Kết xuất" {...a11yProps(0)} />
            <Tab label="Lịch sử" {...a11yProps(1)} />
          </Tabs>
        </Box>

        {/* Tab Kết xuất */}
        <CustomTabPanel value={value} index={0}>
          <Box className="bg-white flex gap-2 p-2">
            <Button
              variant="contained"
              startIcon={<NoteAdd />}
              size="small"
              onClick={handleKetXuat}
              disabled={loading || pdfLoading}>
              {loading ? `Kết xuất... ${progress.toFixed(0)}%` : "Kết xuất"}
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              size="small"
              onClick={handleSearch}
              disabled={searchingData}>
              Làm mới
            </Button>
          </Box>

          {/* Progress indicator */}
          {loading && (
            <Box sx={{ width: "100%", mt: 1 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" color="text.secondary">
                Đang xử lý: {progress.toFixed(0)}%
              </Typography>
            </Box>
          )}

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}

          {/* DataGrid Danh sách kết xuất HSBA */}
          <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
            <DataGrid
              rows={rows}
              columns={columnsKetXuat}
              loading={searchingData}
              checkboxSelection
              disableRowSelectionOnClick
              density="compact"
              onRowSelectionModelChange={handleRowSelectionChange}
              sx={{
                height: "100%",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-cell": {
                  border: "1px solid #e0e0e0",
                },
                "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#f9f9f9",
                },
                "& .MuiDataGrid-row:nth-of-type(even)": {
                  backgroundColor: "white",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#e3f2fd !important",
                },
                "& .MuiDataGrid-main": {
                  overflow: "hidden",
                },
              }}
            />
          </Box>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <Box className="bg-white flex gap-2 p-2">
            <Button
              variant="contained"
              startIcon={<Refresh />}
              size="small"
              onClick={handleSearchLichSu}
              disabled={searchingLichSu}>
              Làm mới
            </Button>
            <Button variant="outlined" onClick={handleExportExcel} startIcon={<Download />} size="small">
              Xuất Excel
            </Button>
          </Box>

          {/* Progress indicator */}
          {loading && (
            <Box sx={{ width: "100%", mt: 1 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" color="text.secondary">
                Đang xử lý: {progress.toFixed(0)}%
              </Typography>
            </Box>
          )}

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}

          {/* DataGrid Danh sách kết xuất HSBA */}
          <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
            <DataGrid
              rows={lichSuRows}
              columns={columnsLichSu}
              loading={searchingLichSu}
              pagination
              disableRowSelectionOnClick
              density="compact"
              sx={{
                height: "100%",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#e8f5e8",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-cell": {
                  border: "1px solid #e0e0e0",
                },
                "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#f9fff9",
                },
                "& .MuiDataGrid-row:nth-of-type(even)": {
                  backgroundColor: "white",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#e8f5e8 !important",
                },
                "& .MuiDataGrid-main": {
                  overflow: "hidden",
                },
              }}
            />
          </Box>
        </CustomTabPanel>
      </Box>
    </LocalizationProvider>
  );
}
