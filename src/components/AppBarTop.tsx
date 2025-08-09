"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MenuIcon from "@mui/icons-material/Menu";
import Cookies from "js-cookie";
import { useUserStore } from "@/store/user";
import { useState } from "react";
import { IUserItem } from "@/model/user";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";
import { instnguoidungdoimatkhau } from "@/actions/emr_tnguoidung";
import { AppBreadcrumbs } from "./AppBreadcrumbs";

export default function AppBarTop() {
  const { setUserData } = useUserStore();
  const { data: loginedUser } = useUserStore();
  const [showLogout, setShowLogout] = useState(false);
  const [openChangePw, setOpenChangePw] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");

  const handleLogout = () => {
    Cookies.remove("authToken");
    setUserData({} as IUserItem);
    window.location.href = "/login";
  };
  const handleOpenChangePw = () => {
    setShowLogout(false);
    setOpenChangePw(true);
  };

  const handleCloseChangePw = () => {
    setOpenChangePw(false);
    setOldPw("");
    setNewPw("");
    setConfirmPw("");
    setPwError("");
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (!oldPw || !newPw || !confirmPw) {
      setPwError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Mật khẩu mới không khớp.");
      return;
    }
    // TODO: Gọi API đổi mật khẩu tại đây
    if (!loginedUser) return;
    const result = await instnguoidungdoimatkhau(loginedUser.ctaikhoan, "4", {
      userid: loginedUser.cid,
      oldPassword: oldPw,
      newPassword: newPw,
    });
    // console.log("ctaikhoan:", loginedUser.ctaikhoan);
    // console.log("userid:", loginedUser.cid);
    // console.log("old:", oldPw);
    // console.log("new:", newPw);
    // console.log("confirm:", confirmPw);
    // console.log("result:", result);
    const arr = result as Array<{ ROW_COUNT: number }>;

    if (
      typeof arr === "string" &&
      arr === "Authorization has been denied for this request."
    ) {
      alert("Bạn không có quyền đổi mật khẩu!");
      //console.log("change pass unauthorized:", arr);
    } else if (
      Array.isArray(arr) &&
      arr.length > 0 &&
      typeof arr[0].ROW_COUNT !== "undefined"
    ) {
      alert("Đổi mật khẩu người dùng thành công");
      //console.log("change pass ok response message:", arr[0].ROW_COUNT);
    } else {
      //console.log("change pass err response message:", arr);
      alert("Đổi mật khẩu người dùng thất bại");
    }
    // Giả sử API đổi mật khẩu thành công
    //handleCloseChangePw();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          {/* <img
              src="/logow.png"
              alt="Logo"
              style={{ height: 32, marginRight: 8 }}
            />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BỆNH VIỆN ĐA KHOA LÊ NGỌC TÙNG
          </Typography> */}
          <AppBreadcrumbs />

          <Box
            sx={{ display: "flex", alignItems: "center", ml: "auto" }}
            onClick={() => setShowLogout(true)}>
            <IconButton color="inherit">
              <PermIdentityIcon />
            </IconButton>
            <Button color="inherit">
              {loginedUser && loginedUser.choten ? loginedUser.choten : ""}
            </Button>
            {showLogout && (
              <Box
                sx={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  mt: 1,
                  zIndex: 10,
                  minWidth: 140,
                  bgcolor: "background.paper",
                  boxShadow: 3,
                  borderRadius: 1,
                  p: 1,
                }}
                onMouseLeave={() => setShowLogout(false)}>
                <Button
                  color="primary"
                  variant="text"
                  size="small"
                  fullWidth
                  sx={{ justifyContent: "flex-start", mb: 1 }}
                  onClick={handleOpenChangePw}>
                  <KeyIcon fontSize="small" sx={{ mr: 1 }} />
                  Đổi mật khẩu
                </Button>
                <Button
                  color="primary"
                  variant="text"
                  size="small"
                  fullWidth
                  sx={{ justifyContent: "flex-start" }}
                  onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Đăng xuất
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Dialog open={openChangePw} onClose={handleCloseChangePw}>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <TextField
            label="Mật khẩu cũ"
            type="password"
            fullWidth
            margin="normal"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
          />
          <TextField
            label="Mật khẩu mới"
            type="password"
            fullWidth
            margin="normal"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
          <TextField
            label="Nhập lại mật khẩu mới"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
          {pwError && (
            <Typography color="error" variant="body2" mt={1}>
              {pwError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChangePw}>Hủy</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            color="primary">
            Đổi mật khẩu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
