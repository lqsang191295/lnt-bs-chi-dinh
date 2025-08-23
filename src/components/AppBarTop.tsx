"use client";
import { IUserItem } from "@/model/tuser";
import { useMenuToggleStore } from "@/store/menu";
import { useUserStore } from "@/store/user";
import KeyIcon from "@mui/icons-material/Key";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Cookies from "js-cookie";
import { useState } from "react";
import { AppBreadcrumbs } from "./AppBreadcrumbs";
import ChangePassword from "./ChangePassword"; // Import component mới

export default function AppBarTop() {
  const { setUserData } = useUserStore();
  const { data: loginedUser } = useUserStore();
  const [showLogout, setShowLogout] = useState(false);
  const [openChangePw, setOpenChangePw] = useState(false);
  const { toggle, setToggle } = useMenuToggleStore();

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
            sx={{ mr: 2 }}
            onClick={() => {
              setToggle(!toggle);
            }}
            className="xl:!hidden">
            <MenuIcon />
          </IconButton>

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

      {/* Sử dụng component ChangePassword */}
      <ChangePassword open={openChangePw} onClose={handleCloseChangePw} />
    </Box>
  );
}
