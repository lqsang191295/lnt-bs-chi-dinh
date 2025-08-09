"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Breadcrumbs, Typography } from "@mui/material";
import { buildMenuTree, getBreadcrumbs } from "@/utils/menu";
import { IMenuItem, IMenuTree } from "@/model/menu";
import { useMenuStore } from "@/store/menu";
import { usePathname } from "next/navigation";

export function AppBreadcrumbs() {
  const { data: menuData } = useMenuStore();
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<IMenuItem[]>([]);

  useEffect(() => {
    if (!menuData || menuData.length === 0) return;
    const menuTree: IMenuTree[] = buildMenuTree(menuData);
    const breadcrumbItems = getBreadcrumbs(menuTree, pathname);

    console.log("Breadcrumbs:", menuTree, breadcrumbItems, pathname);
    setBreadcrumbs(breadcrumbItems);
  }, [pathname, menuData]);

  if (!breadcrumbs.length) return null;

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {breadcrumbs.map((item, index) =>
        index === breadcrumbs.length - 1 ? (
          <Typography key={item.cid} color="text.primary">
            {item.ctenmenu}
          </Typography>
        ) : (
          <Link key={item.cid} href={item.clink || "#"}>
            {item.ctenmenu}
          </Link>
        )
      )}
    </Breadcrumbs>
  );
}
