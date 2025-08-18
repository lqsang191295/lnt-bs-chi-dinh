// src/app/muon-tra-hsba/components/ds-muon-hsba.tsx
"use client";

import { NoteAdd } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify"; // Nếu sử dụng toast notification
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { useUserStore } from "@/store/user";
import { IUserItem } from "@/model/tuser";
import { ITMuonTraHSBA } from "@/model/tmuontrahsba";
import { log } from "console";
import { gettnguoidung } from "@/actions/act_tnguoidung";
import { themmuontraHSBA } from "@/actions/act_thosobenhan";

interface DsMuonHsbaProps {
  loai: string; // Loại mượn ( "MUON" hoặc "TRA")
  phieumuon: ITMuonTraHSBA | null; // Dữ liệu phiếu mượn trả
  open: boolean;
  onClose: () => void;
  selectedHsbaForDetail: IHoSoBenhAn | null;
}

const DsMuonHsba: React.FC<DsMuonHsbaProps> = ({ loai, phieumuon, open, onClose, selectedHsbaForDetail }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [nguoiMuon, setNguoiMuon] = useState<IUserItem[]>([]); // Danh sách người mượn
  const { data: loginedUser, setUserData } = useUserStore();

  // Form data for dialog 
  const [formData, setFormData] = useState({
    puser: loginedUser?.ctaikhoan || "", // Tài khoản người dùng hiện tại
    popt: loai === "MUON" ? "1" : "2", // 1: insert, 2: update
    cid: phieumuon?.cid || -1, // chỉ dùng khi update
    cmabenhan: selectedHsbaForDetail?.ID || "", // ID của hồ sơ bệnh án
    cthaotac: loai, // "MUON" hoặc "TRA"
    cngaymuon: phieumuon?.cngaythaotac || new Date(), // Ngày mượn
    cnguoithaotac: loginedUser?.ctaikhoan || "",
    cngaytradukien: phieumuon?.cngaytradukien || new Date(),
    cnguoimuon: phieumuon?.cnguoimuon || "", // Tài khoản người mượn
    cghichumuon: phieumuon?.cghichumuon || "", // Ghi chú mượn
    cngaytra: phieumuon?.cngaytra || null, // Ngày trả thực tế
    cghichutra: phieumuon?.cghichutra || "", // Ghi chú trả
  });
  const handleMuonHsba = async () => {
    setIsLoading(true);

    try {
      // Validate dữ liệu
      const validationErrors = validateFormData();
      if (validationErrors.length > 0) {
        toast.error(validationErrors.join("\n"));
        return;
      }

      // Format dates để đảm bảo đúng định dạng
      const formatDateForAPI = (date: Date | null) => {
        if (!date) return null;
        return date.toISOString();
      };

      // Chuẩn bị dữ liệu
      const hsbaData: ITMuonTraHSBA = {
        cid: formData.cid === -1 ? undefined : formData.cid,
        cmabenhan: selectedHsbaForDetail?.ID?.toString() || "",
        cthaotac: loai,
        cnguoithaotac: loginedUser?.ctaikhoan || "",
        cngaythaotac: formatDateForAPI(formData.cngaymuon),
        cngaytradukien: formatDateForAPI(formData.cngaytradukien),
        cnguoimuon: formData.cnguoimuon,
        cghichumuon: formData.cghichumuon,
        cngaytra: loai === "TRA" ? formatDateForAPI(formData.cngaytra) : null,
        cghichutra: loai === "TRA" ? formData.cghichutra : "",
        ctrangthaitra: loai === "TRA" ? "1" : "0",
      };

      console.log("Saving HSBA data:", hsbaData);

      const pOpt = formData.cid === -1 ? "1" : "2";
      const result = await themmuontraHSBA(
        loginedUser?.ctaikhoan || "",
        pOpt,
        hsbaData
      );

      if (result && Array.isArray(result) && result.length > 0) {
        const success = result[0]?.status === "success" || result[0]?.ID > 0;

        if (success) {
          toast.success(
            loai === "MUON"
              ? `Tạo phiếu mượn HSBA thành công! ID: ${result[0]?.ID}`
              : "Cập nhật trạng thái trả HSBA thành công!"
          );
          onClose();
        } else {
          toast.error(result[0]?.message || "Có lỗi xảy ra khi lưu!");
        }
      } else {
        toast.error("Không nhận được phản hồi từ server!");
      }

    } catch (error) {
      console.error("Error saving:", error);
      toast.error(`Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm validate form
  const validateFormData = (): string[] => {
    const errors: string[] = [];

    if (!formData.cnguoimuon) {
      errors.push("Vui lòng chọn người mượn");
    }

    if (!selectedHsbaForDetail?.ID) {
      errors.push("Không có thông tin hồ sơ bệnh án");
    }

    if (loai === "TRA" && !formData.cngaytra) {
      errors.push("Vui lòng nhập ngày trả");
    }

    if (formData.cngaytradukien < new Date() && loai === "MUON") {
      errors.push("Ngày trả dự kiến không thể nhỏ hơn ngày hiện tại");
    }

    return errors;
  };
  // Debug component để xem cấu trúc dữ liệu
  if (open) {
    console.log("=== DIALOG DEBUG INFO ===");
    console.log("loai prop:", loai);
    console.log("phieumuon prop:", phieumuon);
    console.log("selectedHsbaForDetail prop:", selectedHsbaForDetail);
    console.log("formData state:", formData);
    console.log("nguoiMuon state:", nguoiMuon);
    console.log("loginedUser:", loginedUser);
  }
  // Effect để fetch danh sách người mượn khi dialog mở và có loginedUser
  useEffect(() => {
    if (!open || !loginedUser?.ctaikhoan) {
      return;
    }

    const fetchNguoimuon = async () => {
      try {
        const result = await gettnguoidung(loginedUser.ctaikhoan, "2");
        //console.log("DS Nguoi muon:", result);

        if (Array.isArray(result)) {
          setNguoiMuon(result as IUserItem[]);
        }
      } catch (error) {
        console.error("Error fetching nguoi muon:", error);
      }
    };
    fetchNguoimuon();

    // Cập nhật formData khi có dữ liệu mới
    setFormData({
      puser: loginedUser?.ctaikhoan || "",
      popt: loai === "MUON" ? "1" : "2",
      cid: phieumuon?.cid || -1,
      cmabenhan: selectedHsbaForDetail?.ID?.toString() || "",
      cthaotac: loai,
      cngaymuon: phieumuon?.cngaythaotac ? new Date(phieumuon.cngaythaotac) : new Date(),
      cnguoithaotac: loginedUser?.ctaikhoan || "",
      cngaytradukien: phieumuon?.cngaytradukien ? new Date(phieumuon.cngaytradukien) : (() => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7); // Mặc định 7 ngày sau
        return futureDate;
      })(),
      cnguoimuon: phieumuon?.cnguoimuon || "",
      cghichumuon: phieumuon?.cghichumuon || "",
      cngaytra: phieumuon?.cngaytra ? new Date(phieumuon.cngaytra) : null,
      cghichutra: phieumuon?.cghichutra || "",
    });

  }, [open, phieumuon, selectedHsbaForDetail, loginedUser, loai]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <Typography variant="h6" component="div">
            THÔNG TIN MƯỢN TRẢ HỒ SƠ BỆNH ÁN
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
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
              {/* <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                  Thông tin hồ sơ bệnh án
                </Typography> */}

              {/* ID */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  InputProps={{ readOnly: true }}
                  label="ID"
                  value={selectedHsbaForDetail?.ID}
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
                  value={selectedHsbaForDetail?.SoVaoVien}
                  size="small"
                  sx={{ flex: 1, backgroundColor: "white" }}
                />
                <TextField
                  InputProps={{ readOnly: true }}
                  label="Ngày vào viện"
                  value={selectedHsbaForDetail?.NgayVao ? selectedHsbaForDetail?.NgayVao : ""}
                  size="small"
                  sx={{ flex: 2, backgroundColor: "white" }}
                />
                <TextField
                  InputProps={{ readOnly: true }}
                  label="Ngày ra viện"
                  value={selectedHsbaForDetail?.NgayRa ? selectedHsbaForDetail?.NgayRa : ""}
                  size="small"
                  sx={{ flex: 2, backgroundColor: "white" }}
                />
              </Box>

              {/* Họ tên, Ngày sinh, Giới tính - cùng 1 hàng */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  InputProps={{ readOnly: true }}
                  label="Họ và tên"
                  value={selectedHsbaForDetail?.Hoten}
                  size="small"
                  sx={{ flex: 2, backgroundColor: "white" }}
                />
                <TextField
                  InputProps={{ readOnly: true }}
                  label="Ngày sinh"
                  value={selectedHsbaForDetail?.Ngaysinh}
                  size="small"
                  sx={{ flex: 1, backgroundColor: "white" }}
                />
                <TextField
                  InputProps={{ readOnly: true }}
                  label="Giới tính"
                  value={selectedHsbaForDetail?.Gioitinh}
                  size="small"
                  sx={{ flex: 1, backgroundColor: "white" }}
                />
              </Box>

              {/* Địa chỉ */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  InputProps={{ readOnly: true }}
                  label="Địa chỉ"
                  value={selectedHsbaForDetail?.Diachi}
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
                  value={selectedHsbaForDetail?.KhoaDieuTri}
                  fullWidth
                  size="small"
                  sx={{ backgroundColor: "white" }}
                />
              </Box>
            </Box>

            {/* <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                ID phiếu mượn: {phieumuon?.cid || "Chưa có"}
              </Typography> */}

            {/* Khung thông tin cập nhật */}
            <Box sx={{ display: "flex", gap: 2 }}>
              {/* Khung thông tin mượn */}
              <Box
                sx={{
                  flex: 1,
                  border: "1px solid #1976d2",
                  borderRadius: "8px",
                  padding: 2,
                  backgroundColor: "#f3f7ff",
                }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                  Thông tin mượn
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <DateTimePicker
                    label="Ngày mượn"
                    value={formData.cngaymuon}
                    onChange={(value) =>
                      setFormData({ ...formData, cngaymuon: value as Date })
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
                  <DateTimePicker
                    label="Ngày trả dự kiến"
                    value={formData.cngaytradukien}
                    onChange={(value) =>
                      setFormData({ ...formData, cngaytradukien: value as Date })
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
                  <Box className="flex flex-col gap-2">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Người mượn (<span style={{ color: "red" }}>*</span>):
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Chọn người mượn</InputLabel>
                      <Select
                        value={formData?.cnguoimuon || ""}
                        onChange={(e) => setFormData({ ...formData, cnguoimuon: e.target.value })}
                        fullWidth
                        size="small"
                        label="Chọn người mượn"
                        sx={{ backgroundColor: "white" }}>
                        {nguoiMuon?.map((user) => (
                          <MenuItem key={user.ctaikhoan} value={user.ctaikhoan}>
                            {user.cid} - {user.choten}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box className="flex flex-col gap-2">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Ghi chú mượn:
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={`${formData.cid} - ${formData.cmabenhan} - ${formData.cghichumuon}`}
                      onChange={(e) => setFormData({ ...formData, cghichumuon: e.target.value })}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Khung thông tin trả */}
              <Box
                sx={{
                  flex: 1,
                  border: "1px solid #4caf50",
                  borderRadius: "8px",
                  padding: 2,
                  backgroundColor: "#f1f8e9",
                }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#4caf50", fontWeight: "bold" }}>
                  Thông tin trả
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>


                  <DateTimePicker
                    label="Ngày trả"
                    value={formData.cngaytra || null}
                    onChange={(value) =>
                      setFormData({ ...formData, cngaytra: value as Date })
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

                  <Box className="flex flex-col gap-2">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Ghi chú trả:
                    </Typography>
                    <TextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.cghichutra || ""}
                      onChange={(e) => setFormData({ ...formData, cghichutra: e.target.value })}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          {/* Nút mượn hoặc trả */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={handleMuonHsba}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <NoteAdd />}
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
                padding: "8px 24px",
              }}>
              {isLoading
                ? "Đang xử lý..."
                : (loai === "MUON" ? "MƯỢN HSBA (F3)" : "TRẢ HSBA (F3)")
              }
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>

  );
};

export default DsMuonHsba;
