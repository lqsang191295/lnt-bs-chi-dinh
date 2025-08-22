"use client";

import { instnguoidungdoimatkhau } from "@/actions/act_tnguoidung";
import { useUserStore } from "@/store/user";
import { ToastError, ToastSuccess } from "@/utils/toast";
import CloseIcon from "@mui/icons-material/Close";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

interface ChangePasswordProps {
  open: boolean;
  onClose: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ open, onClose }) => {
  const { data: loginedUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPw: "",
    newPw: "",
    confirmPw: "",
  });
  
  // State để hiển thị/ẩn password
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  
  const [errors, setErrors] = useState({
    oldPw: "",
    newPw: "",
    confirmPw: "",
    general: "",
  });

  // Reset form khi đóng dialog
  const handleClose = () => {
    setFormData({ oldPw: "", newPw: "", confirmPw: "" });
    setErrors({ oldPw: "", newPw: "", confirmPw: "", general: "" });
    setShowPassword({ old: false, new: false, confirm: false });
    onClose();
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = { oldPw: "", newPw: "", confirmPw: "", general: "" };
    let isValid = true;

    // Kiểm tra mật khẩu cũ
    if (!formData.oldPw.trim()) {
      newErrors.oldPw = "Vui lòng nhập mật khẩu cũ";
      isValid = false;
    }

    // Kiểm tra mật khẩu mới
    if (!formData.newPw.trim()) {
      newErrors.newPw = "Vui lòng nhập mật khẩu mới";
      isValid = false;
    } else if (formData.newPw.length < 6) {
      newErrors.newPw = "Mật khẩu mới phải có ít nhất 6 ký tự";
      isValid = false;
    } else if (formData.newPw === formData.oldPw) {
      newErrors.newPw = "Mật khẩu mới phải khác mật khẩu cũ";
      isValid = false;
    }

    // Kiểm tra nhập lại mật khẩu
    if (!formData.confirmPw.trim()) {
      newErrors.confirmPw = "Vui lòng nhập lại mật khẩu mới";
      isValid = false;
    } else if (formData.newPw !== formData.confirmPw) {
      newErrors.confirmPw = "Mật khẩu nhập lại không khớp";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle đổi mật khẩu
  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    if (!loginedUser?.ctaikhoan) {
      ToastError("Không tìm thấy thông tin người dùng!");
      return;
    }

    // Confirm trước khi đổi mật khẩu
    if (!window.confirm("Bạn có chắc chắn muốn đổi mật khẩu?")) {
      return;
    }

    setLoading(true);

    try {
      const result = await instnguoidungdoimatkhau(loginedUser.ctaikhoan, "4", {
        userid: loginedUser.cid,
        oldPassword: formData.oldPw,
        newPassword: formData.newPw,
      });

      console.log("Change password result:", result);

      // Xử lý kết quả trả về từ API
      if (typeof result === "string" && result === "Authorization has been denied for this request.") {
        ToastError("Bạn không có quyền đổi mật khẩu!");
      } else if (Array.isArray(result) && result.length > 0 && typeof result[0].ROW_COUNT !== "undefined") {
        ToastSuccess("Đổi mật khẩu thành công!");
        handleClose();
      } else {
        ToastError("Đổi mật khẩu thất bại! Vui lòng kiểm tra lại mật khẩu cũ.");
      }

    } catch (error) {
      console.error("Error changing password:", error);
      ToastError("Có lỗi xảy ra khi đổi mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  // Toggle hiển thị password
  const toggleShowPassword = (field: 'old' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle input change
  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error khi user bắt đầu nhập
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <KeyOutlinedIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            ĐỔI MẬT KHẨU
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3, px: 4 }}>{/* Tăng padding top và bottom */}
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3, /* Tăng gap từ 2 lên 3 */
          mt: 3 /* Thêm margin top để tạo khoảng cách với header */
        }}> 
          
          {/* Mật khẩu cũ */}
          <TextField
            label="Mật khẩu cũ *"
            type={showPassword.old ? "text" : "password"}
            fullWidth
            size="small"
            value={formData.oldPw}
            onChange={handleInputChange("oldPw")}
            error={!!errors.oldPw}
            helperText={errors.oldPw}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('old')}
                    edge="end"
                    size="small"
                  >
                    {showPassword.old ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Mật khẩu mới */}
          <TextField
            label="Mật khẩu mới *"
            type={showPassword.new ? "text" : "password"}
            fullWidth
            size="small"
            value={formData.newPw}
            onChange={handleInputChange("newPw")}
            error={!!errors.newPw}
            helperText={errors.newPw || "Mật khẩu phải có ít nhất 6 ký tự"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('new')}
                    edge="end"
                    size="small"
                  >
                    {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Nhập lại mật khẩu mới */}
          <TextField
            label="Nhập lại mật khẩu mới *"
            type={showPassword.confirm ? "text" : "password"}
            fullWidth
            size="small"
            value={formData.confirmPw}
            onChange={handleInputChange("confirmPw")}
            error={!!errors.confirmPw}
            helperText={errors.confirmPw}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword('confirm')}
                    edge="end"
                    size="small"
                  >
                    {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Thông báo lỗi chung */}
          {errors.general && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {errors.general}
            </Typography>
          )}

          {/* Hướng dẫn */}
          <Box
            sx={{
              backgroundColor: "#f0f7ff",
              border: "1px solid #cce7ff",
              borderRadius: 1,
              p: 2,
              mt: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: "#1976d2", fontWeight: "bold" }}>
              📝 Lưu ý:
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "#666" }}>
              • Mật khẩu mới phải có ít nhất 6 ký tự
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
              • Mật khẩu mới phải khác mật khẩu cũ
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
              • Nhớ lưu mật khẩu mới ở nơi an toàn
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, borderTop: "1px solid #eee" }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
          startIcon={<CloseOutlinedIcon />}
          sx={{ minWidth: 120 }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleChangePassword}
          variant="contained"
          disabled={loading || !formData.oldPw || !formData.newPw || !formData.confirmPw}          
          startIcon={<SaveAsOutlinedIcon />}
          sx={{ minWidth: 120 }}
        >
          {loading ? "Đang xử lý..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ChangePassword);