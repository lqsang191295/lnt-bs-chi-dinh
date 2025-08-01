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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add"; // Dùng cho nút "Làm mới"
import DateRangeIcon from "@mui/icons-material/DateRange"; // Icon cho DatePicker
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

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
    <Box sx={{ flexGrow: 1, bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar
        position="static"
        color="inherit"
        elevation={1}
        sx={{ bgcolor: "#fff" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: "#333" }}>
            QUẢN LÝ XÉT XUẤT HỒ SƠ BỆNH ÁN
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Filter/Search Bar */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderBottom: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <TextField
            label="Tên tài liệu"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
            <Select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value as string)}
              displayEmpty>
              <MenuItem value="">Tình trạng xét xuất</MenuItem>
              <MenuItem value="CHƯA XÉT XUẤT">CHƯA XÉT XUẤT</MenuItem>
              <MenuItem value="ĐÃ XÉT XUẤT">ĐÃ XÉT XUẤT</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: 2, mr: -1 }}>
            Từ ngày
          </Typography>
          <TextField
            type="date"
            variant="outlined"
            size="small"
            value={searchTuNgay}
            onChange={(e) => setSearchTuNgay(e.target.value)}
            sx={{ width: "150px" }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DateRangeIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: 2, mr: -1 }}>
            Đến ngày
          </Typography>
          <TextField
            type="date"
            variant="outlined"
            size="small"
            value={searchDenNgay}
            onChange={(e) => setSearchDenNgay(e.target.value)}
            sx={{ width: "150px" }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DateRangeIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <Select
              value={searchDateType}
              onChange={(e) => setSearchDateType(e.target.value as string)}
              displayEmpty>
              <MenuItem value="ngayVaoVien">Ngày vào viện</MenuItem>
              <MenuItem value="ngayRaVien">Ngày ra viện</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ px: 3, bgcolor: "#1976d2", textTransform: "none" }}>
            Tìm kiếm
          </Button>
        </Box>
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
          aria-label="export history tabs">
          <Tab label="KẾT XUẤT" value="export" sx={{ textTransform: "none" }} />
          <Tab label="LỊCH SỬ" value="history" sx={{ textTransform: "none" }} />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
      <Box sx={{ p: 2 }}>
        {/* Data Table */}
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
          }}>
          <Table
            sx={{ minWidth: 650 }}
            aria-label="export management table"
            size="small">
            <TableHead sx={{ bgcolor: "#e0e0e0" }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < paginatedData.length
                    }
                    checked={
                      paginatedData.length > 0 &&
                      selected.length === paginatedData.length
                    }
                    onChange={handleSelectAllClick}
                  />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Chọn
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Trạng thái kết xuất
                    <FormControl
                      variant="standard"
                      size="small"
                      sx={{ minWidth: 60 }}>
                      <Select
                        value="" // Giá trị rỗng để hiển thị "Tất cả"
                        displayEmpty
                        inputProps={{ "aria-label": "select all status" }}
                        sx={{
                          ".MuiOutlinedInput-notchedOutline": { border: 0 },
                          ".MuiSelect-select": { py: 0.5, px: 0.5 },
                        }}>
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value="CHƯA XÉT XUẤT">Chưa xét xuất</MenuItem>
                        <MenuItem value="ĐÃ XÉT XUẤT">Đã xét xuất</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton size="small">
                      <SearchIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Ngày kết xuất
                    <FormControl
                      variant="standard"
                      size="small"
                      sx={{ minWidth: 60 }}>
                      <Select
                        value="" // Giá trị rỗng để hiển thị "Tất cả"
                        displayEmpty
                        inputProps={{ "aria-label": "select all date" }}
                        sx={{
                          ".MuiOutlinedInput-notchedOutline": { border: 0 },
                          ".MuiSelect-select": { py: 0.5, px: 0.5 },
                        }}>
                        <MenuItem value="">Tất cả</MenuItem>
                        {/* Thêm các tùy chọn ngày cụ thể nếu cần */}
                      </Select>
                    </FormControl>
                    <IconButton size="small">
                      <SearchIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Loại BA/Số tờ
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <SearchIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Mã bệnh án
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <SearchIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Mã bệnh nhân
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <SearchIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Họ và tên
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <SearchIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tuổi</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Ngày vào viện
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <SearchIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Ngày ra viện
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <SearchIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Chẩn đoán</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Khoa
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <SearchIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${row.id}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                        onChange={(event) => handleClick(event, row.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {renderStatusButton(row.trangThaiXetXuat)}
                      </Box>
                    </TableCell>
                    <TableCell>{row.ngayKetXuat}</TableCell>
                    <TableCell>{row.loaiBaSoTo}</TableCell>
                    <TableCell component="th" id={labelId} scope="row">
                      {row.maBenhAn}
                    </TableCell>
                    <TableCell>{row.maBenhNhan}</TableCell>
                    <TableCell>{row.hoVaTen}</TableCell>
                    <TableCell>{row.tuoi}</TableCell>
                    <TableCell>{row.ngayVaoVien}</TableCell>
                    <TableCell>{row.ngayRaVien}</TableCell>
                    <TableCell>{row.chanDoan}</TableCell>
                    <TableCell>{row.khoa}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
            p: 2,
            bgcolor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            boxShadow: "none",
          }}>
          <Typography variant="body2" color="text.secondary">
            {`${(page - 1) * rowsPerPage + 1} đến ${Math.min(
              page * rowsPerPage,
              mockData.length
            )} trên ${mockData.length}`}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            renderItem={(item) => (
              <Button
                {...item}
                sx={{
                  minWidth: "32px",
                  height: "32px",
                  borderRadius: "4px",
                  "&.Mui-selected": {
                    bgcolor: "#1976d2",
                    color: "#fff",
                    "&:hover": {
                      bgcolor: "#1565c0",
                    },
                  },
                  "&:hover": {
                    bgcolor: "#e0e0e0",
                  },
                }}>
                {item.type === "previous" && <KeyboardArrowLeft />}
                {item.type === "next" && <KeyboardArrowRight />}
                {item.type === "first" && <FirstPageIcon />}
                {item.type === "last" && <LastPageIcon />}
                {item.type === "page" && item.page}
              </Button>
            )}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Rows per page:
            </Typography>
            <FormControl variant="outlined" size="small">
              <Select
                value={rowsPerPage.toString()}
                onChange={handleChangeRowsPerPage}
                displayEmpty
                inputProps={{ "aria-label": "Rows per page" }}
                sx={{ height: "32px" }}>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
