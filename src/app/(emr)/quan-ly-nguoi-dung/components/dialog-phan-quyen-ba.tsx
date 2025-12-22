"use client";

import { getphanquyenba, luuphanquyenba } from "@/actions/act_tnguoidung";
import { IPhanQuyenHoSoBenhAn } from "@/model/tphanquyen";
import { IUserItem } from "@/model/tuser";
import { useUserStore } from "@/store/user";
import { ToastSuccess, ToastError } from "@/utils/toast";
import * as MuiIcons from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  Input,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useState, useRef } from "react";
import * as XLSX from 'xlsx';
import DialogPhanQuyenBaImportedHSBAList from "./dialog-phan-quyen-ba-importhsbalist";

interface DialogPhanQuyenBaProps {
  selectedUser: IUserItem | null;
  khoaList: { value: string; label: string }[];
}
const DialogPhanQuyenBa: React.FC<DialogPhanQuyenBaProps> = ({
  selectedUser,
  khoaList,
}) => {
  const { data: loginedUser } = useUserStore();
  const [selectedKhoaBA, setSelectedKhoaBA] = useState("all");
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [popt, setPopt] = useState("1");
  const [dsHSBA, setDsHSBA] = useState<IPhanQuyenHoSoBenhAn[]>([]);
  const [filteredHSBA, setFilteredHSBA] = useState<IPhanQuyenHoSoBenhAn[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showGrantedOnly, setShowGrantedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States cho dialog import
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importedSoVaoVienList, setImportedSoVaoVienList] = useState<string[]>([]);

  const fetchHSBA = async () => {
    if (!selectedUser) return;
    if (!fromDate || !toDate) return;

    setIsLoading(true);
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Tăng popt lên 1 nếu chỉ hiển thị HSBA đã phân quyền
    const searchPopt = showGrantedOnly ? (parseInt(popt) + 2).toString() : popt;

    try {
      const result = await getphanquyenba(
        loginedUser.ctaikhoan,
        searchPopt,
        selectedUser.ctaikhoan,
        selectedKhoaBA,
        formatDate(fromDate),
        formatDate(toDate)
      );
      setDsHSBA(result || []);
      setFilteredHSBA(result || []);
      setSearchText(""); // Reset search text khi tìm kiếm mới
    } catch (error) {
      console.error("Error fetching HSBA:", error);
      ToastError("Lỗi khi tải danh sách HSBA");
      setDsHSBA([]);
      setFilteredHSBA([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lọc dữ liệu theo text search
  const handleFilter = () => {
    if (!searchText.trim()) {
      setFilteredHSBA(dsHSBA);
      return;
    }

    const searchLower = searchText.toLowerCase().trim();
    const filtered = dsHSBA.filter((row) => {
      const MaBN = (row.MaBN || "").toLowerCase();
      const hoTen = (row.Hoten || "").toLowerCase();
      const soBHYT = (row.SoBHYT || "").toLowerCase();
      const soVaoVien = (row.SoVaoVien || "").toLowerCase();

      return (
        MaBN.includes(searchLower) ||
        hoTen.includes(searchLower) ||
        soBHYT.includes(searchLower) ||
        soVaoVien.includes(searchLower)
      );
    });

    setFilteredHSBA(filtered);

    if (filtered.length === 0) {
      ToastError("Không tìm thấy kết quả phù hợp!");
    } else {
      ToastSuccess(`Tìm thấy ${filtered.length} kết quả`);
    }
  };

  const handleCheckHSBA = (ID: string) => {
    setDsHSBA((prev) =>
      prev.map((row) =>
        row.ID === ID
          ? { ...row, ctrangthai: row.ctrangthai === 1 ? 0 : 1 }
          : row
      )
    );
    setFilteredHSBA((prev) =>
      prev.map((row) =>
        row.ID === ID
          ? { ...row, ctrangthai: row.ctrangthai === 1 ? 0 : 1 }
          : row
      )
    );
  };

  const handleLuuPhanQuyenBA = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      // Lưu tất cả các HSBA đã được check
      for (const item of dsHSBA.filter((row) => row.ctrangthai === 1)) {
        await luuphanquyenba(
          loginedUser.ctaikhoan,
          "1",
          selectedUser.ctaikhoan,
          item.ID,
          item.ctrangthai.toString()
        );
      }
      
      // Xóa phân quyền cho các HSBA đã bỏ check
      for (const item of dsHSBA.filter((row) => row.ctrangthai === 0)) {
        await luuphanquyenba(
          loginedUser.ctaikhoan,
          "0", // opt = 0 để xóa phân quyền
          selectedUser.ctaikhoan,
          item.ID,
          "0"
        );
      }
      
      ToastSuccess("Lưu phân quyền BA thành công!");
      // Tải lại dữ liệu sau khi lưu
      await fetchHSBA();
    } catch (error) {
      console.error("Error saving permissions:", error);
      ToastError("Lỗi khi lưu phân quyền");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowGrantedOnlyChange = async (checked: boolean) => {
    setShowGrantedOnly(checked);
    // Tự động tìm kiếm lại khi thay đổi checkbox
    setTimeout(() => {
      fetchHSBA();
    }, 100);
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Lấy sheet đầu tiên
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Chuyển đổi sang JSON với header mapping
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: ''
      });
      
      if (jsonData.length < 2) {
        ToastError("File Excel phải có ít nhất 2 hàng (header + data)");
        return;
      }

      // Kiểm tra header - tìm cột "Số vào viện"
      const headers = jsonData[0] as string[];
      const soVaoVienColIndex = headers.findIndex(h => 
        h && h.toLowerCase().includes('số vào viện')
      );
      
      if (soVaoVienColIndex === -1) {
        ToastError("File Excel phải có cột 'Số vào viện'");
        return;
      }

      // Bỏ qua hàng tiêu đề (hàng đầu tiên)
      const dataRows = jsonData.slice(1) as string[][];
      
      if (dataRows.length === 0) {
        ToastError("File Excel không có dữ liệu");
        return;
      }

      // Lấy danh sách số vào viện từ cột tương ứng
      const soVaoVienList = dataRows
        .map(row => row[soVaoVienColIndex])
        .filter(soVaoVien => soVaoVien && soVaoVien.toString().trim() !== '')
        .map(soVaoVien => soVaoVien.toString().trim());

      if (soVaoVienList.length === 0) {
        ToastError("Không tìm thấy số vào viện hợp lệ trong file Excel");
        return;
      }

      // Lưu danh sách số vào viện và hiển thị dialog
      setImportedSoVaoVienList(soVaoVienList);
      setShowImportDialog(true);
      
      ToastSuccess(`Đã đọc thành công ${soVaoVienList.length} số vào viện từ file Excel`);
      
    } catch (error) {
      console.error("Error importing Excel:", error);
      ToastError("Lỗi khi đọc file Excel");
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportExcel = () => {
    if (dsHSBA.length === 0) {
      ToastError("Không có dữ liệu để export");
      return;
    }

    try {
      // Chuẩn bị dữ liệu cho Excel
      const exportData = dsHSBA.map(item => ({
        'Mã BA': item.ID,
        'Số BHYT': item.SoBHYT,
        'Số vào viện': item.SoVaoVien,
        'Họ tên': item.Hoten,
        'Ngày sinh': item.Ngaysinh,
        'Giới tính': item.Gioitinh,
        'Địa chỉ': item.Diachi,
        'Ngày vào': item.NgayVao,
        'Ngày ra': item.NgayRa,
        'Khoa điều trị': item.KhoaDieuTri,
        'Đã phân quyền': item.ctrangthai === 1 ? 'Có' : 'Không'
      }));

      // Tạo workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "HSBA");

      // Auto-size columns
      const colWidths = [
        { wch: 10 }, // Mã BA
        { wch: 15 }, // Số BHYT
        { wch: 15 }, // Số vào viện
        { wch: 25 }, // Họ tên
        { wch: 12 }, // Ngày sinh
        { wch: 10 }, // Giới tính
        { wch: 30 }, // Địa chỉ
        { wch: 12 }, // Ngày vào
        { wch: 12 }, // Ngày ra
        { wch: 20 }, // Khoa điều trị
        { wch: 15 }  // Đã phân quyền
      ];
      ws['!cols'] = colWidths;

      // Tạo tên file với timestamp
      const now = new Date();
      const timestamp = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');
      
      const fileName = `hsba_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);
      
      ToastSuccess(`Đã export thành công file ${fileName}`);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      ToastError("Lỗi khi export Excel");
    }
  };
  const handleExportSampleExcel = () => {
    
    try {
      // DỮ LIỆU MẪU
      const sampleData = [
        {
          'Mã BA': 'E4EEF427-B507-4C30-A8BD-000597DB74D9',
          'Số BHYT': 'GD4807221465361',
          'Số vào viện': '0123456',
          'Họ tên': 'Nguyễn Văn A',
          'Ngày sinh': '01/01/1990',
          'Giới tính': 'Nam',
          'Địa chỉ': 'Phường 1, Quận 1, TP.HCM',
          'Ngày vào': '10/12/2025',
          'Ngày ra': '15/12/2025',
          'Khoa điều trị': 'Nội tổng hợp',
          'Đã phân quyền': 'Có'
        },
        {
          'Mã BA': 'F8D842CB-84D3-4556-8EAE-00021E140851',
          'Số BHYT': 'GD4807221465362',
          'Số vào viện': '0123457',
          'Họ tên': 'Trần Thị B',
          'Ngày sinh': '15/05/1995',
          'Giới tính': 'Nữ',
          'Địa chỉ': 'Xã Bình Chánh, TP.HCM',
          'Ngày vào': '11/12/2025',
          'Ngày ra': '',
          'Khoa điều trị': 'Sản',
          'Đã phân quyền': 'Không'
        },
        {
          'Mã BA': 'F8D842CB-84D3-4556-8EAE-00021E110851',
          'Số BHYT': 'GD4807221465363',
          'Số vào viện': '0123458',
          'Họ tên': 'Trần Thị C',
          'Ngày sinh': '15/05/1995',
          'Giới tính': 'Nữ',
          'Địa chỉ': 'Xã Bình Chánh, TP.HCM',
          'Ngày vào': '11/12/2025',
          'Ngày ra': '',
          'Khoa điều trị': 'Sản',
          'Đã phân quyền': 'Không'
        }
      ];

      // Tạo worksheet
      const ws = XLSX.utils.json_to_sheet(sampleData);

      // Set độ rộng cột
      ws['!cols'] = [
        { wch: 10 }, // Mã BA
        { wch: 15 }, // Số BHYT
        { wch: 15 }, // Số vào viện
        { wch: 25 }, // Họ tên
        { wch: 12 }, // Ngày sinh
        { wch: 10 }, // Giới tính
        { wch: 35 }, // Địa chỉ
        { wch: 12 }, // Ngày vào
        { wch: 12 }, // Ngày ra
        { wch: 20 }, // Khoa điều trị
        { wch: 15 }  // Đã phân quyền
      ];

      // Tạo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "HSBA_MAU");

      // Tên file
      const fileName = "hsba_template.xlsx";

      // Download
      XLSX.writeFile(wb, fileName);

      ToastSuccess("Đã tải file Excel mẫu");
    } catch (error) {
      console.error(error);
      ToastError("Lỗi khi tạo file Excel mẫu");
    }
  };

  const handleImportSuccess = () => {
    // Reload data sau khi import thành công
    fetchHSBA();
  };

  // Chọn/bỏ chọn tất cả
  const handleSelectAll = () => {
    const allChecked = dsHSBA.every(item => item.ctrangthai === 1);
    setDsHSBA(prev =>
      prev.map(item => ({
        ...item,
        ctrangthai: allChecked ? 0 : 1
      }))
    );
    setFilteredHSBA(prev =>
      prev.map(item => ({
        ...item,
        ctrangthai: allChecked ? 0 : 1
      }))
    );
  };

  const isAllSelected = filteredHSBA.length > 0 && filteredHSBA.every(item => item.ctrangthai === 1);
  const isIndeterminate = filteredHSBA.some(item => item.ctrangthai === 1) && !isAllSelected;

  return (
    <>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #ccc",
          borderRadius: 2,
          bgcolor: "#fff",
          overflow: "hidden",
        }}>
        {/* Filter Controls */}
        <Box
          sx={{
            p: 2,
            flexShrink: 0,
            borderBottom: "1px solid #eee",
          }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              mb: 2,
            }}>
            {/* Select Khoa */}
            <Select
              size="small"
              value={selectedKhoaBA}
              onChange={(e) => setSelectedKhoaBA(e.target.value)}
              displayEmpty
              sx={{
                width: 280,
                minWidth: 280,
                maxWidth: 280,
                height: 40,
                flexShrink: 0,
                "& .MuiSelect-select": {
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}>
              {khoaList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>

            {/* Radio Group */}
            <FormControl sx={{ flexShrink: 0 }}>
              <RadioGroup
                row
                name="popt-radio-group"
                value={popt}
                onChange={(e) => setPopt(e.target.value)}
                sx={{
                  gap: 1,
                  "& .MuiFormControlLabel-root": {
                    margin: 0,
                    marginRight: 1,
                  },
                }}>
                <FormControlLabel
                  value="1"
                  control={
                    <Radio
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                        padding: 0.5,
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.8rem", marginLeft: 0.5 }}>
                      Ngày vào
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="2"
                  control={
                    <Radio
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                        padding: 0.5,
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.8rem", marginLeft: 0.5 }}>
                      Ngày ra
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>

            {/* Date Pickers */}
            <DatePicker
              label="Từ ngày"
              value={fromDate}
              onChange={(value) => {
                if (value !== null) setFromDate(value as Date);
              }}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: 155,
                    flexShrink: 0,
                    "& .MuiInputBase-root": {
                      fontSize: "0.8rem",
                      height: 40,
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "0.8rem",
                    },
                    "& .MuiInputBase-input": {
                      padding: "8px 14px",
                      width: "auto",
                    },
                  },
                },
                openPickerButton: {
                  size: "small",
                },
              }}
            />

            <DatePicker
              label="Đến ngày"
              value={toDate}
              onChange={(value) => {
                if (value !== null) setToDate(value as Date);
              }}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: 155,
                    flexShrink: 0,
                    "& .MuiInputBase-root": {
                      fontSize: "0.8rem",
                      height: 40,
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "0.8rem",
                    },
                    "& .MuiInputBase-input": {
                      padding: "8px 14px",
                      width: "auto",
                    },
                  },
                },
                openPickerButton: {
                  size: "small",
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={<MuiIcons.Search />}
              onClick={fetchHSBA}
              size="small"
              disabled={isLoading}
              sx={{
                height: 40,
                fontSize: "0.8rem",
                px: 2,
                flexShrink: 0,
                minWidth: "auto",
              }}>
              {isLoading ? "Đang tìm..." : "Tìm kiếm"}
            </Button>
          </Box>

          {/* Checkbox và Import/Export Excel */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              justifyContent: "space-between",
            }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showGrantedOnly}
                  onChange={(e) => handleShowGrantedOnlyChange(e.target.checked)}
                  size="small"
                  sx={{
                    color: "#1976d2",
                    "&.Mui-checked": { color: "#1976d2" },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: "0.875rem", color: "#1976d2" }}>
                  Tất cả HSBA đã phân quyền
                </Typography>
              }
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<MuiIcons.Description />}
                onClick={handleExportSampleExcel}
                size="small"
                disabled={isLoading}
                sx={{
                  fontSize: "0.8rem",
                  px: 2,
                }}
              >
                File mẫu
              </Button>
              <Button
                variant="outlined"
                startIcon={<MuiIcons.FileUpload />}
                onClick={handleImportExcel}
                size="small"
                disabled={isLoading || !selectedUser}
                sx={{
                  fontSize: "0.8rem",
                  px: 2,
                }}>
                Import Excel
              </Button>

              <Button
                variant="outlined"
                startIcon={<MuiIcons.FileDownload />}
                onClick={handleExportExcel}
                size="small"
                disabled={isLoading || dsHSBA.length === 0}
                sx={{
                  fontSize: "0.8rem",
                  px: 2,
                }}>
                Export Excel
              </Button>
              <Input
                type="file"
                inputRef={fileInputRef}
                onChange={handleFileUpload}
                inputProps={{ accept: ".xlsx,.xls" }}
                sx={{ display: "none" }}
              />
            </Box>
          </Box>
        </Box>

        {/* Search Filter */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexShrink: 0,
            borderBottom: "1px solid #eee",
            bgcolor: "#fafafa",
          }}>
          <TextField
            fullWidth
            size="small"
            label="Tìm theo Mã BN, Họ tên, Số vào viện, Số BHYT..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFilter();
              }
            }}
            sx={{
              bgcolor: "white",
              "& .MuiInputBase-root": {
                fontSize: "0.875rem",
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<MuiIcons.Search />}
            onClick={handleFilter}
            size="small"
            disabled={isLoading}
            sx={{
              height: 40,
              fontSize: "0.8rem",
              px: 3,
              flexShrink: 0,
              minWidth: "120px",
            }}>
            Lọc
          </Button>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <TableContainer sx={{ height: "100%" }}>
            <Table size="small" sx={{ border: "1px solid #eee" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    width={40}
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                    }}>
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={handleSelectAll}
                      size="small"
                      disabled={filteredHSBA.length === 0}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 80,
                    }}>
                    Mã BA
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 80,
                    }}>
                    Mã BN
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 100,
                    }}>
                    Số vào viện
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 150,
                    }}>
                    Thẻ BHYT
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 150,
                    }}>
                    Họ tên
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 100,
                    }}>
                    Ngày sinh
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 80,
                    }}>
                    Giới tính
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 200,
                    }}>
                    Địa chỉ
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 120,
                    }}>
                    Ngày vào
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 150,
                    }}>
                    Ngày ra
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      fontWeight: "bold",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minWidth: 150,
                    }}>
                    Khoa điều trị
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(filteredHSBA) && filteredHSBA.length > 0 ? (
                  filteredHSBA.map((item) => (
                    <TableRow key={item.ID} sx={{ cursor: "pointer" }}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Checkbox
                          checked={item.ctrangthai === 1}
                          onChange={() => handleCheckHSBA(item.ID)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.ID}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.MaBN}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.SoVaoVien}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.SoBHYT}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.Hoten}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.Ngaysinh}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.Gioitinh}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 200,
                        }}
                        title={item.Diachi}>
                        {item.Diachi}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.NgayVao}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.NgayRa}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.KhoaDieuTri}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      align="center"
                      sx={{ whiteSpace: "nowrap" }}>
                      {isLoading ? "Đang tải dữ liệu..." : "Không có dữ liệu"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            borderTop: "1px solid #eee",
          }}>
          <Typography variant="body2" color="textSecondary">
            {filteredHSBA.length > 0 && (
              <>
                Đã chọn: {filteredHSBA.filter(item => item.ctrangthai === 1).length} / {filteredHSBA.length}
                {searchText && ` (Lọc từ ${dsHSBA.length} HSBA)`}
              </>
            )}
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={handleLuuPhanQuyenBA}
            disabled={isLoading || dsHSBA.length === 0}
            startIcon={isLoading ? <MuiIcons.Refresh className="animate-spin" /> : <MuiIcons.Save />}
          >
            {isLoading ? "Đang lưu..." : "LƯU"}
          </Button>
        </Box>
      </Box>

      {/* Dialog hiển thị HSBA từ Excel */}
      <DialogPhanQuyenBaImportedHSBAList
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        importedSoVaoVienList={importedSoVaoVienList}
        selectedUser={selectedUser}
        onSuccess={handleImportSuccess}
        popt={popt}
        fromDate={fromDate}
        toDate={toDate}
      />
    </>
  );
};

export default React.memo(DialogPhanQuyenBa);