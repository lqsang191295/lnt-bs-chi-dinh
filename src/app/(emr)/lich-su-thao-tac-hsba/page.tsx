// app/lich-su-thao-tac-hsba/page.tsx
"use client";

import CloseIcon from "@mui/icons-material/Close"; // Dùng cho nút "X" trong ô tìm kiếm
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { getnhatkythaotacba } from "@/actions/emr_tnguoidung";
import { useUserStore } from "@/store/user";
import type { SelectChangeEvent } from "@mui/material/Select";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Dữ liệu cứng cho bảng
interface DataRow {
  cid: string;
  ctaikhoan: string;
  choten: string;
  cdienthoai: string;
  cmabenhan: string;
  MaBN: string;
  Hoten: string;
  SoVaoVien: string;
  SoLuuTru: string;
  KhoaDieuTri: string;
  cthaotac: string;
  cgiatricu: string;
  cgiatrimoi: string;
  tngaythaotac: string;
}

const columns: GridColDef[] = [
  { field: "cid", headerName: "ID", width: 60 },
  { field: "ctaikhoan", headerName: "Tài khoản", width: 150, filterable: true },
  { field: "choten", headerName: "Họ tên", width: 150, filterable: true },
  {
    field: "cdienthoai",
    headerName: "Điện thoại",
    width: 130,
    filterable: true,
  },
  {
    field: "cmabenhan",
    headerName: "Mã bệnh án",
    width: 130,
    filterable: true,
  },
  { field: "MaBN", headerName: "Mã bệnh nhân", width: 130, filterable: true },
  { field: "Hoten", headerName: "Tên bệnh nhân", width: 130, filterable: true },
  {
    field: "SoVaoVien",
    headerName: "Số vào viện",
    width: 130,
    filterable: true,
  },
  { field: "SoLuuTru", headerName: "Số lưu trữ", width: 130, filterable: true },
  {
    field: "KhoaDieuTri",
    headerName: "Khoa điều trị",
    width: 130,
    filterable: true,
  },
  { field: "cthaotac", headerName: "Thao tác", width: 100, filterable: true },
  { field: "cgiatricu", headerName: "Giá trị cũ", width: 200 },
  { field: "cgiatrimoi", headerName: "Giá trị mới", width: 200 },
  {
    field: "tngaythaotac",
    headerName: "Ngày thao tác",
    width: 180,
    filterable: true,
  },
];
export default function LichSuThaoTacHsbaPage() {
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
  const [currentTab, setCurrentTab] = React.useState("export");
  const [searchTerm, setSearchTerm] = React.useState(""); // Tên tài liệu
  const [searchStatus, setSearchStatus] = React.useState(""); // Tình trạng xét xuất
  const [searchTuNgay, setSearchTuNgay] = useState<Date | null>(new Date());
  const [searchDenNgay, setSearchDenNgay] = useState<Date | null>(new Date());
  const [searchDateType, setSearchDateType] = React.useState("ngayVaoVien"); // Default search by "Ngày vào viện"
  const [mockData, setRows] = React.useState<DataRow[]>([]); // Dữ liệu bảng
  // State và hàm cho Pagination
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const { data: loginedUser } = useUserStore();
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện

  const handleSearch = async () => {
    console.log("Searching with:", {
      searchFromDate,
      searchToDate,
      colSearchMaBenhAn,
      colSearchThoiGian,
      // ... (thêm các trường tìm kiếm cột khác nếu cần)
    });
    // Logic lọc dữ liệu mockData dựa trên các trường tìm kiếm
    // Logic lọc dữ liệu mockData
    if (!searchTuNgay || !searchDenNgay) return;
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const data = await getnhatkythaotacba(
      loginedUser.ctaikhoan,
      popt,
      formatDate(searchTuNgay),
      formatDate(searchDenNgay)
    );

    setRows(
      (data || []).map((item: DataRow, idx: number) => ({
        id: idx + 1,
        ...item,
      }))
    );
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
              value={searchTuNgay}
              onChange={(value) => setSearchTuNgay(value as Date)}
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
              value={searchDenNgay}
              onChange={(value) => setSearchDenNgay(value as Date)}
              className="w-full"
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </Box>
          <Box flex={1}>
            <Button fullWidth variant="contained" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Box>
          <Box flex={1}>
            <Button fullWidth variant="contained" onClick={handleRefresh}>
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
    </LocalizationProvider>
  );
}
