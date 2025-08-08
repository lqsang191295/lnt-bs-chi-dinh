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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add"; // Dùng cho nút "Làm mới"
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

// Dữ liệu cứng cho bảng
interface DataRow {
  id: string;
  maBenhAn: string;
  hoVaTen: string;
  ngaySinh: string;
  gioiTinh: string;
  khoa: string;
  ngayVaoVien: string;
  viTriLuuTru: string;
  trangThai: "CHỜ LƯU" | "CHỜ XÁC NHẬN" | "CHỜ DUYỆT" | "ĐÃ LƯU";
}

const mockData: DataRow[] = [
  {
    id: "1",
    maBenhAn: "BA2507290181",
    hoVaTen: "PHAN THỊ TIÊN",
    ngaySinh: "10/04/1958",
    gioiTinh: "Nữ",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
    ngayVaoVien: "29/07/2025",
    viTriLuuTru: "",
    trangThai: "CHỜ LƯU",
  },
  {
    id: "2",
    maBenhAn: "BA2507290178",
    hoVaTen: "NGUYỄN VĂN ĐẶNG",
    ngaySinh: "10/02/1953",
    gioiTinh: "Nam",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
    ngayVaoVien: "29/07/2025",
    viTriLuuTru: "",
    trangThai: "CHỜ DUYỆT",
  },
  {
    id: "3",
    maBenhAn: "BA2507290174",
    hoVaTen: "NGUYỄN THỊ THU",
    ngaySinh: "15/09/1954",
    gioiTinh: "Nữ",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
    ngayVaoVien: "29/07/2025",
    viTriLuuTru: "",
    trangThai: "CHỜ LƯU",
  },
  {
    id: "4",
    maBenhAn: "BA2507290171",
    hoVaTen: "DƯƠNG THỊ THÙY LAN",
    ngaySinh: "16/08/1954",
    gioiTinh: "Nữ",
    khoa: "Khoa Y học cổ truyền và Phục hồi chức năng",
    ngayVaoVien: "29/07/2025",
    viTriLuuTru: "",
    trangThai: "CHỜ XÁC NHẬN",
  },
  {
    id: "5",
    maBenhAn: "BA2507290170",
    hoVaTen: "PHẠM THỊ HỒNG NGA",
    ngaySinh: "01/03/1973",
    gioiTinh: "Nữ",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
    ngayVaoVien: "29/07/2025",
    viTriLuuTru: "",
    trangThai: "CHỜ DUYỆT",
  },
  {
    id: "6",
    maBenhAn: "BA2507290169",
    hoVaTen: "NGUYỄN CAO LỰC",
    ngaySinh: "27/04/2005",
    gioiTinh: "Nam",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
    ngayVaoVien: "29/07/2025",
    viTriLuuTru: "",
    trangThai: "CHỜ LƯU",
  },
  {
    id: "7",
    maBenhAn: "BA2507290165",
    hoVaTen: "HUỲNH CÔNG HẢO",
    ngaySinh: "01/01/1954",
    gioiTinh: "Nam",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
    ngayVaoVien: "29/07/2025",
    viTriLuuTru: "",
    trangThai: "CHỜ DUYỆT",
  },
  {
    id: "8",
    maBenhAn: "BA2507290164",
    hoVaTen: "NGUYỄN HOÀNG LƯƠNG",
    ngaySinh: "26/06/1972",
    gioiTinh: "Nam",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
    ngayVaoVien: "29/07/2025",
    viTriLuuTru: "",
    trangThai: "CHỜ LƯU",
  },
  {
    id: "9",
    maBenhAn: "BA2507290163",
    hoVaTen: "NGUYỄN THỊ NGỌC LIÊN",
    ngaySinh: "05/05/1977",
    gioiTinh: "Nữ",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
    ngayVaoVien: "29/07/2025",
    viTriLuuTru: "",
    trangThai: "CHỜ DUYỆT",
  },
  {
    id: "10",
    maBenhAn: "BA2507290162",
    hoVaTen: "NGUYỄN VĂN KIÊN",
    ngaySinh: "13/06/1956",
    gioiTinh: "Nam",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
    ngayVaoVien: "29/07/2025",
    viTriLuuTru: "",
    trangThai: "CHỜ LƯU",
  },
  {
    id: "11",
    maBenhAn: "BA2507290161",
    hoVaTen: "TRẦN THỊ HƯƠNG",
    ngaySinh: "01/01/1980",
    gioiTinh: "Nữ",
    khoa: "Khoa Nội",
    ngayVaoVien: "28/07/2025",
    viTriLuuTru: "Kho A",
    trangThai: "ĐÃ LƯU",
  },
  {
    id: "12",
    maBenhAn: "BA2507290160",
    hoVaTen: "LÊ VĂN LONG",
    ngaySinh: "15/03/1965",
    gioiTinh: "Nam",
    khoa: "Khoa Ngoại",
    ngayVaoVien: "27/07/2025",
    viTriLuuTru: "Kho B",
    trangThai: "ĐÃ LƯU",
  },
];

