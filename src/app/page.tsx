"use client";
import { getMenuItems } from "@/actions/act_tmenu";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import { IMenuItem } from "@/model/tmenu";
import { useUserStore } from "@/store/user";
import { getClaimsFromToken } from "@/utils/auth";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const { data: userData, setUserData } = useUserStore();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const initMenu = useCallback(async () => {
    if (!userData) return;

    try {
      const menu = await getMenuItems(userData);

      if (menu.length === 0) {
        setIsCheckingAccess(false);
        setHasAccess(false);
        return;
      }

      setIsCheckingAccess(false);
      setHasAccess(true);

      const chilMenu = menu.filter((x: IMenuItem) => x.ccap !== 1);

      if (!chilMenu || chilMenu.length === 0) {
        setIsCheckingAccess(false);
        setHasAccess(false);
        return;
      }

      router.push(chilMenu[0].clink);
    } catch {
      // Handle error silently
    }
  }, [userData, router]);

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
      />
    );
  }

  return (
    <Box>
      Đang chuyển trang... {isCheckingAccess} - {hasAccess} -{" "}
      {userData && JSON.stringify(userData)}
    </Box>
  );
}
