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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useState, useRef } from "react";
import * as XLSX from 'xlsx';

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
  const [popt, setPopt] = useState("3");
  const [dsHSBA, setDsHSBA] = useState<IPhanQuyenHoSoBenhAn[]>([]);
  const [showGrantedOnly, setShowGrantedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Tăng popt lên 2 nếu chỉ hiển thị HSBA đã phân quyền
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
    } catch (error) {
      console.error("Error fetching HSBA:", error);
      ToastError("Lỗi khi tải danh sách HSBA");
      setDsHSBA([]);
    } finally {
      setIsLoading(false);
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
      
      // Chuyển đổi sang JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Bỏ qua hàng tiêu đề (hàng đầu tiên)
      const dataRows = jsonData.slice(1) as any[][];
      
      if (dataRows.length === 0) {
        ToastError("File Excel không có dữ liệu");
        return;
      }

      // Lấy danh sách số vào viện từ cột đầu tiên
      const soVaoVienList = dataRows
        .map(row => row[0])
        .filter(soVaoVien => soVaoVien && soVaoVien.toString().trim() !== '');

      if (soVaoVienList.length === 0) {
        ToastError("Không tìm thấy số vào viện trong file Excel");
        return;
      }

      // Phân quyền hàng loạt
      await handleBulkPermission(soVaoVienList);
      
      ToastSuccess(`Đã phân quyền thành công cho ${soVaoVienList.length} HSBA`);
      
      // Tải lại dữ liệu
      await fetchHSBA();
      
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

  const handleBulkPermission = async (soVaoVienList: string[]) => {
    if (!selectedUser) return;

    try {
      for (const soVaoVien of soVaoVienList) {
        // Tìm HSBA theo số vào viện trong danh sách hiện tại
        const hsba = dsHSBA.find(item => item.SoVaoVien === soVaoVien.toString());
        
        if (hsba) {
          // Nếu tìm thấy trong danh sách hiện tại, phân quyền
          await luuphanquyenba(
            loginedUser.ctaikhoan,
            "1",
            selectedUser.ctaikhoan,
            hsba.ID,
            "1"
          );
        } else {
          // Nếu không tìm thấy, có thể cần gọi API khác để tìm HSBA theo số vào viện
          console.warn(`Không tìm thấy HSBA với số vào viện: ${soVaoVien}`);
        }
      }
    } catch (error) {
      console.error("Error in bulk permission:", error);
      throw error;
    }
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
  };

  const isAllSelected = dsHSBA.length > 0 && dsHSBA.every(item => item.ctrangthai === 1);
  const isIndeterminate = dsHSBA.some(item => item.ctrangthai === 1) && !isAllSelected;

  return (
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
                  width: 150,
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
                  width: 150,
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

        {/* Checkbox và Import Excel */}
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
                Chỉ hiển thị HSBA đã phân quyền
              </Typography>
            }
          />

          <Box sx={{ display: "flex", gap: 1 }}>
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
            
            <Input
              type="file"
              inputRef={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              sx={{ display: "none" }}
            />
          </Box>
        </Box>
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
                    disabled={dsHSBA.length === 0}
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
              {Array.isArray(dsHSBA) && dsHSBA.length > 0 ? (
                dsHSBA.map((item) => (
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
                      {item.SoVaoVien}
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
          {dsHSBA.length > 0 && (
            <>
              Đã chọn: {dsHSBA.filter(item => item.ctrangthai === 1).length} / {dsHSBA.length}
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
  );
};

export default React.memo(DialogPhanQuyenBa);