"use client";
import React from "react";
import {
  Typography,
  Box,
  Button,
  Select,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Book,
  ConfirmationNumber,
  Filter,
  FilterListAlt,
  Refresh,
  Report,
  Search,
  Update,
} from "@mui/icons-material";

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

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "maBenhAn", headerName: "Mã Bệnh Án", width: 150 },
  { field: "hoVaTen", headerName: "Họ và Tên", flex: 1, minWidth: 180 },
  { field: "ngaySinh", headerName: "Ngày Sinh", width: 120 },
  { field: "gioiTinh", headerName: "Giới Tính", width: 100 },
  { field: "khoa", headerName: "Khoa", flex: 1, minWidth: 200 },
  { field: "ngayVaoVien", headerName: "Ngày Vào Viện", width: 140 },
  {
    field: "viTriLuuTru",
    headerName: "Vị Trí Lưu Trữ",
    flex: 1,
    minWidth: 150,
  },
  { field: "trangThai", headerName: "Trạng Thái", width: 120 },
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
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<{ value: unknown }>
      | any
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
    <Box p={2} className="w-full h-full flex flex-col">
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
        TỔNG HỢP LƯU TRỮ HSBA
      </Typography>
      {/* Search Bar */}
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
          startIcon={<ConfirmationNumber />}
          onClick={handleAddNew}
          size="small">
          Số lưu trữ
        </Button>
        <Button
          variant="contained"
          startIcon={<Book />}
          onClick={handleAddNew}
          size="small">
          Phân loại bệnh án
        </Button>
        <Button
          variant="contained"
          startIcon={<Update />}
          onClick={handleAddNew}
          size="small">
          Cập nhật vị trí lưu trữ
        </Button>
        <Button
          variant="contained"
          startIcon={<FilterListAlt />}
          onClick={handleAddNew}
          size="small">
          Kết xuất
        </Button>
        <Button
          variant="contained"
          startIcon={<Report />}
          onClick={handleAddNew}
          size="small">
          Báo cáo
        </Button>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleAddNew}
          size="small">
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
