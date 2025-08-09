"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CloseIcon from "@mui/icons-material/Close"; // Dùng cho nút "X" trong ô tìm kiếm
import GridViewIcon from "@mui/icons-material/GridView"; // Biểu tượng cho Toggle View (tùy chọn)

import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import type { SelectChangeEvent } from "@mui/material/Select";
import { DatePicker } from "@mui/x-date-pickers";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

// Dữ liệu cứng cho bảng
interface DataRow {
  id: string; // Sử dụng id để theo dõi duy nhất
  stt: number;
  maBenhAn: string;
  thoiGian: string;
  giaTriCu: string;
  giaTriMoi: string;
  loai: string;
  tacVu: string;
  ghiChu: string;
  noiDung: string;
}

const mockData: DataRow[] = [
  {
    id: "1",
    stt: 1,
    maBenhAn: "BA25001437",
    thoiGian: "23/07/2025 10:37:46",
    giaTriCu: "",
    giaTriMoi: "",
    loai: "BENHANMO",
    tacVu: "DONGBENHAN",
    ghiChu: "đóng bệnh án",
    noiDung: "string",
  },
  {
    id: "2",
    stt: 2,
    maBenhAn: "BA25001438",
    thoiGian: "23/07/2025 09:59:43",
    giaTriCu: "",
    giaTriMoi: "",
    loai: "BENHANMO",
    tacVu: "DONGBENHAN",
    ghiChu: "đóng bệnh án",
    noiDung: "string",
  },
  {
    id: "3",
    stt: 3,
    maBenhAn: "BA250160150",
    thoiGian: "20/05/2025 15:49:18",
    giaTriCu: "",
    giaTriMoi: "",
    loai: "BENHANMO",
    tacVu: "DONGBENHAN",
    ghiChu: "",
    noiDung: "string",
  },
  {
    id: "4",
    stt: 4,
    maBenhAn: "BA250190046",
    thoiGian: "20/05/2025 15:46:44",
    giaTriCu: "",
    giaTriMoi: "",
    loai: "BENHANMO",
    tacVu: "DONGBENHAN",
    ghiChu: "đã xem đơn thuốc",
    noiDung: "string",
  },
  {
    id: "5",
    stt: 5,
    maBenhAn: "BA25001005",
    thoiGian: "20/05/2025 07:40:22",
    giaTriCu: "",
    giaTriMoi: "",
    loai: "BENHANMO",
    tacVu: "DONGBENHAN",
    ghiChu: "test",
    noiDung: "string",
  },
  {
    id: "6",
    stt: 6,
    maBenhAn: "BA250160161",
    thoiGian: "18/05/2025 15:51:38",
    giaTriCu: "",
    giaTriMoi: "",
    loai: "BENHANMO",
    tacVu: "DONGBENHAN",
    ghiChu: "",
    noiDung: "string",
  },
  {
    id: "7",
    stt: 7,
    maBenhAn: "BA25000998",
    thoiGian: "18/05/2025 09:24:20",
    giaTriCu: "",
    giaTriMoi: "",
    loai: "BENHANMO",
    tacVu: "DONGBENHAN",
    ghiChu: "",
    noiDung: "string",
  },
  {
    id: "8",
    stt: 8,
    maBenhAn: "BA25000998",
    thoiGian: "18/05/2025 09:22:16",
    giaTriCu: "",
    giaTriMoi: "",
    loai: "TONGHOPLUUTRU",
    tacVu: "PHEDUYET",
    ghiChu: "",
    noiDung: "PHEDUYET",
  },
  {
    id: "9",
    stt: 9,
    maBenhAn: "BA25000831",
    thoiGian: "18/05/2025 08:41:51",
    giaTriCu: "",
    giaTriMoi: "",
    loai: "BENHANMO",
    tacVu: "DONGBENHAN",
    ghiChu: "dong",
    noiDung: "string",
  },
  {
    id: "10",
    stt: 10,
    maBenhAn: "BA25001439",
    thoiGian: "22/07/2025 11:00:00",
    giaTriCu: "Old Value A",
    giaTriMoi: "New Value A",
    loai: "HOANTHANH",
    tacVu: "CAPNHAT",
    ghiChu: "cập nhật thông tin",
    noiDung: "Dữ liệu cập nhật 1",
  },
];
const columns: GridColDef[] = [
  {
    field: "stt",
    headerName: "STT",
    width: 70,
    align: "center",
    headerAlign: "center",
  },
  { field: "maBenhAn", headerName: "Mã bệnh án", width: 150 },
  { field: "thoiGian", headerName: "Thời gian", width: 180 },
  { field: "giaTriCu", headerName: "Giá trị cũ", width: 150 },
  { field: "giaTriMoi", headerName: "Giá trị mới", width: 150 },
  { field: "loai", headerName: "Loại", width: 150 },
  { field: "tacVu", headerName: "Tác vụ", width: 150 },
  { field: "ghiChu", headerName: "Ghi chú", width: 200 },
  { field: "noiDung", headerName: "Nội dung", width: 200 },
];
export default function AuditLogPage() {
  const [searchFromDate, setSearchFromDate] = React.useState("");
  const [searchToDate, setSearchToDate] = React.useState("");

  // State cho các ô tìm kiếm trong tiêu đề cột
  const [colSearchMaBenhAn, setColSearchMaBenhAn] = React.useState("");
  const [colSearchThoiGian, setColSearchThoiGian] = React.useState("");
  const [colSearchGiaTriCu, setColSearchGiaTriCu] = React.useState("");
  const [colSearchGiaTriMoi, setColSearchGiaTriMoi] = React.useState("");
  const [colSearchLoai, setColSearchLoai] = React.useState("");
  const [colSearchTacVu, setColSearchTacVu] = React.useState("");
  const [colSearchGhiChu, setColSearchGhiChu] = React.useState("");
  const [colSearchNoiDung, setColSearchNoiDung] = React.useState("");

  // State và hàm cho Pagination
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleSearch = () => {
    console.log("Searching with:", {
      searchFromDate,
      searchToDate,
      colSearchMaBenhAn,
      colSearchThoiGian,
      // ... (thêm các trường tìm kiếm cột khác nếu cần)
    });
    // Logic lọc dữ liệu mockData dựa trên các trường tìm kiếm
  };

  const handleRefresh = () => {
    console.log("Refresh clicked!");
    // Reset tất cả các trường tìm kiếm
    setSearchFromDate("");
    setSearchToDate("");
    setColSearchMaBenhAn("");
    setColSearchThoiGian("");
    setColSearchGiaTriCu("");
    setColSearchGiaTriMoi("");
    setColSearchLoai("");
    setColSearchTacVu("");
    setColSearchGhiChu("");
    setColSearchNoiDung("");
    setPage(1);
  };

  // Lấy dữ liệu cho trang hiện tại
  const paginatedData = mockData.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(mockData.length / rowsPerPage);
  const totalItems = mockData.length; // Tổng số mục

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset về trang 1 khi thay đổi số hàng mỗi trang
  };

  // Component cho ô tìm kiếm trong TableHeader
  const ColumnSearchTextField: React.FC<{
    value: string;
    onChange: (val: string) => void;
  }> = ({ value, onChange }) => (
    <TextField
      variant="standard"
      size="small"
      placeholder="Tìm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        disableUnderline: true, // Bỏ gạch chân
        sx: { fontSize: "0.75rem", py: 0.5 },
        endAdornment: value && ( // Chỉ hiện nút X khi có giá trị
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => onChange("")}
              sx={{ p: "2px" }}>
              <CloseIcon fontSize="inherit" sx={{ fontSize: "0.8rem" }} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{ width: "100px", mr: 0.5 }}
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          handleSearch(); // Thực hiện tìm kiếm khi nhấn Enter
        }
      }}
    />
  );

  return (
    <Box p={2} className="w-full h-full flex flex-col">
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
        QUẢN LÝ LỊCH SỬ THAO TÁC BỆNH ÁN
      </Typography>

      {/* Bộ lọc */}
      <Box display="flex" gap={2} mb={2}>
        <Box flex={2}>
          <DatePicker
            label="Từ ngày"
            format="dd/MM/yyyy"
            className="w-full"
            slotProps={{
              textField: {
                size: "small",
              },
            }}
          />
        </Box>
        <Box flex={2}>
          <DatePicker
            label="Đến ngày"
            format="dd/MM/yyyy"
            className="w-full"
            slotProps={{
              textField: {
                size: "small",
              },
            }}
          />
        </Box>
        <Box flex={1}>
          <Button fullWidth variant="contained">
            Tìm kiếm
          </Button>
        </Box>
        <Box flex={1}>
          <Button fullWidth variant="contained">
            Làm mới
          </Button>
        </Box>
      </Box>

      {/* Main Content Area (Padding around the table) */}
      <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
        <DataGrid
          rows={mockData}
          columns={columns}
          pagination
          checkboxSelection
          disableRowSelectionOnClick
          density="compact"
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
          }}
        />
      </Box>
    </Box>
  );
}
