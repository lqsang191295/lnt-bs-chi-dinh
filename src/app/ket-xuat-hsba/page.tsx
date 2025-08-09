"use client";

import React, { useState } from "react";
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
  RadioGroup,
  FormControlLabel,
  Radio, // Để thêm icon vào TextField
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add"; // Dùng cho nút "Làm mới"
import DateRangeIcon from "@mui/icons-material/DateRange"; // Icon cho DatePicker
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { DatePicker } from "@mui/x-date-pickers";
import { DataGrid } from "@mui/x-data-grid";
import { GridColDef } from "@mui/x-data-grid";

// Dữ liệu cứng cho bảng
interface DataRow {
  id: string;
  trangThaiMuon: "CHƯA MƯỢN" | "ĐANG MƯỢN"; // Trạng thái thực tế
  loaiBaSoTo: string;
  maBenhAn: string;
  hoVaTen: string;
  tuoi: string; // "Tuổi" có vẻ là trường tính toán, giữ dạng string cho đơn giản
  ngayVaoVien: string;
  ngayRaVien: string; // Có thể rỗng
  chanDoan: string;
  khoa: string;
}

const mockData: DataRow[] = [
  {
    id: "1",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN000645B",
    maBenhAn: "BA2507290175",
    hoVaTen: "NGUYỄN THỊ KIM HƯƠNG",
    tuoi: "33 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "2",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN0037234",
    maBenhAn: "BA2507290174",
    hoVaTen: "NGUYỄN THỊ THU",
    tuoi: "60 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "3",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN003824B5",
    maBenhAn: "BA2507290173",
    hoVaTen: "NGUYỄN THỊ LỆ THU",
    tuoi: "68 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "4",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN00331862",
    maBenhAn: "BA2507290171",
    hoVaTen: "DƯƠNG THỊ THÙY LAN",
    tuoi: "71 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Y học cổ truyền và Phục hồi chức năng",
  },
  {
    id: "5",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN00317513",
    maBenhAn: "BA2507290170",
    hoVaTen: "PHẠM THỊ HỒNG NGA",
    tuoi: "50 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "6",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN0038380",
    maBenhAn: "BA2507290169",
    hoVaTen: "NGUYỄN CAO LỰC",
    tuoi: "20 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "7",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN003557B9",
    maBenhAn: "BA2507290167",
    hoVaTen: "VÕ ĐỖ THỊ THƠ",
    tuoi: "31 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "8",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN00322475",
    maBenhAn: "BA2507290166",
    hoVaTen: "VÕ XUÂN CHÍNH",
    tuoi: "71 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "9",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN00302331",
    maBenhAn: "BA2507290165",
    hoVaTen: "HUỲNH CÔNG HẢO",
    tuoi: "71 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "29/07/2025",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "10",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN000656B3",
    maBenhAn: "BA2507290164",
    hoVaTen: "NGUYỄN HOÀNG LƯƠNG",
    tuoi: "53 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
];

export default function BorrowReturnPage() {
  const [currentTab, setCurrentTab] = React.useState("borrow");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [searchKhoa, setSearchKhoa] = React.useState("");
  const [searchTuNgay, setSearchTuNgay] = React.useState("");
  const [searchDenNgay, setSearchDenNgay] = React.useState("");
  const [searchDateType, setSearchDateType] = React.useState("ngayVaoVien"); // Default search by "Ngày vào viện"
  const columns: GridColDef[] = [
    { field: "ID", headerName: "ID", width: 60 },
    {
      field: "TrangThaiBA",
      headerName: "Trạng thái",
      width: 100,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          color={params.value === "MO" ? "success" : "primary"}>
          {params.value}
        </Button>
      ),
    },
    { field: "SoLuuTru", headerName: "Số lưu trữ", width: 100 },
    { field: "MaBANoiTru", headerName: "Mã BA", width: 130 },
    { field: "Hoten", headerName: "Họ và tên", width: 200 },
    { field: "MaBN", headerName: "Mã BN", width: 130 },
    { field: "Ngaysinh", headerName: "Ngày sinh", width: 130 },
    { field: "NgayVao", headerName: "Ngày vào viện", width: 130 },
    { field: "NgayRa", headerName: "Ngày ra viện", width: 130 },
    { field: "KhoaVaoVien", headerName: "Khoa nhập viện", width: 100 },
    { field: "KhoaDieuTri", headerName: "Khoa điều trị", width: 200 },
    { field: "LoaiBenhAn", headerName: "Loại BA", width: 130 },
    { field: "BsDieuTriKyTen", headerName: "Bác sĩ điều trị", width: 130 },
    // { field: "doiTuong", headerName: "Đối tượng", width: 100 },
    // { field: "hinhThuc", headerName: "Hình thức xử trí", width: 130 },
    // { field: "phieu", headerName: "Phiếu", width: 100 },
  ];
  const [rows, setRows] = useState<any[]>([]);
  // State và hàm cho Pagination
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleSearch = () => {
    console.log("Searching with:", {
      searchTerm,
      searchKhoa,
      searchTuNgay,
      searchDenNgay,
      searchDateType,
    });
    // Ở đây bạn có thể thêm logic lọc dữ liệu `mockData` dựa trên các trường tìm kiếm
  };

  const handleRefresh = () => {
    console.log("Refresh clicked!");
    // Logic cho nút "Làm mới"
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = mockData.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Lấy dữ liệu cho trang hiện tại
  const paginatedData = mockData.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(mockData.length / rowsPerPage);

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

  // Hàm render nút "MƯỢN" hoặc "TRẢ" dựa trên trạng thái
  const renderActionButton = (status: DataRow["trangThaiMuon"]) => {
    const buttonText = status === "CHƯA MƯỢN" ? "MƯỢN" : "TRẢ";
    const bgColor = status === "CHƯA MƯỢN" ? "#28a745" : "#dc3545"; // Xanh lá cho MƯỢN, Đỏ cho TRẢ

    return (
      <Button
        variant="contained"
        size="small"
        sx={{
          bgcolor: bgColor,
          color: "#fff",
          textTransform: "none",
          minWidth: "60px",
          height: "24px",
          fontSize: "0.7rem",
          fontWeight: "bold",
          borderRadius: "4px",
          boxShadow: "none",
          "&:hover": {
            bgcolor: bgColor,
            opacity: 0.9,
          },
        }}
        onClick={(e) => {
          e.stopPropagation(); // Ngăn chặn sự kiện click lan ra row
          console.log(`Action: ${buttonText}`);
        }}>
        {buttonText}
      </Button>
    );
  };

  return (
    <Box p={2} className="w-full h-full flex flex-col">
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
        QUẢN LÝ MƯỢN TRẢ HỒ SƠ BỆNH ÁN
      </Typography>

      {/* Filter/Search Bar */}
      <Box>
        <Box display="flex" gap={2} mb={2}>
          <Box flex={3}>
            <Select fullWidth size="small"></Select>
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
                name="popt-radio-group">
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
              format="dd/MM/yyyy"
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
        </Box>
        <TextField
          label="Tên tài liệu"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleSearch} edge="end" size="small">
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </Box>

      {/* Tab Navigation */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          bgcolor: "#f5f5f5",
        }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="borrow return tabs">
          <Tab
            label="MƯỢN HSBA"
            value="borrow"
            sx={{ textTransform: "none" }}
          />
          <Tab label="TRẢ HSBA" value="return" sx={{ textTransform: "none" }} />
          <Tab
            label="LỊCH SỬ MƯỢN TRẢ"
            value="history"
            sx={{ textTransform: "none" }}
          />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<AddIcon />} // Sử dụng AddIcon hoặc RefreshIcon nếu có
          onClick={handleRefresh}
          sx={{
            bgcolor: "#28a745",
            "&:hover": {
              bgcolor: "#218838",
            },
            color: "#fff",
            textTransform: "none",
            ml: 2,
          }}>
          LÀM MỚI (F5)
        </Button>
      </Box>

      {/* Main Content Area (Padding around the table) */}
      <Box className="flex-1">
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              border: "1px solid #e0e0e0",
            },
          }}
        />
      </Box>
    </Box>
  );
}
