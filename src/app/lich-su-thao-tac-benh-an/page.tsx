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


  const handleChangeRowsPerPage = (
    event: SelectChangeEvent
  ) => {
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
            QUẢN LÝ LỊCH SỬ THAO TÁC BỆNH ÁN
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Filter/Search Bar */}
      <Box sx={{ p: 2, bgcolor: "#fff", borderBottom: "1px solid #e0e0e0" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "flex-end",
            mb: 2,
          }}>
          <Typography variant="body2" color="text.secondary">
            Từ ngày
          </Typography>
          <TextField
            type="date"
            variant="outlined"
            size="small"
            value={searchFromDate}
            onChange={(e) => setSearchFromDate(e.target.value)}
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
          <Typography variant="body2" color="text.secondary">
            Đến ngày
          </Typography>
          <TextField
            type="date"
            variant="outlined"
            size="small"
            value={searchToDate}
            onChange={(e) => setSearchToDate(e.target.value)}
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
          {/* Biểu tượng Toggle View (tùy chọn) */}
          <IconButton sx={{ ml: 1, p: 0.5 }}>
            <GridViewIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ px: 3, bgcolor: "#1976d2", textTransform: "none" }}>
            Tìm kiếm
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              bgcolor: "#28a745",
              "&:hover": {
                bgcolor: "#218838",
              },
              color: "#fff",
              textTransform: "none",
              px: 3,
            }}>
            REFRESH
          </Button>
        </Box>
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
            aria-label="audit log table"
            size="small">
            <TableHead sx={{ bgcolor: "#e0e0e0" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Stt</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Mã bệnh án
                  <ColumnSearchTextField
                    value={colSearchMaBenhAn}
                    onChange={setColSearchMaBenhAn}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Thời gian
                  <ColumnSearchTextField
                    value={colSearchThoiGian}
                    onChange={setColSearchThoiGian}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Giá trị cũ
                  <ColumnSearchTextField
                    value={colSearchGiaTriCu}
                    onChange={setColSearchGiaTriCu}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Giá trị mới
                  <ColumnSearchTextField
                    value={colSearchGiaTriMoi}
                    onChange={setColSearchGiaTriMoi}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Loại
                  <ColumnSearchTextField
                    value={colSearchLoai}
                    onChange={setColSearchLoai}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Tác vụ
                  <ColumnSearchTextField
                    value={colSearchTacVu}
                    onChange={setColSearchTacVu}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Ghi chú
                  <ColumnSearchTextField
                    value={colSearchGhiChu}
                    onChange={setColSearchGhiChu}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Nội dung
                  <ColumnSearchTextField
                    value={colSearchNoiDung}
                    onChange={setColSearchNoiDung}
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow
                  hover
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>{row.stt}</TableCell>
                  <TableCell>{row.maBenhAn}</TableCell>
                  <TableCell>{row.thoiGian}</TableCell>
                  <TableCell>{row.giaTriCu}</TableCell>
                  <TableCell>{row.giaTriMoi}</TableCell>
                  <TableCell>{row.loai}</TableCell>
                  <TableCell>{row.tacVu}</TableCell>
                  <TableCell>{row.ghiChu}</TableCell>
                  <TableCell>{row.noiDung}</TableCell>
                </TableRow>
              ))}
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
              totalItems
            )} trên ${totalItems}`}
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
