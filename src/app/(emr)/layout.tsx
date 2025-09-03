"use client";
import { getMenuItems } from "@/actions/act_tmenu";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import AppBarTop from "@/components/AppBarTop";
import HeadMetadata from "@/components/HeadMetadata";
import SideMenu from "@/components/SideMenu";
import SideMenuMobile from "@/components/SideMenuMobile";
import { IMenuItem } from "@/model/tmenu";
import { useMenuStore } from "@/store/menu";
import { useUserStore } from "@/store/user";
import { getClaimsFromToken } from "@/utils/auth";
import { Box, CircularProgress, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { setData } = useMenuStore();
  const { data: userData, setUserData } = useUserStore();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const checkPermission = useCallback(
    (menu: IMenuItem[]) => {
      try {
        if (!pathname) return;

        const currentPath = pathname.startsWith("/")
          ? pathname.slice(1)
          : pathname;

        if (!menu.find((item) => item.clink === currentPath)) return;

        setHasAccess(true);
      } finally {
        setIsCheckingAccess(false);
      }
    },
    [pathname, setHasAccess]
  );

  const initMenu = useCallback(async () => {
    if (!userData) return;

    try {
      const menu = await getMenuItems(userData);

      setData(menu);
      checkPermission(menu);
    } catch {
      // Handle error silently
    }
  }, [setData, userData, checkPermission]);

  const initUser = useCallback(async () => {
    try {
      const claims = getClaimsFromToken();
      if (claims) {
        setUserData(claims);
      }
    } catch {
      // Handle error silently
    }
  }, [setUserData]);

  useEffect(() => {
    initUser();
  }, [initUser]);

  useEffect(() => {
    initMenu();
  }, [initMenu]);

  if (isCheckingAccess) {
    return (
      <Box
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}>
        <CircularProgress />
        <Typography color="textSecondary">
          Đang kiểm tra quyền truy cập...
        </Typography>
      </Box>
    );
  }

  // Hiển thị trang Access Denied nếu không có quyền
  if (!hasAccess) {
    return (
      <AccessDeniedPage
        title="BẠN KHÔNG CÓ QUYỀN TRA CỨU HỒ SƠ BỆNH ÁN"
        message="Bạn không có quyền truy cập chức năng tra cứu hồ sơ bệnh án. Vui lòng liên hệ quản trị viên để được cấp quyền."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <HeadMetadata title="Hồ sơ bệnh án" />
      <Box
        className="flex w-screen h-screen"
        sx={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}>
        <SideMenu />
        <SideMenuMobile />
        {/* Main content area */}
        <Box
          className="w-full h-full flex flex-col flex-1 overflow-hidden"
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            width: 0, // Important: allows flex child to shrink
            height: "100vh",
            overflow: "hidden",
          }}>
          {/* App bar - fixed height */}
          <Box sx={{ flexShrink: 0 }}>
            <AppBarTop />
          </Box>

          {/* Content area - takes remaining height */}
          <Box
            className="bg-blue-100"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: 0, // Important: allows flex child to shrink
              height: "100%",
            }}>
            {children}
          </Box>
        </Box>
      </Box>
      <Toaster />
    </LocalizationProvider>
  );
}
