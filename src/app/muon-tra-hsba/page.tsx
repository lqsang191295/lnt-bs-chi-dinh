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
import { DatePicker } from "@mui/x-date-pickers";
import {
  HighlightOff,
  History,
  NoteAdd,
  Refresh,
  Search,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import DsMuonHsba from "./components/ds-muon-hsba";
import LsMuonTraHsba from "./components/ls-muon-tra-hsba";
import DsTraHsba from "./components/ds-tra-hsba";

// Dữ liệu cứng cho bảng
interface DataRow {
  id: string;
  trangThaiXetXuat: "CHƯA XÉT XUẤT" | "ĐÃ XÉT XUẤT"; // Trạng thái thực tế
  ngayKetXuat: string; // Có thể rỗng nếu chưa xét xuất
  loaiBaSoTo: string;
  maBenhAn: string;
  maBenhNhan: string; // Cột mới
  hoVaTen: string;
  tuoi: string;
  ngayVaoVien: string;
  ngayRaVien: string; // Có thể rỗng
  chanDoan: string;
  khoa: string;
}

const mockData: DataRow[] = [
  {
    id: "1",
    trangThaiXetXuat: "CHƯA XÉT XUẤT",
    ngayKetXuat: "",
    loaiBaSoTo: "",
    maBenhAn: "BA2507290172",
    maBenhNhan: "BN0008830",
    hoVaTen: "ĐỖ MINH KHANG",
    tuoi: "18 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "2",
    trangThaiXetXuat: "CHƯA XÉT XUẤT",
    ngayKetXuat: "",
    loaiBaSoTo: "",
    maBenhAn: "BA2507290191",
    maBenhNhan: "BN00044925",
    hoVaTen: "NGUYỄN THỊ ANH TUYẾT",
    tuoi: "88 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "3",
    trangThaiXetXuat: "CHƯA XÉT XUẤT",
    ngayKetXuat: "",
    loaiBaSoTo: "",
    maBenhAn: "BA2507290190",
    maBenhNhan: "BN00007627",
    hoVaTen: "HUỲNH THỊ TRÚC LY",
    tuoi: "34 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "4",
    trangThaiXetXuat: "CHƯA XÉT XUẤT",
    ngayKetXuat: "",
    loaiBaSoTo: "",
    maBenhAn: "BA2507290189",
    maBenhNhan: "BN00001385",
    hoVaTen: "LÊ THỊ PHƯỢNG",
    tuoi: "50 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "5",
    trangThaiXetXuat: "CHƯA XÉT XUẤT",
    ngayKetXuat: "",
    loaiBaSoTo: "",
    maBenhAn: "BA2507290188",
    maBenhNhan: "BN00010961",
    hoVaTen: "NGUYỄN HOÀNG VŨ",
    tuoi: "33 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "6",
    trangThaiXetXuat: "CHƯA XÉT XUẤT",
    ngayKetXuat: "",
    loaiBaSoTo: "",
    maBenhAn: "BA2507290187",
    maBenhNhan: "BN00383804",
    hoVaTen: "NGUYỄN THỊ CÚC",
    tuoi: "65 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "7",
    trangThaiXetXuat: "CHƯA XÉT XUẤT",
    ngayKetXuat: "",
    loaiBaSoTo: "",
    maBenhAn: "BA2507290186",
    maBenhNhan: "BN00016440",
    hoVaTen: "NGUYỄN THỊ HƯƠNG",
    tuoi: "42 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "8",
    trangThaiXetXuat: "CHƯA XÉT XUẤT",
    ngayKetXuat: "",
    loaiBaSoTo: "",
    maBenhAn: "BA2507290183",
    maBenhNhan: "BN00002171",
    hoVaTen: "HOÀNG VŨ QUÝ",
    tuoi: "54 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "9",
    trangThaiXetXuat: "CHƯA XÉT XUẤT",
    ngayKetXuat: "",
    loaiBaSoTo: "",
    maBenhAn: "BA2507290184",
    maBenhNhan: "BN00037429",
    hoVaTen: "TÔ VĂN HUỆ",
    tuoi: "66 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "10",
    trangThaiXetXuat: "CHƯA XÉT XUẤT",
    ngayKetXuat: "",
    loaiBaSoTo: "",
    maBenhAn: "BA2507290183",
    maBenhNhan: "BN00038059",
    hoVaTen: "VÕ THỊ PHƯỚC CHÂU",
    tuoi: "38 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
];
const columns = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "trangThaiXetXuat", headerName: "Trạng Thái Xét Xuất", flex: 1 },
  { field: "ngayKetXuat", headerName: "Ngày Kết Xuất", width: 150 },
  { field: "loaiBaSoTo", headerName: "Loại BA Sổ To", width: 150 },
  { field: "maBenhAn", headerName: "Mã Bệnh Án", width: 160 },
  { field: "maBenhNhan", headerName: "Mã Bệnh Nhân", width: 160 },
  { field: "hoVaTen", headerName: "Họ và Tên", flex: 1 },
  { field: "tuoi", headerName: "Tuổi", width: 120 },
  { field: "ngayVaoVien", headerName: "Ngày Vào Viện", width: 150 },
  { field: "ngayRaVien", headerName: "Ngày Ra Viện", width: 150 },
  { field: "chanDoan", headerName: "Chẩn Đoán", flex: 1 },
  { field: "khoa", headerName: "Khoa", flex: 1 },
];
export default function ExportManagementPage() {
  const [currentTab, setCurrentTab] = React.useState("export");
  const [searchTerm, setSearchTerm] = React.useState(""); // Tên tài liệu
  const [searchStatus, setSearchStatus] = React.useState(""); // Tình trạng xét xuất
  const [searchTuNgay, setSearchTuNgay] = React.useState("");
  const [searchDenNgay, setSearchDenNgay] = React.useState("");
  const [searchDateType, setSearchDateType] = React.useState("ngayVaoVien"); // Default search by "Ngày vào viện"

  // State và hàm cho Pagination
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [isOpenDsMuonHsba, setIsOpenDsMuonHsba] = useState(false);
  const [isOpenLsMuonTraHsba, setIsOpenLsMuonTraHsba] = useState(false);
  const [isOpenDsTraHsba, setIsOpenDsTraHsba] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleSearch = () => {
    console.log("Searching with:", {
      searchTerm,
      searchStatus,
      searchTuNgay,
      searchDenNgay,
      searchDateType,
    });
    // Logic lọc dữ liệu mockData
  };

  const handleRefresh = () => {
    console.log("Refresh clicked!");
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

  // Hàm render nút trạng thái "CHƯA XÉT XUẤT"
  const renderStatusButton = (status: DataRow["trangThaiXetXuat"]) => {
    const bgColor = status === "CHƯA XÉT XUẤT" ? "#ffc107" : "#28a745"; // Vàng cho Chưa, Xanh lá cho Đã
    const textColor = status === "CHƯA XÉT XUẤT" ? "#212529" : "#fff";

    return (
      <Button
        variant="contained"
        size="small"
        sx={{
          bgcolor: bgColor,
          color: textColor,
          textTransform: "none",
          minWidth: "100px",
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
          console.log(`Action: ${status}`);
        }}>
        {status}
      </Button>
    );
  };

  return (
    <Box p={2} className="w-full h-full flex flex-col">
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
        QUẢN LÝ XÉT XUẤT HỒ SƠ BỆNH ÁN
      </Typography>

      {/* Filter/Search Bar */}
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
          Mượn HSBA
        </Button>
        <Button
          variant="contained"
          startIcon={<HighlightOff />}
          size="small"
          onClick={() => setIsOpenDsTraHsba(true)}>
          Trả HSBA
        </Button>
        <Button
          variant="contained"
          startIcon={<History />}
          size="small"
          onClick={() => setIsOpenLsMuonTraHsba(true)}>
          Lịch sử mượn trả
        </Button>
        <Button variant="contained" startIcon={<Refresh />} size="small">
          Làm mới
        </Button>
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
          onRowDoubleClick={(row) => {
            setIsOpenDsMuonHsba(true);
          }}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
          }}
        />
      </Box>

      <DsMuonHsba
        open={isOpenDsMuonHsba}
        onClose={() => setIsOpenDsMuonHsba(false)}
      />
      <LsMuonTraHsba
        open={isOpenLsMuonTraHsba}
        onClose={() => setIsOpenLsMuonTraHsba(false)}
      />
      <DsTraHsba
        open={isOpenDsTraHsba}
        onClose={() => setIsOpenDsTraHsba(false)}
      />
    </Box>
  );
}
