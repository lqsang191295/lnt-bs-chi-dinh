"use client";

import { getPatientCanKyTay } from "@/actions/act_patient";
import { IPatientInfoCanKyTay } from "@/model/tpatient";
import { ToastError } from "@/utils/toast";
import { Search } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useState } from "react";
import PatientTreeView from "./PatientTreeView";

export default function PatientList({
  onSelectPatient,
}: {
  onSelectPatient: (patient: IPatientInfoCanKyTay | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [searchTuNgay, setSearchTuNgay] = useState<Date | null>(new Date());
  const [searchDenNgay, setSearchDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<IPatientInfoCanKyTay[]>([]);

  const handleSearch = async () => {
    try {
      if (!searchTuNgay || !searchDenNgay) return;

      setLoading(true);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      console.log(
        "Fetched history data:",
        formatDate(searchTuNgay),
        formatDate(searchDenNgay)
      );

      const data = await getPatientCanKyTay(
        formatDate(searchTuNgay),
        formatDate(searchDenNgay)
      );

      console.log("Fetched history data:", data);

      setRows(
        (data || []).map((item: IPatientInfoCanKyTay) => ({
          id: item.Sovaovien,
          ...item,
        }))
      );
    } catch (error) {
      console.error("Error fetching history data:", error);
      ToastError("Lỗi khi tìm kiếm lịch sử thao tác!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="w-full h-full flex flex-col">
        <Box className="flex flex-col px-0.5 mb-0.5 mt-2" gap={1}>
          <DatePicker
            label="Từ ngày"
            format="dd/MM/yyyy"
            value={searchTuNgay}
            onChange={(value) => setSearchTuNgay(value as Date)}
            className="w-full"
            slotProps={{
              textField: {
                size: "small",
              },
            }}
          />
          <DatePicker
            label="Đến ngày"
            format="dd/MM/yyyy"
            value={searchDenNgay}
            onChange={(value) => setSearchDenNgay(value as Date)}
            className="w-full"
            slotProps={{
              textField: {
                size: "small",
              },
            }}
          />
          <Button
            fullWidth
            startIcon={<Search />}
            variant="contained"
            onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </Box>
        <Box className="flex-1">
          <PatientTreeView rows={rows} onSelectPatient={onSelectPatient} />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
