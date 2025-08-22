// app/dong-mo-hsba/page.tsx
"use client";
import { capnhathosobenhan, getHosobenhan } from "@/actions/act_thosobenhan";
import HeadMetadata from "@/components/HeadMetadata";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useUserStore } from "@/store/user";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";
import { Search } from "@mui/icons-material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useEffect, useState } from "react";

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
  { field: "MaBANoiTru", headerName: "Mã BA", width: 130 },
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
export default function DongMoHsbaPage() {
  const [selectedRows, setSelectedRows] = useState<IHoSoBenhAn[]>([]);
  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [selectedKhoa, setSelectedKhoa] = useState("all");
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<IHoSoBenhAn[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện
  const { data: loginedUser } = useUserStore();
  const [searchingData, setSearchingData] = useState<boolean>(false);

  const fetchKhoaList = async () => {
    try {
      const dataKhoaPhong = await DataManager.getDmKhoaPhong();
      setKhoaList(dataKhoaPhong);
    } catch (error) {
      console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  };
  // Fetch khoa list from API
  useEffect(() => {
    fetchKhoaList();
  }, []);

  // Hàm xử lý đóng/mở HSBA
  const dongmohsba = async (
    loai: "DONG" | "MO",
    danhSachHSBA: IHoSoBenhAn[]
  ) => {
    if (!danhSachHSBA || danhSachHSBA.length === 0) {
      ToastWarning("Vui lòng chọn ít nhất một hồ sơ bệnh án!");
      return;
    }

    try {
      const promises = danhSachHSBA.map(async (hsba) => {
        const updatedHsba = {
          ...hsba,
          TrangThaiBA: loai === "DONG" ? "DONG" : "MO",
        };
        return await capnhathosobenhan(loginedUser.ctaikhoan, "4", updatedHsba);
      });

      await Promise.all(promises);

      // Refresh data after update
      await handleSearch();

      ToastSuccess(
        `${loai === "DONG" ? "Đóng" : "Mở"} HSBA thành công cho ${
          danhSachHSBA.length
        } hồ sơ!`
      );
    } catch {
      //console.error("Error updating HSBA:", error);
      ToastError(`Có lỗi xảy ra khi ${loai === "DONG" ? "đóng" : "mở"} HSBA!`);
    }
  };

  // Hàm xử lý khi chọn rows trong DataGrid
  const handleRowSelectionChange = (selectionModel: GridRowSelectionModel) => {
    let selectionArray: unknown[] = [];

    //console.log("Selected rows for update:", selectionModel);
    if (selectionModel && selectionModel.ids) {
      selectionArray = Array.from(selectionModel.ids);
    } else if (Array.isArray(selectionModel)) {
      selectionArray = selectionModel;
    }
    //console.log("Selection array:", selectionArray);
    const selectedRowsData = rows.filter((row) =>
      selectionArray.includes(row.ID)
    );
    //console.log("Selected rows data:", selectedRowsData);
    setSelectedRows(selectedRowsData);
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
      //console.log("Fetched HSBA data:", data); // For debugging
      setRows(
        (data || []).map((item: IHoSoBenhAn) => ({
          id: item.ID, // Use ID or index as row ID
          ...item,
        }))
      );
      //console.log("Search results:", data);
    } catch {
      //console.error("Error fetching HSBA data:", error);
    } finally {
      setSearchingData(false);
    }
  };
  // Render component
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata title="Đóng mở hồ sơ bệnh án" />

      <Box p={2} className="w-full h-full flex flex-col overflow-hidden">
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          ĐÓNG MỞ HỒ SƠ BỆNH ÁN
        </Typography>
        <Box display="flex" gap={2} mb={2}>
          <Box flex={3}>
            <Select
              fullWidth
              value={selectedKhoa}
              size="small"
              onChange={(e) => setSelectedKhoa(e.target.value)}>
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
          <Box flex={1}>
            <Button
              fullWidth
              startIcon={<Search />}
              variant="contained"
              size="small"
              onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Box>
        </Box>
        {/* Tab Navigation */}
        <Box className="bg-white flex gap-2 p-2">
          <Button
            startIcon={<LockOutlinedIcon />}
            variant="contained"
            color="error"
            size="small"
            onClick={() => dongmohsba("DONG", selectedRows)}
            disabled={selectedRows.length === 0}>
            Đóng HSBA
          </Button>
          <Button
            startIcon={<LockOpenIcon />}
            variant="contained"
            color="success"
            size="small"
            onClick={() => dongmohsba("MO", selectedRows)}
            disabled={selectedRows.length === 0}>
            Mở HSBA
          </Button>
        </Box>
        <Box className="w-full h-full overflow-hidden">
          <DataGrid
            rows={rows}
            columns={columns}
            loading={searchingData}
            pagination
            checkboxSelection
            disableRowSelectionOnClick
            density="compact"
            onRowSelectionModelChange={handleRowSelectionChange}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                border: "1px solid #e0e0e0",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#f9f9f9",
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "white",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#e3f2fd !important",
              },
            }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
