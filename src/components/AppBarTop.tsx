"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import MenuIcon from "@mui/icons-material/Menu";
import Cookies from "js-cookie";
import { useUserStore } from "@/store/user";
import { useState } from "react";
import { IUserItem } from "@/model/user";

export default function AppBarTop() {
  const { setUserData } = useUserStore();
  const { data: userData } = useUserStore();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    Cookies.remove("authToken");
    setUserData({} as IUserItem);
    window.location.href = "/login";
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
           
            <img src="/logow.png" alt="Logo" style={{ height: 32, marginRight: 8 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              EMR - BỆNH VIỆN ĐA KHOA LÊ NGỌC TÙNG
            </Typography>
          
          <Box
            sx={{ position: "relative", display: "inline-block" }}
            onMouseEnter={() => setShowLogout(true)}
            // onMouseLeave={() => setShowLogout(false)}
          >
            <IconButton color="inherit">
              <PermIdentityIcon />  
            </IconButton>
            <Button color="inherit">
              {userData && userData.choten ? userData.choten : ""}
            </Button>
            {showLogout && (
              <Button
                color="error"
                variant="contained"
                size="small"
                sx={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  mt: 1,
                  zIndex: 10,
                  minWidth: 100,
                }}
                onClick={handleLogout}
                 onMouseLeave={() => setShowLogout(false)}
              >
                Đăng xuất
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
