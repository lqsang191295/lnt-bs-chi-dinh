// src/app/(emr)/muon-tra-hsba/page.tsx
"use client";

import { getHosobenhan, getmuontraHSBA, getChiTietHSBA } from "@/actions/act_thosobenhan";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import HeadMetadata from "@/components/HeadMetadata";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { IHoSoBenhAnChiTiet } from "@/model/thosobenhan_chitiet";
import { ITMuonTraHSBA } from "@/model/tmuontrahsba";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useMenuStore } from "@/store/menu";
import { useUserStore } from "@/store/user";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";
import { History, NoteAdd, Search } from "@mui/icons-material";
import LaunchIcon from '@mui/icons-material/Launch';
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DialogDetail from "../tra-cuu-hsba/components/dialog-detail";
import DsMuonHsba from "./components/ds-muon-hsba";
import LsMuonTraHsba from "./components/ls-muon-tra-hsba";

export default function MuonTraHsbaPage() {
  const router = useRouter();
  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<IHoSoBenhAn[]>([]);
  const [filteredRows, setFilteredRows] = useState<IHoSoBenhAn[]>([]);
  const [searchText, setSearchText] = useState("");
  const [popt, setPopt] = useState("2"); // 1: Ngày vào viện, 2: Ngày ra viện

  const { data: loginedUser } = useUserStore();
  const { data: menuData } = useMenuStore();
  const [searchingData, setSearchingData] = useState<boolean>(false);
  // State và hàm cho Pagination
  const [isOpenDsMuonHsba, setIsOpenDsMuonHsba] = useState(false);
  const [isOpenLsMuonTraHsba, setIsOpenLsMuonTraHsba] = useState(false);
  const [selectedHsbaForDetail, setSelectedHsbaForDetail] =
    useState<IHoSoBenhAn | null>(null);
  const [phieumuontraHSBA, setPhieumuontraHSBA] =
    useState<ITMuonTraHSBA | null>(null);
  const [selectedKhoa, setSelectedKhoa] = useState("all"); // Trạng thái chọn khoa
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  // States for view HSBA detail dialog
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedHsbaForView, setSelectedHsbaForView] = useState<IHoSoBenhAn | null>(null);
  const [phieuList, setPhieuList] = useState<IHoSoBenhAnChiTiet[]>([]);

  // Handle view HSBA detail
  const handleViewHSBA = useCallback(async (hsba: IHoSoBenhAn) => {
    if (!hasAccess) return;
    
    setSelectedHsbaForView(hsba);

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
  }, [hasAccess, loginedUser.ctaikhoan, popt]);

  // Handle close detail dialog
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedHsbaForView(null);
    setPhieuList([]);
  };

  const columns: GridColDef[] = [
    { field: "ID", headerName: "ID", width: 60 },
    {
      field: "ViewHSBA",
      headerName: "Xem",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          color="primary"
          onClick={() => handleViewHSBA(params.row)}
          title="Xem chi tiết HSBA">
          <LaunchIcon fontSize="small" />
        </IconButton>
      ),
    },
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

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const checkAccess = () => {
      // Kiểm tra xem có quyền truy cập trang "muon-tra-hsba" không
      if (menuData.find((item) => item.clink === "muon-tra-hsba")) {
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

      const mappedRows = (data || []).map((item: IHoSoBenhAn) => ({
        id: item.ID,
        ...item,
      }));
      setRows(mappedRows);
      setFilteredRows(mappedRows);
      setSearchText(""); // Reset search text khi tìm kiếm mới
      //console.log("Search results:", data);
    } catch (error) {
      console.error("Error fetching HSBA data:", error);
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

  const handleRowSelected = async (selectedIds: unknown[]) => {
    if (!hasAccess) return;

    //console.log("Selected IDs:", selectedIds); // Debug log
    if (selectedIds.length > 0) {
      const selectedId = selectedIds[0];
      //console.log("rows:", rows); // Debug log
      const selectedRowData = rows.find((row) => row.ID === selectedId);
      //console.log("Selected row data HSBA:", selectedRowData); // Debug log
      if (selectedRowData) {
        setSelectedHsbaForDetail(selectedRowData);

        try {
          const result = await getmuontraHSBA(
            loginedUser.ctaikhoan,
            "1",
            selectedRowData.ID.toString() || "",
            "",
            ""
          );
          //console.log("Phieu muon tra result:", result); // Debug log

          if (result && result.length > 0) {
            setPhieumuontraHSBA(result[0]); // Lấy phiếu đầu tiên nếu là array
          } else {
            setPhieumuontraHSBA(null);
          }
        } catch (error) {
          console.error("Error fetching phieu muon tra:", error);
          setPhieumuontraHSBA(null);
        }
      }
    } else {
      setPhieumuontraHSBA(null);
      setSelectedHsbaForDetail(null);
    }
  };

  // Hàm xử lý khi chọn rows trong DataGrid
  const handleRowSelectionChange = async (
    selectionModel: GridRowSelectionModel
  ) => {
    if (!hasAccess) return;

    let selectedIds: unknown[] = [];
    if (selectionModel && selectionModel.ids) {
      selectedIds = Array.from(selectionModel.ids);
    } else if (Array.isArray(selectionModel)) {
      selectedIds = selectionModel;
    }
    handleRowSelected(selectedIds);
  };

  // Hàm xác định loại dựa trên trạng thái phiếu
  const getLoaiPhieu = () => {
    if (!phieumuontraHSBA) return "MUON"; // Nếu chưa có phiếu thì là mượn mới
    // Kiểm tra trạng thái trả
    if (phieumuontraHSBA.ctrangthaitra === "0" || !phieumuontraHSBA.cngaytra) {
      return "TRA"; // Đã mượn, chưa trả -> cho phép trả
    }
    return "MUON"; // Đã trả hoặc trường hợp khác -> cho phép mượn mới
  };

  // Hàm xử lý double click
  const handleRowDoubleClick = (params: GridRowParams) => {
    if (!hasAccess) return;

    handleRowSelected([params.row.id]);
    setIsOpenDsMuonHsba(true);
  };

  // Fetch khoa list from API
  useEffect(() => {
    if (hasAccess && !isCheckingAccess) {
      fetchKhoaList();
    }
  }, [hasAccess, isCheckingAccess, fetchKhoaList]);

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
        title="BẠN KHÔNG CÓ QUYỀN QUẢN LÝ MƯỢN TRẢ HSBA"
        message="Bạn không có quyền truy cập chức năng quản lý mượn trả hồ sơ bệnh án. Vui lòng liên hệ quản trị viên để được cấp quyền."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata title="Quản lý mượn trả hồ sơ bệnh án" />

      <Box p={1} className="w-full h-full flex flex-col">
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          QUẢN LÝ MƯỢN TRẢ HỒ SƠ BỆNH ÁN
        </Typography>

        {/* Filter/Search Bar */}
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
            variant="contained"
            startIcon={<NoteAdd />}
            size="small"
            onClick={() => setIsOpenDsMuonHsba(true)}>
            Mượn trả HSBA
          </Button>

          <Button
            variant="contained"
            startIcon={<History />}
            size="small"
            onClick={() => setIsOpenLsMuonTraHsba(true)}>
            Lịch sử mượn trả
          </Button>
        </Box> 

        {/* Main Content Area (Padding around the table) */}
        <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pagination
            checkboxSelection
            disableMultipleRowSelection
            density="compact"
            onRowSelectionModelChange={handleRowSelectionChange}
            onRowDoubleClick={handleRowDoubleClick}
            loading={searchingData}
            columnVisibilityModel={{
              ID: false, KhoaVaoVien: false, KhoaDieuTri: false, LoaiLuuTru: false,
            }}
            sx={{
              height: "100%",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
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

        <DsMuonHsba
          loai={getLoaiPhieu()}
          phieumuon={phieumuontraHSBA}
          open={isOpenDsMuonHsba}
          onClose={() => setIsOpenDsMuonHsba(false)}
          selectedHsbaForDetail={selectedHsbaForDetail}
        />
        <LsMuonTraHsba
          open={isOpenLsMuonTraHsba}
          onClose={() => setIsOpenLsMuonTraHsba(false)}
          selectedHsbaId={selectedHsbaForDetail?.ID?.toString()} // Truyền ID của HSBA được chọn
        />

        {/* Dialog xem chi tiết HSBA */}
        {openDetailDialog && selectedHsbaForView && (
          <DialogDetail
            open={openDetailDialog}
            onClose={handleCloseDetailDialog}
            selectedHsbaForDetail={selectedHsbaForView}
            phieuList={phieuList}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
}
