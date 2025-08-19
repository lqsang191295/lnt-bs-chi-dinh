"use client";

import { getHosobenhan, getmuontraHSBA } from "@/actions/act_thosobenhan";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { ITMuonTraHSBA } from "@/model/tmuontrahsba";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useUserStore } from "@/store/user";
import { History, NoteAdd, Search } from "@mui/icons-material";
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
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useEffect, useState } from "react";
import DsMuonHsba from "./components/ds-muon-hsba";
import LsMuonTraHsba from "./components/ls-muon-tra-hsba";

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
  // { field: "MaBANoiTru", headerName: "Mã BA", width: 130 },
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
export default function MuonTraHsbaPage() {
  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<IHoSoBenhAn[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện

  const { data: loginedUser } = useUserStore();
  const [searchingData, setSearchingData] = useState<boolean>(false);
  // State và hàm cho Pagination
  const [isOpenDsMuonHsba, setIsOpenDsMuonHsba] = useState(false);
  const [isOpenLsMuonTraHsba, setIsOpenLsMuonTraHsba] = useState(false);
  const [selectedHsbaForDetail, setSelectedHsbaForDetail] =
    useState<IHoSoBenhAn | null>(null);
  const [phieumuontraHSBA, setPhieumuontraHSBA] =
    useState<ITMuonTraHSBA | null>(null);
  const [selectedKhoa, setSelectedKhoa] = useState("all"); // Trạng thái chọn khoa

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

      setRows(
        (data || []).map((item: IHoSoBenhAn, idx: number) => ({
          id: idx + 1,
          ...item,
        }))
      );
      //console.log("Search results:", data);
    } catch (error) {
      console.error("Error fetching HSBA data:", error);
    } finally {
      setSearchingData(false);
    }
  };

  const fetchKhoaList = async () => {
    try {
      const dataKhoaPhong = await DataManager.getDmKhoaPhong();
      setKhoaList(dataKhoaPhong);
    } catch (error) {
      console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  };

  const handleRowSelected = async (selectedIds: unknown[]) => {
    //console.log("Selected IDs:", selectedIds); // Debug log
    if (selectedIds.length > 0) {
      const selectedId = selectedIds[0];
      //console.log("rows:", rows); // Debug log
      const selectedRowData = rows.find((row) => row.ID === selectedId);
      //console.log("Selected row data HSBA:", selectedRowData); // Debug log
      if (selectedRowData) {
        setSelectedHsbaForDetail(selectedRowData);

        try {
          const result = await getmuontraHSBA(
            loginedUser.ctaikhoan,
            "1",
            selectedRowData.ID.toString() || "",
            "",
            ""
          );
          //console.log("Phieu muon tra result:", result); // Debug log

          if (result && result.length > 0) {
            setPhieumuontraHSBA(result[0]); // Lấy phiếu đầu tiên nếu là array
          } else {
            setPhieumuontraHSBA(null);
          }
        } catch (error) {
          //console.error("Error fetching phieu muon tra:", error);
          setPhieumuontraHSBA(null);
        }
      }
    } else {
      setPhieumuontraHSBA(null);
      setSelectedHsbaForDetail(null);
    }
  };

  // Hàm xử lý khi chọn rows trong DataGrid
  const handleRowSelectionChange = async (
    selectionModel: GridRowSelectionModel
  ) => {
    let selectedIds: unknown[] = [];

    if (selectionModel && selectionModel.ids) {
      selectedIds = Array.from(selectionModel.ids);
    } else if (Array.isArray(selectionModel)) {
      selectedIds = selectionModel;
    }

    handleRowSelected(selectedIds);
  };

  // Hàm xác định loại dựa trên trạng thái phiếu
  const getLoaiPhieu = () => {
    if (!phieumuontraHSBA) return "MUON"; // Nếu chưa có phiếu thì là mượn mới

    // Kiểm tra trạng thái trả
    if (phieumuontraHSBA.ctrangthaitra === "0" || !phieumuontraHSBA.cngaytra) {
      return "TRA"; // Đã mượn, chưa trả -> cho phép trả
    }

    return "MUON"; // Đã trả hoặc trường hợp khác -> cho phép mượn mới
  };

  // Hàm xử lý double click
  const handleRowDoubleClick = (params: GridRowParams) => {
    handleRowSelected([params.row.id]);

    setIsOpenDsMuonHsba(true);
  };

  // Fetch khoa list from API
  useEffect(() => {
    fetchKhoaList();
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={2} className="w-full h-full flex flex-col">
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          QUẢN LÝ MƯỢN TRẢ HỒ SƠ BỆNH ÁN
        </Typography>

        {/* Filter/Search Bar */}
        <Box display="flex" gap={2} mb={2}>
          <Box flex={3}>
            <Select
              fullWidth
              value={selectedKhoa}
              size="small"
              onChange={(e) => setSelectedKhoa(e.target.value)}
              displayEmpty>
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
            variant="contained"
            startIcon={<NoteAdd />}
            size="small"
            onClick={() => setIsOpenDsMuonHsba(true)}>
            Mượn trả HSBA
          </Button>

          <Button
            variant="contained"
            startIcon={<History />}
            size="small"
            onClick={() => setIsOpenLsMuonTraHsba(true)}>
            Lịch sử mượn trả
          </Button>
        </Box>

        {/* Main Content Area (Padding around the table) */}
        <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            checkboxSelection
            disableMultipleRowSelection
            density="compact"
            onRowSelectionModelChange={handleRowSelectionChange}
            onRowDoubleClick={handleRowDoubleClick}
            loading={searchingData}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
            }}
          />
        </Box>
        <DsMuonHsba
          loai={getLoaiPhieu()}
          phieumuon={phieumuontraHSBA}
          open={isOpenDsMuonHsba}
          onClose={() => setIsOpenDsMuonHsba(false)}
          selectedHsbaForDetail={selectedHsbaForDetail}
        />
        <LsMuonTraHsba
          open={isOpenLsMuonTraHsba}
          onClose={() => setIsOpenLsMuonTraHsba(false)}
          selectedHsbaId={selectedHsbaForDetail?.ID?.toString()} // Truyền ID của HSBA được chọn
        />
      </Box>
    </LocalizationProvider>
  );
}
