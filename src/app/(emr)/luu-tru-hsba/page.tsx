// src/app/luu-tru-hsba/page.tsx
"use client";
import { Search } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { getHosobenhan } from "@/actions/act_thosobenhan";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import HeadMetadata from "@/components/HeadMetadata";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { ILoaiLuuTru } from "@/model/tloailuutru";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useMenuStore } from "@/store/menu";
import { useUserStore } from "@/store/user";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  // { field: "MaBANoiTru", headerName: "Mã BA", width: 130 },
  { field: "Hoten", headerName: "Họ và tên", width: 200 },
  { field: "Ngaysinh", headerName: "Ngày sinh", width: 100 },
  { field: "Gioitinh", headerName: "Giới tính", width: 70 },
  { field: "MaBN", headerName: "Mã BN", width: 80 },
  { field: "SoBHYT", headerName: "Số BHYT", width: 160 },
  { field: "SoVaoVien", headerName: "Số vào viện", width: 100 },
  { field: "NgayVao", headerName: "Ngày vào viện", width: 150 },
  { field: "NgayRa", headerName: "Ngày ra viện", width: 150 },
  { field: "KhoaVaoVien", headerName: "Khoa nhập viện", width: 0 },
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
  const [filteredRows, setFilteredRows] = useState<IHoSoBenhAn[]>([]);
  const [searchText, setSearchText] = useState("");
  const [popt, setPopt] = useState("2"); // 1: Ngày vào viện, 2: Ngày ra viện
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

  const fetchLoaiLuuTru = useCallback(async () => {
    if (!hasAccess) return;
    try {
      const result = await DataManager.getDmLoaiLuuTru();
      // console.log("Loai luu tru:", result);
      setLoaiLuuTruList(result || []);
    } catch (error) {
      console.error("Error fetching loại lưu trữ:", error);
      setLoaiLuuTruList([]);
    }
  }, [hasAccess]);

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

  // Fetch data khi có quyền truy cập
  useEffect(() => {
    if (hasAccess && !isCheckingAccess) {
      fetchLoaiLuuTru();
      fetchKhoaList();
    }
  }, [hasAccess, isCheckingAccess, fetchLoaiLuuTru, fetchKhoaList]);

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

      const mappedRows = (data || []).map((item: IHoSoBenhAn) => ({
        id: item.ID, // Use ID or index as row ID
        ...item,
      }));
      setRows(mappedRows);
      setFilteredRows(mappedRows);
      setSearchText(""); // Reset search text khi tìm kiếm mới
      //console.log("Search results:", data);
    } catch (error) {
      console.error("Error fetching hồ sơ bệnh án:", error);
      ToastError("Lỗi khi tìm kiếm hồ sơ bệnh án!");
    } finally {
      setSearchingData(false);
    }
  };

  // Hàm lọc dữ liệu theo text search
  const handleFilter = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredRows(rows);
      return;
    }

    const searchLower = searchText.toLowerCase().trim();
    const filtered = rows.filter((row) => {
      const maBN = (row.MaBN || "").toLowerCase();
      const hoTen = (row.Hoten || "").toLowerCase();
      const soVaoVien = (row.SoVaoVien || "").toLowerCase();
      const soBHYT = (row.SoBHYT || "").toLowerCase();

      return (
        maBN.includes(searchLower) ||
        hoTen.includes(searchLower) ||
        soVaoVien.includes(searchLower) ||
        soBHYT.includes(searchLower)
      );
    });

    setFilteredRows(filtered);

    if (filtered.length === 0) {
      ToastWarning("Không tìm thấy kết quả phù hợp!");
    } else {
      ToastSuccess(`Tìm thấy ${filtered.length} kết quả`);
    }
  }, [searchText, rows]);

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
      <Box p={1} className="w-full h-full flex flex-col">
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          QUẢN LÝ LƯU TRỮ HSBA
        </Typography>
        {/* Search Bar */}
        <Grid container spacing={1} mb={1}>
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

        {/* Tab Navigation */}
        <Box className="bg-white flex gap-2 p-2">
          {/* Search Filter */} 
          <Box className="flex-1">
            <TextField
              fullWidth
              size="small"
              label="Mã BN, Họ tên, Số vào viện, Số BHYT..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleFilter();
                }
              }}
              type="text"
            />
          </Box>
          <Button
            startIcon={<Search />}
            variant="contained"
            color="success"
            size="small"
            onClick={handleFilter}>
            Lọc HSBA
          </Button>
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
        <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pagination
            loading={searchingData}
            density="compact"
            onRowSelectionModelChange={handleRowSelectionChange}
            columnVisibilityModel={{
              ID: false, KhoaVaoVien: false, KhoaDieuTri: false, LoaiLuuTru: false,
            }}
            sx={{
              height: "100%",
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
              "& .MuiDataGrid-main": {
                overflow: "hidden",
              },
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
