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
  InputAdornment, // Để thêm icon vào TextField
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
    ngayRaVaoVien: "",
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
    ngayVaoVaoVien: "29/07/2025",
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
            QUẢN LÝ MƯỢN TRẢ HỒ SƠ BỆNH ÁN
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Filter/Search Bar */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderBottom: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <TextField
            label="Khoa"
            variant="outlined"
            size="small"
            value={searchKhoa}
            onChange={(e) => setSearchKhoa(e.target.value)}
            sx={{ flex: 1 }}
          />
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
            aria-label="borrow return table"
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
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Trạng thái
                    <IconButton size="small" sx={{ ml: 0.5 }}>
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
                    // onClick={(event) => handleClick(event, row.id)} // Click row không toggle checkbox nếu có nút riêng
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
                        onChange={(event) => handleClick(event, row.id)} // Checkbox riêng để toggle
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {renderActionButton(row.trangThaiMuon)}
                        <Typography variant="body2">
                          {row.trangThaiMuon}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.loaiBaSoTo}</TableCell>
                    <TableCell component="th" id={labelId} scope="row">
                      {row.maBenhAn}
                    </TableCell>
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
