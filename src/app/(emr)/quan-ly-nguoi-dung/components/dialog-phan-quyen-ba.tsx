"use client";

import { getphanquyenba, luuphanquyenba } from "@/actions/act_tnguoidung";
import { IPhanQuyenHoSoBenhAn } from "@/model/tphanquyen";
import { IUserItem } from "@/model/tuser";
import { useUserStore } from "@/store/user";
import { ToastSuccess } from "@/utils/toast";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useState } from "react";

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

  const fetchHSBA = async () => {
    if (!selectedUser) return;
    if (!fromDate || !toDate) return;

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const result = await getphanquyenba(
      loginedUser.ctaikhoan,
      popt,
      selectedUser.ctaikhoan,
      selectedKhoaBA,
      formatDate(fromDate),
      formatDate(toDate)
    );
    setDsHSBA(result);
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
    for (const item of dsHSBA.filter((row) => row.ctrangthai === 1)) {
      await luuphanquyenba(
        loginedUser.ctaikhoan,
        "1",
        selectedUser.ctaikhoan,
        item.ID,
        item.ctrangthai.toString()
      );
    }
    ToastSuccess("Lưu phân quyền BA thành công!");
  };

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
      {/* Filter Controls - Tất cả trên 1 hàng */}
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
            flexWrap: "nowrap", // Không wrap xuống dòng
          }}>
          {/* Select Khoa - Width cố định, dài hơn */}
          <Select
            size="small"
            value={selectedKhoaBA}
            onChange={(e) => setSelectedKhoaBA(e.target.value)}
            displayEmpty
            sx={{
              width: 280, // Width cố định, dài hơn
              minWidth: 280, // Không auto resize
              maxWidth: 280, // Không auto resize
              height: 40,
              flexShrink: 0, // Không co lại
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

          {/* Date Picker Từ ngày - Compact size */}
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
                  width: 150, // Width vừa khít với dd/mm/yyyy + icon
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

          {/* Date Picker Đến ngày - Compact size */}
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
                  width: 150, // Width vừa khít với dd/mm/yyyy + icon
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

          {/* Button Tìm kiếm */}
          <Button
            variant="contained"
            startIcon={<MuiIcons.Search />}
            onClick={fetchHSBA}
            size="small"
            sx={{
              height: 40,
              fontSize: "0.8rem",
              px: 2,
              flexShrink: 0,
              minWidth: "auto",
            }}>
            Tìm kiếm
          </Button>
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
                  {/* Checkbox header */}
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
                      <input
                        type="checkbox"
                        checked={item.ctrangthai === 1}
                        onChange={() => handleCheckHSBA(item.ID)}
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
                    Không có dữ liệu
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
          textAlign: "right",
          flexShrink: 0,
          borderTop: "1px solid #eee",
        }}>
        <Button variant="contained" onClick={handleLuuPhanQuyenBA}>
          LƯU
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(DialogPhanQuyenBa);
