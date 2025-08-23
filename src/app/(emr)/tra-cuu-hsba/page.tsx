// src/app/(emr)/tra-cuu-hsba/page.tsx
"use client";
import { getChiTietHSBA, getHosobenhan } from "@/actions/act_thosobenhan";
import { PdfComponents } from "@/components/pdfComponents"; // Import PdfComponents
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { IHoSoBenhAnChiTiet } from "@/model/thosobenhan_chitiet";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useUserStore } from "@/store/user";
import { useMenuStore } from "@/store/menu";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import { History, NoteAdd, Search } from "@mui/icons-material";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import HeadMetadata from "@/components/HeadMetadata";
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import DialogDetail from "./components/dialog-detail";

export default function TraCuuHsbaPage() {
  const router = useRouter();
  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [selectedKhoa, setSelectedKhoa] = useState("all");
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<IHoSoBenhAn[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện

  // State cho dialog chi tiết
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedHsbaForDetail, setSelectedHsbaForDetail] =
    useState<IHoSoBenhAn | null>(null);
  const [phieuList, setPhieuList] = useState<IHoSoBenhAnChiTiet[]>([]);
  const { data: loginedUser } = useUserStore();
  const { data: menuData } = useMenuStore();
  const [searchingData, setSearchingData] = useState<boolean>(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const checkAccess = () => {
      // Kiểm tra xem có quyền truy cập trang "tra-cuu-hsba" không
      if (menuData.find((item) => item.clink === "tra-cuu-hsba")) {
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
  const { downloadPdf, isLoading } = PdfComponents(useMemo(() => ({
    onSuccess: (message: string) => {
      ToastSuccess(message);
    },
    onError: (error: string) => {
      ToastError(error);
    }
  }), []));

  // Hàm xử lý download PDF
  const handleDownload = useCallback((row: IHoSoBenhAn) => {
    if (!hasAccess) return;
    
    if (!row.NoiDungPdf) {
      ToastWarning("Không có dữ liệu PDF để tải!");
      return;
    }

    // Kiểm tra trạng thái kết xuất
    if (Number(row.TrangThaiKetXuat) !== 1) {
      ToastWarning("Hồ sơ này chưa được kết xuất!");
      return;
    }

    const fileName = `HSBA_${row.MaBN}_${row.Hoten}`;
    downloadPdf(row.NoiDungPdf, fileName);
  }, [downloadPdf, hasAccess]);

  // Cập nhật columns để sử dụng handleDownload mới
  const columns: GridColDef[] = useMemo(
    () => [
      { field: "ID", headerName: "ID", width: 60 },
      {
        field: "TrangThaiBA",
        headerName: "Trạng thái",
        width: 100,
        renderCell: (params) => (
          <Box
            sx={{
              backgroundColor: "transparent",
              color: params.value === "MO" ? "#8200fcff" : "#f44336",
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
            }}>
            {params.value === "MO" ? (
              <>
                <LockOpenIcon sx={{ fontSize: "14px" }} />
                Mở
              </>
            ) : (
              <>
                <LockOutlinedIcon sx={{ fontSize: "14px" }} />
                Đóng
              </>
            )}
          </Box>
        ),
      },
      {
        field: "TrangThaiKetXuat",
        headerName: "Kết xuất",
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
              minWidth: "100px",
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
                  disabled={isLoading || !params.row.NoiDungPdf}
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
                      : isLoading
                      ? "Đang tải..."
                      : "Tải xuống PDF"
                  }>
                  {isLoading ? "..." : "Tải xuống"}
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
    [handleDownload, isLoading]
  );

  // Hàm xử lý double click trên lưới chính
  const handleRowDoubleClick = async (params: GridRowParams) => {
    if (!hasAccess) return;
    
    const hsba = params.row;
    setSelectedHsbaForDetail(hsba);

    try {
      const chiTietData = await getChiTietHSBA(
        loginedUser.ctaikhoan,
        popt,
        hsba.ID
      );
      const mappedData = (chiTietData || []).map(
        (item: IHoSoBenhAnChiTiet, index: number) => ({
          id: item.ID || index + 1,
          ...item,
        })
      );

      setPhieuList(mappedData);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết HSBA:", error);
      setPhieuList([]);
      ToastError("Lỗi khi tải chi tiết hồ sơ bệnh án!");
    }

    setOpenDetailDialog(true);
  };

  // Hàm đóng dialog chi tiết
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedHsbaForDetail(null);
    setPhieuList([]);
  };

  const fetchKhoaList = async () => {
    if (!hasAccess) return;
    
    try {
      const dataKhoaPhong = await DataManager.getDmKhoaPhong();
      setKhoaList(dataKhoaPhong);
    } catch (error) {
      console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  };

  // Fetch khoa list from API
  useEffect(() => {
    if (hasAccess && !isCheckingAccess) {
      fetchKhoaList();
    }
  }, [hasAccess, isCheckingAccess]);

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
          height: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography color="textSecondary">Đang kiểm tra quyền truy cập...</Typography>
      </Box>
    );
  }

  // Hiển thị trang Access Denied nếu không có quyền
  if (!hasAccess) {
    return (
      <AccessDeniedPage
        title="BẠN KHÔNG CÓ QUYỀN TRA CỨU HỒ SƠ BỆNH ÁN"
        message="Bạn không có quyền truy cập chức năng tra cứu hồ sơ bệnh án. Vui lòng liên hệ quản trị viên để được cấp quyền."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  // Render component
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata title="Tra cứu hồ sơ bệnh án" />

      {/* Container chính với height cố định */}
      <Box 
        sx={{ 
          height: 'calc(100vh - 64px)', // Trừ height của header/navbar
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 1
        }}
      >
        <Typography
          variant="h6"
          sx={{ 
            color: "#1976d2", 
            fontWeight: "bold", 
            letterSpacing: 1,
            flexShrink: 0
          }}
        >
          TRA CỨU HỒ SƠ BỆNH ÁN
        </Typography>
        
        {/* Bộ lọc */}
        <Box 
          display="flex" 
          gap={2} 
          sx={{ 
            flexShrink: 0,
            flexWrap: 'wrap'
          }}
        >
          <Box flex={1}>
            <Select
              fullWidth
              value={selectedKhoa}
              size="small"
              onChange={(e) => setSelectedKhoa(e.target.value)}
              displayEmpty>
              {khoaList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box flex={1}>
            <RadioGroup
              row
              aria-labelledby="popt-radio-group-label"
              name="popt-radio-group"
              value={popt}
              onChange={(e) => setPopt(e.target.value)}>
              <FormControlLabel
                value="1"
                control={
                  <Radio
                    sx={{
                      color: "#1976d2",
                      "&.Mui-checked": { color: "#1976d2" },
                    }}
                    size="small"
                  />
                }
                label="Ngày vào"
                sx={{ color: "#1976d2", fontWeight: "bold" }}
              />
              <FormControlLabel
                value="2"
                control={
                  <Radio
                    sx={{
                      color: "#1976d2",
                      "&.Mui-checked": { color: "#1976d2" },
                    }}
                    size="small"
                  />
                }
                label="Ngày ra"
                sx={{ color: "#1976d2", fontWeight: "bold" }}
              />
            </RadioGroup>
          </Box>
          <Box flex={0.5}>
            <DatePicker
              label="Từ ngày"
              value={tuNgay}
              onChange={(value) => setTuNgay(value as Date)}
              format="dd/MM/yyyy"
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Box>

          {/* DatePicker "Đến ngày" */}
          <Box flex={0.5}>
            <DatePicker
              label="Đến ngày"
              value={denNgay}
              onChange={(value) => setDenNgay(value as Date)}
              format="dd/MM/yyyy"
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Box>

          {/* Nút "Tìm kiếm" */}
          <Button
            startIcon={<Search />}
            variant="contained"
            onClick={handleSearch}
            disabled={searchingData}>
            {searchingData ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
        </Box>

        {/* Main Content Area - DataGrid với height cố định */}
        <Box 
          sx={{
            flex: 1,
            width: '100%',
            minHeight: 400, // Đảm bảo có chiều cao tối thiểu
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            checkboxSelection
            disableRowSelectionOnClick
            density="compact"
            onRowDoubleClick={handleRowDoubleClick}
            sx={{
              height: '100%',
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
              '& .MuiDataGrid-main': {
                overflow: 'hidden'
              }
            }}
            loading={searchingData}
          />
        </Box>
      </Box>

      {/* Dialog Chi tiết HSBA */}
      {openDetailDialog && (
        <DialogDetail
          open={openDetailDialog}
          onClose={handleCloseDetailDialog}
          selectedHsbaForDetail={selectedHsbaForDetail}
          phieuList={phieuList}
        />
      )}
    </LocalizationProvider>
  );
}