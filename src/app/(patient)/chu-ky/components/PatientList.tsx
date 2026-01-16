"use client";

import { getPatientCanKyTay } from "@/actions/act_patient";
import { ToastError } from "@/utils/toast";
import { PersonSearch, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useState } from "react";
import PatientTreeView from "./PatientTreeView";

// Interface đã được tách riêng hoặc để cuối file
export interface IPatientInfoCanKyTay {
  Ma: string;
  Sovaovien: string;
  Hoten: string;
  Ngaysinh: string;
  Thangsinh: string;
  Namsinh: string;
  Gioitinh: string;
  Diachi: string;
  Dienthoai: string;
  SoCMND: string;
  TaiLieuKy: string;
  FilePdfKySo: string;
  LoaiPhieu: string;
  ID: number;
}

export default function PatientList({
  onSelectPatient,
}: {
  onSelectPatient: (patient: IPatientInfoCanKyTay | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [searchTuNgay, setSearchTuNgay] = useState<Date | null>(new Date());
  const [searchDenNgay, setSearchDenNgay] = useState<Date | null>(new Date());
  const [searchText, setSearchText] = useState(""); // State cho ô search text
  const [rows, setRows] = useState<IPatientInfoCanKyTay[]>([]);

  const handleSearch = async () => {
    try {
      if (!searchTuNgay || !searchDenNgay) return;

      if (!searchText.trim()) {
        ToastError("Vui lòng nhập từ khóa tìm kiếm!");
        return;
      }

      setLoading(true);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const data = await getPatientCanKyTay(
        formatDate(searchTuNgay),
        formatDate(searchDenNgay),
        searchText
      );

      setRows(
        (data || []).map((item: IPatientInfoCanKyTay) => ({
          id: item.Sovaovien,
          ...item,
        }))
      );
    } catch (error) {
      console.error("Error fetching history data:", error);
      ToastError("Lỗi khi tìm kiếm dữ liệu bệnh nhân!");
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc dữ liệu theo Ma, Sovaovien, Hoten (Client-side filtering)
  // const filteredRows = useMemo(() => {
  //   if (!searchText.trim()) return rows;

  //   const searchLower = searchText.toLowerCase();
  //   return rows.filter(
  //     (p) =>
  //       p.Ma?.toLowerCase().includes(searchLower) ||
  //       p.Sovaovien?.toLowerCase().includes(searchLower) ||
  //       p.Hoten?.toLowerCase().includes(searchLower)
  //   );
  // }, [rows, searchText]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="w-full h-full flex flex-col bg-white">
        {/* Section: Filters */}
        <Box className="flex flex-col p-2 border-b" gap={1}>
          {/* Thanh search nhanh theo tên/mã */}
          <TextField
            size="small"
            placeholder="Tìm theo Mã, Số vào viện, Họ tên..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonSearch fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Box className="flex flex-col gap-2">
            <DatePicker
              label="Từ ngày"
              format="dd/MM/yyyy"
              value={searchTuNgay}
              onChange={(value) => setSearchTuNgay(value as Date)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
            <DatePicker
              label="Đến ngày"
              format="dd/MM/yyyy"
              value={searchDenNgay}
              onChange={(value) => setSearchDenNgay(value as Date)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Box>

          <Button
            fullWidth
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Search />
              )
            }
            variant="contained"
            disabled={loading}
            onClick={handleSearch}
            sx={{ fontWeight: "bold" }}>
            {loading ? "Đang tải..." : "Lấy danh sách"}
          </Button>
        </Box>

        {/* Section: Result List */}
        <Box className="flex-1 relative overflow-hidden">
          {loading ? (
            <Box className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white bg-opacity-80">
              <CircularProgress size={40} thickness={4} />
              <Typography
                sx={{ mt: 2, fontWeight: 500, color: "text.secondary" }}>
                Loading data...
              </Typography>
            </Box>
          ) : null}

          <Box className="h-full overflow-auto">
            <PatientTreeView
              // rows={filteredRows}
              rows={rows}
              onSelectPatient={onSelectPatient}
            />

            {!loading &&
              //&& filteredRows.length === 0
              rows.length <= 0 && (
                <Typography
                  align="center"
                  sx={{ mt: 4, color: "text.disabled", fontSize: "0.875rem" }}>
                  Không tìm thấy bệnh nhân phù hợp
                </Typography>
              )}
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
