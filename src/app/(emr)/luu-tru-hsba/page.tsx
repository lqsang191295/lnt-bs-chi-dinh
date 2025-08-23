// src/app/luu-tru-hsba/page.tsx
"use client";
import { Search } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
  CircularProgress,
} from "@mui/material";

import { getHosobenhan } from "@/actions/act_thosobenhan";
import HeadMetadata from "@/components/HeadMetadata";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { ILoaiLuuTru } from "@/model/tloailuutru";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useUserStore } from "@/store/user";
import { useMenuStore } from "@/store/menu";
import { ToastError, ToastWarning } from "@/utils/toast";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DialogCapNhatLuuTru from "./components/dialog-cap-nhat-luu-tru";

const columns: GridColDef[] = [
  { field: "ID", headerName: "ID", width: 60 },
  {
    field: "TrangThaiBA",
    headerName: "Trạng thái",
    width: 100,
    renderCell: (params) => (
      <Box
        sx={{
          backgroundColor: "transparent",
          color: params.value === "MO" ? "#8200fcff" : "#f44336", // Màu vàng cho MO, màu đỏ cho DONG,
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
  { field: "MaBANoiTru", headerName: "Mã BA", width: 130 },
  { field: "Hoten", headerName: "Họ và tên", width: 200 },
  { field: "MaBN", headerName: "Mã BN", width: 130 },
  { field: "Ngaysinh", headerName: "Ngày sinh", width: 130 },
  { field: "SoVaoVien", headerName: "Số vào viện", width: 130 },
  { field: "NgayVao", headerName: "Ngày vào viện", width: 130 },
  { field: "NgayRa", headerName: "Ngày ra viện", width: 130 },
  { field: "KhoaVaoVien", headerName: "Khoa nhập viện", width: 100 },
  { field: "KhoaDieuTri", headerName: "", width: 0 }, // Ẩn cột này
  { field: "TenKhoaDieuTri", headerName: "Khoa điều trị", width: 200 },
  { field: "LoaiBenhAn", headerName: "Loại BA", width: 130 },
  { field: "BsDieuTriKyTen", headerName: "Bác sĩ điều trị", width: 130 },
  { field: "SoLuuTru", headerName: "Số lưu trữ", width: 100 },
  { field: "NgayLuuTru", headerName: "Ngày lưu trữ", width: 100 },
  { field: "ViTriLuuTru", headerName: "Vị trí lưu trữ", width: 150 },
  { field: "TenLoaiLuuTru", headerName: "Loại lưu trữ", width: 200 },
  { field: "SoNamLuuTru", headerName: "Số năm lưu trữ", width: 150 },
  { field: "LoaiLuuTru", headerName: "", width: 0 }, // Ẩn cột này
];

export default function LuuTruHsbaPage() {
  const router = useRouter();
  const [selectedRow, setSelectedRow] = useState<IHoSoBenhAn | null>(null); // Single row selection
  const [openDialog, setOpenDialog] = useState(false);
  const [loaiLuuTruList, setLoaiLuuTruList] = useState<ILoaiLuuTru[]>([]);
  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [selectedKhoa, setSelectedKhoa] = useState("all");
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<IHoSoBenhAn[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện
  const { data: loginedUser } = useUserStore();
  const { data: menuData } = useMenuStore();
  const [searchingData, setSearchingData] = useState<boolean>(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const checkAccess = () => {
      // Kiểm tra xem có quyền truy cập trang "luu-tru-hsba" không
      if (menuData.find((item) => item.clink === "luu-tru-hsba")) {
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

  const fetchLoaiLuuTru = async () => {
    if (!hasAccess) return;
    
    try {
      const result = await DataManager.getDmLoaiLuuTru();
      // console.log("Loai luu tru:", result);
      setLoaiLuuTruList(result || []);
    } catch (error) {
      console.error("Error fetching loại lưu trữ:", error);
      setLoaiLuuTruList([]);
    }
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

  // Fetch data khi có quyền truy cập
  useEffect(() => {
    if (hasAccess && !isCheckingAccess) {
      fetchLoaiLuuTru();
      fetchKhoaList();
    }
  }, [hasAccess, isCheckingAccess]);

  const handleRowSelectionChange = (selectionModel: GridRowSelectionModel) => {
    if (!hasAccess) return;
    
    let selectionArray: unknown[] = [];

    //console.log("Selected rows for update:", selectionModel);
    if (selectionModel && selectionModel.ids) {
      selectionArray = Array.from(selectionModel.ids);
    } else if (Array.isArray(selectionModel)) {
      selectionArray = selectionModel;
    }
    //console.log("Selection array:", selectionArray);
    const selectedRowsData = rows.filter((row) =>
      selectionArray.includes(row.ID)
    );
    //console.log("Selected rows data:", selectedRowsData);
    setSelectedRow(selectedRowsData[0] || null);
  };

  // Mở dialog cập nhật lưu trữ
  const handleOpenDialog = () => {
    if (!hasAccess) return;
    
    if (!selectedRow) {
      ToastWarning("Vui lòng chọn một hồ sơ bệnh án!");
      return;
    }
    setOpenDialog(true);
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Callback khi cập nhật thành công
  const handleUpdateSuccess = async () => {
    await handleSearch(); // Refresh data
  };

  // Hàm tìm kiếm hồ sơ bệnh án
  const handleSearch = async () => {
    if (!hasAccess) return;
    
    if (!tuNgay || !denNgay) return;

    try {
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
          id: item.ID, // Use ID or index as row ID
          ...item,
        }))
      );
      //console.log("Search results:", data);
    } catch (error) {
      console.error("Error fetching hồ sơ bệnh án:", error);
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
        title="BẠN KHÔNG CÓ QUYỀN QUẢN LÝ LƯU TRỮ HSBA"
        message="Bạn không có quyền truy cập chức năng quản lý lưu trữ hồ sơ bệnh án. Vui lòng liên hệ quản trị viên để được cấp quyền."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata title="Quản lý lưu trữ hồ sơ bệnh án" />

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
          QUẢN LÝ LƯU TRỮ HSBA
        </Typography>

        {/* Search Bar */}
        <Box 
          display="flex" 
          gap={2} 
          sx={{ 
            flexShrink: 0,
            flexWrap: 'wrap'
          }}
        >
          <Box flex={3}>
            <Select
              fullWidth
              value={selectedKhoa}
              size="small"
              onChange={(e) => setSelectedKhoa(e.target.value)}>
              {khoaList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box flex={2}>
            <FormControl>
              <FormLabel
                id="popt-radio-group-label"
                sx={{ color: "#1976d2", fontWeight: "bold" }}
              />
              <RadioGroup
                row
                aria-labelledby="popt-radio-group-label"
                name="popt-radio-group"
                value={popt}
                onChange={(e) => setPopt(e.target.value)}
                className="w-auto">
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
          </Box>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleSearch}
            disabled={searchingData}>
            {searchingData ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
        </Box>

        {/* Tab Navigation */}
        <Box 
          sx={{
            bgcolor: 'white',
            display: 'flex',
            gap: 2,
            p: 2,
            flexShrink: 0
          }}
        >
          <Button
            startIcon={<SaveAltIcon />}
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            disabled={!selectedRow}
            size="small">
            Cập nhật lưu trữ
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
            loading={searchingData}
            density="compact"
            onRowSelectionModelChange={handleRowSelectionChange}
            sx={{
              height: '100%',
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                border: "1px solid #e0e0e0",
              },
              "& .Mui-selected": {
                backgroundColor: "#e3f2fd !important",
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
          />
        </Box>

        {/* Dialog Component */}
        <DialogCapNhatLuuTru
          open={openDialog}
          onClose={handleCloseDialog}
          selectedRow={selectedRow}
          loaiLuuTruList={loaiLuuTruList}
          onSuccess={handleUpdateSuccess}
        />
      </Box>
    </LocalizationProvider>
  );
}