"use client";
import React, { useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Stack,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Bookmark,
  Folder,
  BarChart,
  Settings,
  People,
  Business,
  ListAlt,
  Build,
  History,
  Sort,
} from "@mui/icons-material";
import Link from "next/link";

export default function MenuContent() {
  const [openHSBA, setOpenHSBA] = useState(true);
  const [openReport, setOpenReport] = useState(false);
  const [openSystem, setOpenSystem] = useState(false);
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List component="nav">
        {/* BookMark */}
        <ListItemButton>
          <ListItemIcon>
            <Bookmark />
          </ListItemIcon>
          <ListItemText primary="BookMark" />
        </ListItemButton>

        {/* Hồ Sơ Bệnh Án */}
        <ListItemButton onClick={() => setOpenHSBA(!openHSBA)}>
          <ListItemIcon>
            <Folder />
          </ListItemIcon>
          <ListItemText primary="Hồ Sơ Bệnh Án" />
          {openHSBA ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openHSBA} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {[
              "Hồ Sơ Bệnh Án Mở",
              "Duyệt Nhận HSBA",
              "Lưu Trữ HSBA",
              "Mượn Trả HSBA",
              "Chia Sẻ HSBA",
              "Mở Lại HSBA",
              "Tra cứu HSBA theo Bệnh Nhân",
              "Tổng Hợp Lưu Trữ HSBA",
              "Kết xuất HSBA",
            ].map((text) => (
              <ListItemButton key={text} sx={{ pl: 4 }}>
                <ListItemText primary={text} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Báo Cáo - Tra Cứu */}
        <ListItemButton onClick={() => setOpenReport(!openReport)}>
          <ListItemIcon>
            <BarChart />
          </ListItemIcon>
          <ListItemText primary="Báo Cáo - Tra Cứu" />
          {openReport ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openReport} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Thêm các item con nếu có */}
          </List>
        </Collapse>

        {/* Hệ Thống */}
        <ListItemButton onClick={() => setOpenSystem(!openSystem)}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Hệ Thống" />
          {openSystem ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openSystem} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {[
              { text: "Quản Lý Người Dùng", icon: <People /> },
              { text: "Quản Lý Đơn Vị", icon: <Business /> },
              { text: "Quản Lý Log XML", icon: <ListAlt /> },
              { text: "Thiết Lập Cấu Hình Đơn Vị", icon: <Build /> },
              { text: "Lịch Sử Thao Tác Bệnh Án", icon: <History /> },
              { text: "Sắp xếp phiếu", icon: <Sort /> },
            ].map(({ text, icon }) => (
              <Link href="/quan-ly-nguoi-dung" passHref key={text}>
                <ListItemButton key={text} sx={{ pl: 4 }}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </Link>
            ))}
          </List>
        </Collapse>
      </List>
    </Stack>
  );
}
