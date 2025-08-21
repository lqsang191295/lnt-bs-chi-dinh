"use client";

import { capnhathosobenhan, checkSoLuuTru } from "@/actions/act_thosobenhan";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { ILoaiLuuTru } from "@/model/tloailuutru";
import { useUserStore } from "@/store/user";
import CloseIcon from "@mui/icons-material/Close";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import FolderSharedOutlinedIcon from "@mui/icons-material/FolderSharedOutlined";
import PermContactCalendarOutlinedIcon from "@mui/icons-material/PermContactCalendarOutlined";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import React, { useEffect, useState } from "react";

interface DialogCapNhatLuuTruProps {
  open: boolean;
  onClose: () => void;
  selectedRow: IHoSoBenhAn | null;
  loaiLuuTruList: ILoaiLuuTru[];
  onSuccess?: () => void; // Callback để refresh data
}

interface FormData {
  ID: string;
  SoVaoVien: string;
  NgayVaoVien: Date;
  NgayRaVien: Date;
  HoTen: string;
  NgaySinh: string;
  GioiTinh: string;
  DiaChi: string;
  KhoaDieuTri: string;
  SoLuuTru: string;
  ViTriLuuTru: string;
  NgayLuuTru: Date;
  LoaiLuuTru: string;
}

const DialogCapNhatLuuTru: React.FC<DialogCapNhatLuuTruProps> = ({
  open,
  onClose,
  selectedRow,
  loaiLuuTruList,
  onSuccess,
}) => {
  const { data: loginedUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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
  // Hàm tạo số lưu trữ tự động
  const generateStorageNumber = async () => {
    setGeneratingNumber(true);
    // Gọi API với pOpt = "1" để tự động tạo số lưu trữ mới
    try {
      const result = await checkSoLuuTru(
        loginedUser.ctaikhoan,
        "1", // Tự động tạo số lưu trữ mới
        "" // Không cần truyền số lưu trữ khi tạo mới
      );

      //console.log("Generate storage number result:", result);

      if (result && Array.isArray(result) && result.length > 0) {
        // API trả về array với object chứa SoLuuTru (số 6 chữ số)
        const newStorageNumber = result[0].SoLuuTru;

        if (newStorageNumber) {
          setFormData((prev) => ({
            ...prev,
            SoLuuTru: newStorageNumber,
          }));

          ToastSuccess(`Đã tạo số lưu trữ mới: ${newStorageNumber}`);
        } else {
          ToastError(
            "Không thể tạo số lưu trữ mới! API không trả về số lưu trữ."
          );
        }
      } else if (typeof result === "string" && result.trim()) {
        // Trường hợp API trả về string trực tiếp
        setFormData((prev) => ({
          ...prev,
          SoLuuTru: result.trim(),
        }));

        ToastSuccess(`Đã tạo số lưu trữ mới: ${result.trim()}`);
      } else {
        ToastError(
          "Không thể tạo số lưu trữ mới! API không trả về dữ liệu hợp lệ."
        );
      }
    } catch (error) {
      // console.error("Error generating storage number:", error);
      ToastError("Lỗi khi tạo số lưu trữ từ API!");
    } finally {
      setGeneratingNumber(false);
    }
  };

  // Hàm kiểm tra số lưu trữ đã tồn tại chưa từ API
  const checkExistingStorageNumber = async () => {
    if (!formData.SoLuuTru.trim()) {
      ToastWarning("Vui lòng nhập số lưu trữ cần kiểm tra!");
      return;
    }

    setGeneratingNumber(true);
    try {
      // Gọi API với pOpt = "2" để kiểm tra số lưu trữ đã tồn tại
      const result = await checkSoLuuTru(
        loginedUser.ctaikhoan,
        "2", // Kiểm tra số lưu trữ đã tồn tại
        formData.SoLuuTru.trim()
      );

      // console.log("Check storage number result:", result);

      if (result && Array.isArray(result) && result.length > 0) {
        // API trả về array với object chứa SoLuuTru
        // "1" = đã tồn tại, "0" = chưa tồn tại
        const checkResult = result[0];
        const existsFlag = checkResult.SoLuuTru;

        if (existsFlag === "1") {
          ToastError(
            `Số lưu trữ "${formData.SoLuuTru}" đã tồn tại trong hệ thống! Vui lòng chọn số khác.`
          );
        } else if (existsFlag === "0") {
          ToastSuccess(`Số lưu trữ "${formData.SoLuuTru}" có thể sử dụng!`);
        } else {
          ToastWarning(
            "Không thể xác định trạng thái số lưu trữ. Vui lòng kiểm tra lại!"
          );
        }
      } else {
        ToastError(
          "Lỗi khi kiểm tra số lưu trữ! API không trả về dữ liệu hợp lệ."
        );
      }
    } catch (error) {
      // console.error("Error checking storage number:", error);
      ToastError("Lỗi khi kiểm tra số lưu trữ từ API!");
    } finally {
      setGeneratingNumber(false);
    }
  };

  // Cập nhật form data khi selectedRow thay đổi
  useEffect(() => {
    if (selectedRow && open) {
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
    }
  }, [selectedRow, open]);

  // Validate form trước khi lưu
  const validateForm = (): boolean => {
    if (!formData.SoLuuTru.trim()) {
      ToastError("Vui lòng nhập số lưu trữ!");
      return false;
    }

    if (!formData.ViTriLuuTru.trim()) {
      ToastError("Vui lòng nhập vị trí lưu trữ!");
      return false;
    }

    if (!formData.LoaiLuuTru) {
      ToastError("Vui lòng chọn loại lưu trữ!");
      return false;
    }

    return true;
  };

  // Lưu thông tin lưu trữ
  const handleSaveLuuTru = async () => {
    if (!selectedRow) return;

    if (!validateForm()) {
      return;
    }

    // Confirm trước khi lưu
    if (!window.confirm("Bạn có chắc chắn muốn cập nhật thông tin lưu trữ?")) {
      return;
    }

    setLoading(true);

    try {
      const updatedHsba = {
        ...selectedRow,
        SoLuuTru: formData.SoLuuTru,
        ViTriLuuTru: formData.ViTriLuuTru,
        NgayLuuTru: formData.NgayLuuTru,
        LoaiLuuTru: formData.LoaiLuuTru,
      };

      const result = await capnhathosobenhan(
        loginedUser.ctaikhoan,
        "3",
        updatedHsba
      );

      if (result) {
        ToastSuccess("Cập nhật thông tin lưu trữ thành công!");

        // Callback để refresh data
        if (onSuccess) {
          onSuccess();
        }

        onClose();
      } else {
        ToastError("Cập nhật thông tin lưu trữ thất bại!");
      }
    } catch (error) {
      // console.error("Error updating storage info:", error);
      ToastError("Có lỗi xảy ra khi cập nhật thông tin lưu trữ!");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Kiểm tra xem có thay đổi gì không
    const hasChanges =
      (selectedRow?.SoLuuTru || "") !== formData.SoLuuTru ||
      (selectedRow?.ViTriLuuTru || "") !== formData.ViTriLuuTru ||
      (selectedRow?.LoaiLuuTru || "") !== formData.LoaiLuuTru;

    if (hasChanges) {
      if (
        window.confirm(
          "Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu."
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Tìm thông tin loại lưu trữ được chọn
  const selectedLoaiLuuTru = loaiLuuTruList.find(
    (item) => item.cid.toString() === formData.LoaiLuuTru
  );

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 800,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "18px",
          backgroundColor: "#1976d2",
          color: "white",
          textAlign: "center",
          letterSpacing: 1,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          CẬP NHẬT THÔNG TIN LƯU TRỮ
        </Typography>
        <IconButton onClick={handleCancel} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Khung thông tin chỉ xem */}
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: 2,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}
            >
              <PermContactCalendarOutlinedIcon sx={{ mr: 1 }} />
              Thông tin bệnh án
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
                value={formData.NgayVaoVien}
                size="small"
                sx={{ flex: 2, backgroundColor: "white" }}
              />
              <TextField
                InputProps={{ readOnly: true }}
                label="Ngày ra viện"
                value={formData.NgayRaVien}
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
              border: "2px solid #1976d2",
              borderRadius: "8px",
              padding: 2,
              backgroundColor: "#f3f7ff",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}
            >
              <FolderSharedOutlinedIcon sx={{ mr: 1 }} />
              Thông tin lưu trữ
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Số lưu trữ */}
                <Box sx={{ flex: 2 }}>
                  <TextField
                    label="Số lưu trữ *"
                    value={formData.SoLuuTru}
                    onChange={(e) =>
                      setFormData({ ...formData, SoLuuTru: e.target.value })
                    }
                    fullWidth
                    size="small"
                    sx={{ backgroundColor: "white" }}
                    placeholder="Nhập số lưu trữ VD: 000001"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {/* Button tạo số tự động */}
                            <Tooltip
                              title="Tự động tạo số lưu trữ mới từ hệ thống"
                              placement="top"
                              arrow
                            >
                              <span>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={generateStorageNumber}
                                  disabled={generatingNumber}
                                  sx={{
                                    minWidth: "auto",
                                    px: 1,
                                    fontSize: "11px",
                                    height: "28px",
                                  }}
                                >
                                  {generatingNumber ? (
                                    <AutorenewIcon
                                      sx={{ fontSize: 14 }}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <AutorenewIcon sx={{ fontSize: 14 }} />
                                  )}
                                </Button>
                              </span>
                            </Tooltip>

                            {/* Button kiểm tra */}
                            <Tooltip
                              title={
                                !formData.SoLuuTru.trim()
                                  ? "Vui lòng nhập số lưu trữ để kiểm tra"
                                  : "Kiểm tra số lưu trữ đã tồn tại trong hệ thống"
                              }
                              placement="top"
                              arrow
                            >
                              <span>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="info"
                                  onClick={checkExistingStorageNumber}
                                  disabled={
                                    generatingNumber ||
                                    !formData.SoLuuTru.trim()
                                  }
                                  sx={{
                                    minWidth: "auto",
                                    px: 1,
                                    fontSize: "11px",
                                    height: "28px",
                                  }}
                                >
                                  {generatingNumber ? (
                                    <AutorenewIcon
                                      sx={{ fontSize: 14 }}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <CheckCircleOutlineIcon
                                      sx={{ fontSize: 14 }}
                                    />
                                  )}
                                </Button>
                              </span>
                            </Tooltip>
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Ngày lưu trữ */}
                <Box sx={{ flex: 1 }}>
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
                </Box>
              </Box>
              {/* Hướng dẫn sử dụng buttons */}
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  color: "#666",
                  display: "block",
                  fontStyle: "italic",
                }}
              >
                💡 <strong>Tự động:</strong> Tạo số lưu trữ mới |
                <strong> Kiểm tra:</strong> Xác minh số đã tồn tại
              </Typography>
              <TextField
                label="Vị trí lưu trữ *"
                value={formData.ViTriLuuTru}
                onChange={(e) =>
                  setFormData({ ...formData, ViTriLuuTru: e.target.value })
                }
                fullWidth
                size="small"
                sx={{ backgroundColor: "white" }}
                placeholder="VD: Kệ A1, Tủ 05, Ngăn 3"
                // helperText="Nhập vị trí cụ thể lưu trữ hồ sơ"
              />

              <FormControl fullWidth size="small">
                <Typography
                  variant="caption"
                  sx={{ mb: 1, color: "#1976d2", fontWeight: "bold" }}
                >
                  Loại lưu trữ *
                </Typography>
                <Select
                  value={formData.LoaiLuuTru}
                  onChange={(e) =>
                    setFormData({ ...formData, LoaiLuuTru: e.target.value })
                  }
                  displayEmpty
                  sx={{ backgroundColor: "white" }}
                >
                  <MenuItem value="">
                    <em>Chọn loại lưu trữ</em>
                  </MenuItem>
                  {loaiLuuTruList.map((item) => (
                    <MenuItem key={item.cid} value={item.cid}>
                      {item.ctenloai} ({item.csonamluutru} năm)
                    </MenuItem>
                  ))}
                </Select>

                {/* Hiển thị thông tin loại lưu trữ đã chọn */}
                {selectedLoaiLuuTru && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, color: "#666", fontStyle: "italic" }}
                  >
                    📌 {selectedLoaiLuuTru.ctenloai} - Lưu trữ{" "}
                    {selectedLoaiLuuTru.csonamluutru} năm
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, borderTop: "1px solid #eee" }}>
        <Button
          onClick={handleCancel}
          startIcon={<CloseOutlinedIcon />}
          variant="outlined"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSaveLuuTru}
          startIcon={<SaveAsOutlinedIcon />}
          variant="contained"
          disabled={
            loading ||
            !formData.SoLuuTru ||
            !formData.ViTriLuuTru ||
            !formData.LoaiLuuTru
          }
          sx={{ minWidth: 120 }}
        >
          {loading ? "Đang lưu..." : " Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DialogCapNhatLuuTru);