export default function HomePage() {
  const [currentTab, setCurrentTab] = React.useState("total");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selected, setSelected] = React.useState<readonly string[]>([]);

  // State và hàm cho Pagination
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleSearch = () => {
    console.log("Searching for:", searchTerm);
    // Ở đây bạn có thể thêm logic lọc dữ liệu `mockData` dựa trên `searchTerm`
  };

  const handleAddNew = () => {
    console.log("Add new item / Refresh clicked!");
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
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{ value: unknown }> | any
  ) => {
    setRowsPerPage(parseInt(event.target.value as string, 10));
    setPage(1); // Reset về trang 1 khi thay đổi số hàng mỗi trang
  };

  const getStatusButton = (status: DataRow["trangThai"]) => {
    let bgColor = "";
    let textColor = "#fff"; // Màu chữ mặc định
    switch (status) {
      case "CHỜ LƯU":
        bgColor = "#ffc107"; // Vàng
        textColor = "#212529"; // Đen cho nền vàng
        break;
      case "CHỜ XÁC NHẬN":
        bgColor = "#007bff"; // Xanh dương
        break;
      case "CHỜ DUYỆT":
        bgColor = "#dc3545"; // Đỏ
        break;
      case "ĐÃ LƯU":
        bgColor = "#28a745"; // Xanh lá
        break;
      default:
        bgColor = "#6c757d"; // Xám
    }
    return (
      <Button
        variant="contained"
        size="small"
        sx={{
          bgcolor: bgColor,
          color: textColor,
          textTransform: "none",
          minWidth: "90px",
          height: "28px",
          fontSize: "0.75rem",
          fontWeight: "bold",
          borderRadius: "4px",
          boxShadow: "none",
          "&:hover": {
            bgcolor: bgColor, // Giữ màu khi hover để tránh thay đổi quá nhiều
            opacity: 0.9,
          },
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
            TỔNG HỢP LƯU TRỮ HSBA
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Search Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          bgcolor: "#fff",
          borderBottom: "1px solid #e0e0e0",
        }}>
        <TextField
          label="Tìm kiếm"
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
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          sx={{
            minWidth: "auto",
            px: 3,
            bgcolor: "#1976d2",
            textTransform: "none",
          }}>
          Tìm kiếm
        </Button>
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
          aria-label="basic tabs example">
          <Tab
            label="TỔNG HỢP HSBA"
            value="total"
            sx={{ textTransform: "none" }}
          />
          <Tab
            label="MỞ BỆNH ÁN (F1)"
            value="open"
            sx={{ textTransform: "none" }}
          />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{
            bgcolor: "#28a745", // Màu xanh lá cây cho nút "Làm mới"
            "&:hover": {
              bgcolor: "#218838",
            },
            color: "#fff",
            textTransform: "none",
            ml: 2,
          }}>
          Làm mới
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
          <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
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
                    inputProps={{ "aria-label": "select all desserts" }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Mã bệnh án</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Họ và tên</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Ngày sinh</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Giới tính</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Khoa</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Ngày vào viện</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Vị trí lưu trữ
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Trạng thái
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
                    onClick={(event) => handleClick(event, row.id)}
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
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row">
                      {row.maBenhAn}
                    </TableCell>
                    <TableCell>{row.hoVaTen}</TableCell>
                    <TableCell>{row.ngaySinh}</TableCell>
                    <TableCell>{row.gioiTinh}</TableCell>
                    <TableCell>{row.khoa}</TableCell>
                    <TableCell>{row.ngayVaoVien}</TableCell>
                    <TableCell>{row.viTriLuuTru}</TableCell>
                    <TableCell align="center">
                      {getStatusButton(row.trangThai)}
                    </TableCell>
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
                  minWidth: "32px", // Giảm kích thước nút phân trang
                  height: "32px",
                  borderRadius: "4px", // Làm tròn nhẹ
                  "&.Mui-selected": {
                    bgcolor: "#1976d2", // Màu nền khi được chọn
                    color: "#fff", // Màu chữ khi được chọn
                    "&:hover": {
                      bgcolor: "#1565c0", // Màu nền hover khi được chọn
                    },
                  },
                  "&:hover": {
                    bgcolor: "#e0e0e0", // Màu nền hover khi không được chọn
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
