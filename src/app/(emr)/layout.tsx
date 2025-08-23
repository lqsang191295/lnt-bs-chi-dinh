"use client";
import { getMenuItems } from "@/actions/act_tmenu";
import AppBarTop from "@/components/AppBarTop";
import HeadMetadata from "@/components/HeadMetadata";
import SideMenu from "@/components/SideMenu";
import { useMenuStore } from "@/store/menu";
import { useUserStore } from "@/store/user";
import { getClaimsFromToken } from "@/utils/auth";
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
  const { data: userData, setUserData } = useUserStore();

  const initMenu = useCallback(async () => {
    if (!userData) return;

    try {
      const menu = await getMenuItems(userData);
      setData(menu);
    } catch {
      // Handle error silently
    }
  }, [setData, userData]);

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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <HeadMetadata title="Hồ sơ bệnh án" />
      <Box 
        className="flex w-screen h-screen"
        sx={{ 
          width: '100vw', 
          height: '100vh', 
          overflow: 'hidden' 
        }}
      >
        <SideMenu />
        
        {/* Main content area */}
        <Box 
          className="w-full h-full flex flex-col flex-1 overflow-hidden"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            width: 0, // Important: allows flex child to shrink
            height: '100vh',
            overflow: 'hidden'
          }}
        >
          {/* App bar - fixed height */}
          <Box sx={{ flexShrink: 0 }}>
            <AppBarTop />
          </Box>
          
          {/* Content area - takes remaining height */}
          <Box 
            className="bg-blue-100"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 0, // Important: allows flex child to shrink
              height: '100%'
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
      <Toaster />
    </LocalizationProvider>
  );
}