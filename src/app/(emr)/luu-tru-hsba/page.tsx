// src/app/luu-tru-hsba/page.tsx
"use client";
import { Search } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { capnhathosobenhan, getHosobenhan } from "@/actions/act_thosobenhan";
import HeadMetadata from "@/components/HeadMetadata";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { ILoaiLuuTru } from "@/model/tloailuutru";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useUserStore } from "@/store/user";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
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
  { field: "KhoaDieuTri", headerName: "", width: 0 }, // Ẩn cột này
  { field: "TenKhoaDieuTri", headerName: "Khoa điều trị", width: 200 },
  { field: "LoaiBenhAn", headerName: "Loại BA", width: 130 },
  { field: "BsDieuTriKyTen", headerName: "Bác sĩ điều trị", width: 130 },
  { field: "SoLuuTru", headerName: "Số lưu trữ", width: 100 },
  { field: "NgayLuuTru", headerName: "Ngày lưu trữ", width: 100 },
  { field: "ViTriLuuTru", headerName: "Vị trí lưu trữ", width: 150 },
  { field: "TenLoaiLuuTru", headerName: "Loại lưu trữ", width: 200 },
  { field: "SoNamLuuTru", headerName: "Số năm lưu trữ", width: 150 },
  { field: "LoaiLuuTru", headerName: "", width: 0 }, // Ẩn cột này
];

