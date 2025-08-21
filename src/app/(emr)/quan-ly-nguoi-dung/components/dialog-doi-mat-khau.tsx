// src/app/quan-ly-nguoi-dung/components/dialog-doi-mat-khau.tsx
"use client";

import { instnguoidung } from "@/actions/act_tnguoidung";
import { IUserItem } from "@/model/tuser";
import { useUserStore } from "@/store/user";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import {
  Box,
  Button, 
  DialogActions, 
  DialogTitle,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import React, { useState } from "react";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";

interface DialogDoiMatKhauProps {
  open: boolean;
  onClose: () => void;
  selectedUser: IUserItem | null;
  onSuccess?: (updatedUser: IUserItem) => void; // Callback để cập nhật danh sách user
}

const DialogDoiMatKhau: React.FC<DialogDoiMatKhauProps> = ({
  open,
  onClose,
  selectedUser,
  onSuccess,
}) => {
  const { data: loginedUser } = useUserStore();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset form khi dialog đóng/mở
  React.useEffect(() => {
    if (!open) {
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  // Validation
  const validatePassword = () => {
    if (!newPassword.trim()) {
      ToastWarning("Vui lòng nhập mật khẩu mới!");
      return false;
    }

    if (newPassword.length < 6) {
      ToastWarning("Mật khẩu phải có ít nhất 6 ký tự!");
      return false;
    }

    if (newPassword !== confirmPassword) {
      ToastWarning("Mật khẩu xác nhận không khớp!");
      return false;
    }

    // Kiểm tra mật khẩu mạnh (optional)
    if (newPassword.length < 8) {
      // Có thể thêm validation mật khẩu mạnh ở đây
      console.warn("Password could be stronger");
    }

    return true;
  };

  // Xử lý đổi mật khẩu
  const handleConfirmChangePassword = async () => {
    if (!selectedUser) {
      ToastError("Không tìm thấy thông tin người dùng!");
      return;
    }

    if (!validatePassword()) {
      return;
    }

    // Confirm trước khi đổi
    if (!window.confirm(`Bạn có chắc chắn muốn đổi mật khẩu cho người dùng "${selectedUser.choten}"?`)) {
      return;
    }

    setLoading(true);

    try {
      const updatedUser = { ...selectedUser, cmatkhau: newPassword };

      const result = await instnguoidung(
        loginedUser.ctaikhoan,
        "4", // Loại = 4 để đổi mật khẩu
        updatedUser
      );

      if (result) {
        ToastSuccess("Đổi mật khẩu người dùng thành công!");
        
        // Callback để cập nhật danh sách user ở parent component
        if (onSuccess) {
          onSuccess(updatedUser);
        }

        // Đóng dialog
        onClose();
      } else {
        ToastError("Đổi mật khẩu người dùng thất bại!");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      ToastError("Lỗi khi đổi mật khẩu: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Xử lý cancel
  const handleCancel = () => {
    if (newPassword || confirmPassword) {
      if (window.confirm("Bạn có chắc chắn muốn hủy? Thông tin đã nhập sẽ bị mất.")) {
        onClose();
      }
    } else {
      onClose();
    }
  };
 return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 500,
        }
      }}>
      
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee",
          pb: 2,
        }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="primary">
            ĐỔI MẬT KHẨU NGƯỜI DÙNG
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {selectedUser?.choten} ({selectedUser?.ctaikhoan})
          </Typography>
        </Box>
        <IconButton onClick={handleCancel} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4 }}>
        {/* Thông tin người dùng */}
        <Alert severity="info" sx={{ mt: 2, mb: 2 , fontWeight: "italic" }}>
          <Typography variant="body2" >
            <strong>Lưu ý:</strong> Mật khẩu mới sẽ được áp dụng ngay lập tức. 
            Vui lòng thông báo cho người dùng về mật khẩu mới.
          </Typography>
        </Alert>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Mật khẩu mới */}
          <TextField
            fullWidth
            label="Mật khẩu mới"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            helperText="Mật khẩu phải có ít nhất 6 ký tự"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={newPassword.length > 0 && newPassword.length < 6}
          />

          {/* Xác nhận mật khẩu */}
          <TextField
            fullWidth
            label="Xác nhận mật khẩu"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            helperText={
              confirmPassword && newPassword !== confirmPassword
                ? "Mật khẩu không khớp"
                : ""
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small">
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={confirmPassword.length > 0 && newPassword !== confirmPassword}
          />

          {/* Thông tin bổ sung */}
          {newPassword && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Độ mạnh mật khẩu: {
                  newPassword.length >= 12 ? "Rất mạnh" :
                  newPassword.length >= 8 ? "Mạnh" :
                  newPassword.length >= 6 ? "Trung bình" : "Yếu"
                }
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, borderTop: "1px solid #eee" }}>
        <Button 
          onClick={handleCancel}
          variant="outlined"
          startIcon={<CloseOutlinedIcon />}
          disabled={loading}
          sx={{ minWidth: 120 }}>
          Hủy
        </Button>
        <Button 
          onClick={handleConfirmChangePassword}
          startIcon={<SaveAsOutlinedIcon />}
          variant="contained"
          disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          sx={{ minWidth: 120 }}>
          {loading ? "Đang xử lý..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DialogDoiMatKhau);