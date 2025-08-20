"use client";
import { getMenuItems } from "@/actions/act_tmenu";
import AppBarTop from "@/components/AppBarTop";
import HeadMetadata from "@/components/HeadMetadata";
import SideMenu from "@/components/SideMenu";
import { useMenuStore } from "@/store/menu";
import { useUserStore } from "@/store/user";
import { getClaimsFromToken } from "@/utils/auth"; // Assuming you have a utility function to decode JWT
import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useCallback, useEffect } from "react";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setData } = useMenuStore();
  const { setUserData } = useUserStore();

  const initMenu = useCallback(async () => {
    try {
      const menu = await getMenuItems();
      //console.log("Menu items fetched:", menu);
      setData(menu);
    } catch {
      //console.error("Error fetching menu items:", error);
    }
  }, [setData]);

  const initUser = useCallback(async () => {
    try {
      const claims = getClaimsFromToken();
      //console.log("Claims fetched 1111111111111111111:", claims);
      if (claims) {
        setUserData(claims);
      } else {
        //console.warn("No valid claims found in token");
      }
    } catch {
      //console.error("Error initializing user data:", error);
    }
  }, [setUserData]);

  useEffect(() => {
    initUser();
  }, [initUser]);

  useEffect(() => {
    initMenu();
  }, [initMenu]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <HeadMetadata title="Hồ sơ bệnh án" />
      <Box className="flex w-screen h-screen">
        <SideMenu />
        {/* <AppNavbar /> */}
        <Box className="w-full h-full flex flex-col flex-1 overflow-hidden">
          <AppBarTop />
          <Box className="bg-blue-100 h-full w-full overflow-hidden">
            {children}
          </Box>
        </Box>
      </Box>
      <Toaster />
    </LocalizationProvider>
  );
}