export default function LuuTruHsbaPage() {
  const [selectedRow, setSelectedRow] = useState<IHoSoBenhAn | null>(null); // Single row selection
  const [openDialog, setOpenDialog] = useState(false);
  const [loaiLuuTruList, setLoaiLuuTruList] = useState<ILoaiLuuTru[]>([]);
  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [selectedKhoa, setSelectedKhoa] = useState("all");
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<IHoSoBenhAn[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện
  const { data: loginedUser } = useUserStore();
  const [searchingData, setSearchingData] = useState<boolean>(false);
  // Form data for dialog
  const [formData, setFormData] = useState({
    ID: "",
    SoVaoVien: "",
    NgayVaoVien: new Date(),
    NgayRaVien: new Date(),
    HoTen: "",
    NgaySinh: "",
    GioiTinh: "",
    DiaChi: "",
    KhoaDieuTri: "",
    SoLuuTru: "",
    ViTriLuuTru: "",
    NgayLuuTru: new Date(),
    LoaiLuuTru: "",
  });

  const fetchLoaiLuuTru = async () => {
    try {
      const result = await DataManager.getDmLoaiLuuTru();
      // console.log("Loai luu tru:", result);
      setLoaiLuuTruList(result || []);
    } catch {
      setLoaiLuuTruList([]);
    }
  };

  useEffect(() => {
    fetchLoaiLuuTru();
  }, []);

  const fetchKhoaList = async () => {
    try {
      const dataKhoaPhong = await DataManager.getDmKhoaPhong();
      setKhoaList(dataKhoaPhong);
    } catch (error) {
      // console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  };
  // Fetch khoa list from API
  useEffect(() => {
    fetchKhoaList();
  }, []);

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
    setSelectedRow(selectedRowsData[0] || null);
  };

  // Mở dialog cập nhật lưu trữ
  const handleOpenDialog = () => {
    if (!selectedRow) {
      ToastWarning("Vui lòng chọn một hồ sơ bệnh án!");
      return;
    }

    // Fill form with selected row data
    setFormData({
      ID: selectedRow.ID,
      SoVaoVien: selectedRow.SoVaoVien || "",
      NgayVaoVien: (selectedRow.NgayVao as Date) || new Date(),
      NgayRaVien: (selectedRow.NgayRa as Date) || new Date(),
      HoTen: selectedRow.Hoten || "",
      NgaySinh: selectedRow.Ngaysinh || "",
      GioiTinh: selectedRow.Gioitinh || "",
      DiaChi: selectedRow.Diachi || "",
      KhoaDieuTri: selectedRow.TenKhoaDieuTri || "",
      SoLuuTru: selectedRow.SoLuuTru || "",
      ViTriLuuTru: selectedRow.ViTriLuuTru || "",
      NgayLuuTru: selectedRow.NgayLuuTru
        ? new Date(selectedRow.NgayLuuTru)
        : new Date(),
      LoaiLuuTru: selectedRow.LoaiLuuTru || "",
    });

    setOpenDialog(true);
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Lưu thông tin lưu trữ
  const handleSaveLuuTru = async () => {
    if (!selectedRow) return;

    try {
      const updatedHsba = {
        ...selectedRow,
        SoLuuTru: formData.SoLuuTru,
        ViTriLuuTru: formData.ViTriLuuTru,
        NgayLuuTru: formData.NgayLuuTru,
        LoaiLuuTru: formData.LoaiLuuTru,
      };

      await capnhathosobenhan(loginedUser.ctaikhoan, "3", updatedHsba);

      // Refresh data after update
      await handleSearch();

      setOpenDialog(false);
      ToastSuccess("Cập nhật thông tin lưu trữ thành công!");
    } catch (error) {
      console.error("Error updating storage info:", error);
      ToastError("Có lỗi xảy ra khi cập nhật thông tin lưu trữ!");
    }
  };

  // Hàm tìm kiếm hồ sơ bệnh án
  const handleSearch = async () => {
    if (!tuNgay || !denNgay) return;

    try {
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

      setRows(
        (data || []).map((item: IHoSoBenhAn) => ({
          id: item.ID, // Use ID or index as row ID
          ...item,
        }))
      );
      //console.log("Search results:", data);
    } catch {
      //console.error("Error fetching hồ sơ bệnh án:", error);
    } finally {
      setSearchingData(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata title="Quản lý lưu trữ hồ sơ bệnh án" />

      <Box p={2} className="w-full h-full flex flex-col">
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          QUẢN LÝ LƯU TRỮ HSBA
        </Typography>
        {/* Search Bar */}
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
            startIcon={<SaveAltIcon />}
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            disabled={!selectedRow}
            size="small">
            Cập nhật lưu trữ
          </Button>
        </Box>

        {/* Main Content Area (Padding around the table) */}
        <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            loading={searchingData}
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
              "& .Mui-selected": {
                backgroundColor: "#e3f2fd !important",
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

        {/* Dialog cập nhật lưu trữ */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth>
          <DialogTitle
            sx={{
              fontWeight: "bold",
              fontSize: "18px",
              backgroundColor: "#1976d2",
              color: "white",
              textAlign: "center",
              letterSpacing: 1,
            }}>
            CẬP NHẬT THÔNG TIN LƯU TRỮ
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
              {/* Khung thông tin chỉ xem */}
              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: 2,
                  backgroundColor: "#f9f9f9",
                }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                  Thông tin bệnh nhân
                </Typography>

                {/* ID */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="ID"
                    value={formData.ID}
                    fullWidth
                    size="small"
                    sx={{ backgroundColor: "white" }}
                  />
                </Box>

                {/* Số vào viện, Ngày vào viện, Ngày ra viện - cùng 1 hàng */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Số vào viện"
                    value={formData.SoVaoVien}
                    size="small"
                    sx={{ flex: 1, backgroundColor: "white" }}
                  />
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Ngày vào viện"
                    value={formData.NgayVaoVien ? formData.NgayVaoVien : ""}
                    size="small"
                    sx={{ flex: 2, backgroundColor: "white" }}
                  />
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Ngày ra viện"
                    value={formData.NgayRaVien ? formData.NgayRaVien : ""}
                    size="small"
                    sx={{ flex: 2, backgroundColor: "white" }}
                  />
                </Box>

                {/* Họ tên, Ngày sinh, Giới tính - cùng 1 hàng */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Họ và tên"
                    value={formData.HoTen}
                    size="small"
                    sx={{ flex: 2, backgroundColor: "white" }}
                  />
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Ngày sinh"
                    value={formData.NgaySinh}
                    size="small"
                    sx={{ flex: 1, backgroundColor: "white" }}
                  />
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Giới tính"
                    value={formData.GioiTinh}
                    size="small"
                    sx={{ flex: 1, backgroundColor: "white" }}
                  />
                </Box>

                {/* Địa chỉ */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Địa chỉ"
                    value={formData.DiaChi}
                    fullWidth
                    size="small"
                    sx={{ backgroundColor: "white" }}
                  />
                </Box>

                {/* Khoa điều trị */}
                <Box>
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Khoa điều trị"
                    value={formData.KhoaDieuTri}
                    fullWidth
                    size="small"
                    sx={{ backgroundColor: "white" }}
                  />
                </Box>
              </Box>

              {/* Khung thông tin cập nhật */}
              <Box
                sx={{
                  border: "1px solid #1976d2",
                  borderRadius: "8px",
                  padding: 2,
                  backgroundColor: "#f3f7ff",
                }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                  Thông tin lưu trữ
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Số lưu trữ"
                    value={formData.SoLuuTru}
                    onChange={(e) =>
                      setFormData({ ...formData, SoLuuTru: e.target.value })
                    }
                    fullWidth
                    size="small"
                    sx={{ backgroundColor: "white" }}
                  />

                  <TextField
                    label="Vị trí lưu trữ"
                    value={formData.ViTriLuuTru}
                    onChange={(e) =>
                      setFormData({ ...formData, ViTriLuuTru: e.target.value })
                    }
                    fullWidth
                    size="small"
                    sx={{ backgroundColor: "white" }}
                  />

                  <DateTimePicker
                    label="Ngày lưu trữ"
                    value={formData.NgayLuuTru}
                    onChange={(value) =>
                      setFormData({ ...formData, NgayLuuTru: value as Date })
                    }
                    format="dd/MM/yyyy HH:mm:ss"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: { backgroundColor: "white" },
                      },
                    }}
                  />

                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.LoaiLuuTru}
                      onChange={(e) =>
                        setFormData({ ...formData, LoaiLuuTru: e.target.value })
                      }
                      displayEmpty
                      sx={{ backgroundColor: "white" }}>
                      {loaiLuuTruList.map((item) => (
                        <MenuItem key={item.cid} value={item.cid}>
                          {item.ctenloai} ({item.csonamluutru} năm)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSaveLuuTru} variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
