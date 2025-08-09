// components/CustomBreadcrumbs.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // hoặc usePathname từ 'next/navigation' cho App Router
import Link from "next/link";
import { Breadcrumbs, Typography } from "@mui/material";
import { buildMenuTree, getBreadcrumbs } from "@/utils/menu"; // Giả sử các hàm được đặt trong file này
import { IMenuItem, IMenuTree } from "@/model/menu";
import { useMenuStore } from "@/store/menu";

interface AppBreadcrumbsProps {
  menuData: IMenuItem[];
}

export function AppBreadcrumbs() {
  const { data: menuData } = useMenuStore(); // Sử dụng zustand để lấy dữ liệu menu

  if (!menuData || menuData.length === 0) {
    return null; // Không hiển thị nếu không có dữ liệu menu
  }

  const router = useRouter(); // Sử dụng useRouter để lấy pathname
  const [breadcrumbs, setBreadcrumbs] = useState<IMenuItem[]>([]);

  useEffect(() => {
    // 1. Xây dựng cây menu từ dữ liệu thô
    const menuTree: IMenuTree[] = buildMenuTree(menuData);

    // 2. Lấy đường dẫn hiện tại từ useRouter
    const currentLink = router.pathname;

    // 3. Sử dụng hàm getBreadcrumbs để tìm đường dẫn
    const breadcrumbItems = getBreadcrumbs(menuTree, currentLink);

    // 4. Cập nhật state
    setBreadcrumbs(breadcrumbItems);
  }, [router.pathname, menuData]);

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null; // Không hiển thị nếu không tìm thấy breadcrumbs
  }

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {/* Duyệt qua mảng breadcrumbs để render */}
      {breadcrumbs.map((item, index) => {
        // Nếu là item cuối cùng, hiển thị dưới dạng Typography (text)
        if (index === breadcrumbs.length - 1) {
          return (
            <Typography key={item.cid} color="text.primary">
              {item.ctenmenu}
            </Typography>
          );
        }

        // Các item còn lại hiển thị dưới dạng Link
        return (
          <Link key={item.cid} color="inherit" href={item.clink} passHref>
            {item.ctenmenu}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
