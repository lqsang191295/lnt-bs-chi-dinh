"use client";

import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add"; // Dùng cho nút "Làm mới"
import DateRangeIcon from "@mui/icons-material/DateRange"; // Icon cho DatePicker
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import {
  HighlightOff,
  History,
  NoteAdd,
  Refresh,
  Search,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { getChiTietHSBA, getHosobenhan, getmuontraHSBA } from "@/actions/emr_hosobenhan";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { ITMuonTraHSBA } from "@/model/tmuontrahsba";
import { IUserItem } from "@/model/user";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useUserStore } from "@/store/user";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DsMuonHsba from "./components/ds-muon-hsba";
import LsMuonTraHsba from "./components/ls-muon-tra-hsba";
import DsTraHsba from "./components/ds-tra-hsba";
import { se } from "date-fns/locale";


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
];
export default function muontrahsbaPage() {

  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<IHoSoBenhAn[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện

  const [currentTab, setCurrentTab] = React.useState("export");
  const [searchTerm, setSearchTerm] = React.useState(""); // Tên tài liệu
  const [searchStatus, setSearchStatus] = React.useState(""); // Tình trạng xét xuất
  const [searchTuNgay, setSearchTuNgay] = React.useState("");
  const [searchDenNgay, setSearchDenNgay] = React.useState("");
  const [searchDateType, setSearchDateType] = React.useState("ngayVaoVien"); // Default search by "Ngày vào viện"

  const { data: loginedUser } = useUserStore();
  const [searchingData, setSearchingData] = useState<boolean>(false);
  // State và hàm cho Pagination
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [isOpenDsMuonHsba, setIsOpenDsMuonHsba] = useState(false);
  const [isOpenLsMuonTraHsba, setIsOpenLsMuonTraHsba] = useState(false);
  const [isOpenDsTraHsba, setIsOpenDsTraHsba] = useState(false);
  const [selectedHsbaForDetail, setSelectedHsbaForDetail] = useState<IHoSoBenhAn | null>(null);
  const [phieumuontraHSBA, setPhieumuontraHSBA] = useState<ITMuonTraHSBA | null>(null);
  const [selectedKhoa, setSelectedKhoa] = useState("all"); // Trạng thái chọn khoa
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  // Hàm tìm kiếm hồ sơ bệnh án
  const handleSearch = async () => {
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
        (data || []).map((item: IHoSoBenhAn, idx: number) => ({
          id: idx + 1,
          ...item,
        }))
      );
      //console.log("Search results:", data);
    } catch (error) {
      console.error("Error fetching HSBA data:", error);
    } finally {
      setSearchingData(false);
    }
  };


  const fetchKhoaList = async () => {
    try {
      const dataKhoaPhong = await DataManager.getDmKhoaPhong();
      setKhoaList(dataKhoaPhong);
    } catch (error) {
      console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  };
  // Hàm xử lý khi chọn rows trong DataGrid
  const handleRowSelectionChange = async (selectionModel: any) => {
    let selectedIds = [];

    if (selectionModel && selectionModel.type === 'include' && selectionModel.ids) {
      selectedIds = Array.from(selectionModel.ids);
    } else if (Array.isArray(selectionModel)) {
      selectedIds = selectionModel;
    }

    if (selectedIds.length > 0) {
      const selectedId = selectedIds[0];
      const selectedRowData = rows.find(row => row.id === selectedId);

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
    //console.log("Row double clicked:", params.row);

    // Gọi handleRowSelectionChange với array chứa ID của row được double click
    handleRowSelectionChange([params.row.id]);

    // Mở dialog mượn HSBA
    setIsOpenDsMuonHsba(true);
  };

  // Fetch khoa list from API
  useEffect(() => {
    fetchKhoaList();
  }, []);
  const handleRefresh = () => {
    console.log("Refresh clicked!");
  };


  // Lấy dữ liệu cho trang hiện tại
  const paginatedData = rows.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset về trang 1 khi thay đổi số hàng mỗi trang
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={2} className="w-full h-full flex flex-col">
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          QUẢN LÝ MƯỢN TRẢ HỒ SƠ BỆNH ÁN
        </Typography>

        {/* Filter/Search Bar */}
        <Box display="flex" gap={2} mb={2}>
          <Box flex={3}>
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
                  label="Ngày vào viện"
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
                  label="Ngày ra viện"
                  sx={{ color: "#1976d2", fontWeight: "bold" }}
                />
              </RadioGroup>
            </FormControl>
          </Box>
          <Box flex={1}>
            <DatePicker
              label="Từ ngày"
              value={tuNgay}
              onChange={(value) => setTuNgay(value as Date)}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </Box>
          <Box flex={1}>
            <DatePicker
              label="Đến ngày"
              value={denNgay}
              onChange={(value) => setDenNgay(value as Date)}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </Box>

        {/* Tab Navigation */}
        <Box className="bg-white flex gap-2 p-2">
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
            rows={rows}
            columns={columns}
            pagination
            checkboxSelection
            disableMultipleRowSelection
            density="compact"
            onRowSelectionModelChange={handleRowSelectionChange}
            onRowDoubleClick={handleRowDoubleClick}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
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
      </Box>
    </LocalizationProvider>
  );
}
