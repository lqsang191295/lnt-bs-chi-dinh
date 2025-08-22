"use client";

import * as MuiIcons from "@mui/icons-material";
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
} from "@mui/material";
import { useState } from "react";
// import { ExpandLess, ExpandMore, Folder, Bookmark } from "@mui/icons-material";
import type { IMenuTree } from "@/model/tmenu";
import { useMenuStore } from "@/store/menu";
import { buildMenuTree } from "@/utils/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MenuSkeleton = () => {
  // giả sử ta muốn hiển thị 5 item skeleton
  const skeletonItems = Array.from({ length: 5 });

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <List component="nav">
        {/* Skeleton cho item CHỨC NĂNG */}
        <ListItemButton>
          <ListItemIcon>
            <Skeleton variant="circular" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary={<Skeleton variant="text" width={120} />} />
        </ListItemButton>

        {/* Skeleton cho menu tree */}
        {skeletonItems.map((_, index) => (
          <ListItemButton key={index}>
            <ListItemIcon>
              <Skeleton variant="circular" width={24} height={24} />
            </ListItemIcon>
            <ListItemText
              primary={<Skeleton variant="text" width={100 + index * 10} />}
            />
          </ListItemButton>
        ))}
      </List>
    </Stack>
  );
};

export default function MenuContent() {
  const { data: menuData } = useMenuStore();

  if (!menuData || menuData.length == 0) return <MenuSkeleton />;

  const menuTree = buildMenuTree(menuData);
  return (
    <Stack sx={{ flexGrow: 1 }}>
      <List component="nav">
        <ListItemButton>
          <ListItemIcon>
            <MuiIcons.Bookmark />
          </ListItemIcon>
          <ListItemText primary="CHỨC NĂNG" />
        </ListItemButton>

        {menuTree.map((item: IMenuTree) => (
          <MenuItemNode key={item.cid} item={item} level={0} />
        ))}
      </List>
    </Stack>
  );
}

function MenuItemNode({ item, level }: { item: IMenuTree; level: number }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  const hasChildren = item.children && item.children.length > 0;

  // Hàm render icon từ node.cicon
  const renderIcon = (iconName: string) => {
    const IconComponent =
      MuiIcons[iconName.replace("Icon", "") as keyof typeof MuiIcons];
    return IconComponent ? (
      <IconComponent fontSize="small" sx={{ mr: 1 }} />
    ) : null;
  };
  const handleClick = () => {
    if (hasChildren) setOpen(!open);
    // nếu không có children thì bạn có thể điều hướng tại đây
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={{ pl: 2 + level * 2 }}
        className={
          item.clink ===
          (pathname?.replace(/^\/+|\/+$/g, "").toLowerCase() ?? "")
            ? "!bg-blue-200 !border-l-4 !border-blue-500"
            : ""
        }>
        <ListItemIcon>
          {
            /* {(() => {
            const IconComponent = iconMap[item.cicon] || Folder;
            //console.log("iconname", item.cicon);
            return <IconComponent />;
          })()} */
            renderIcon(item.cicon)
          }
        </ListItemIcon>
        <ListItemText primary={item.ctenmenu} />
        {hasChildren ? (
          open ? (
            <MuiIcons.ExpandLess />
          ) : (
            <MuiIcons.ExpandMore />
          )
        ) : null}
      </ListItemButton>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children!.map((child) => (
              <Link key={child.cid} href={child.clink || ""} passHref>
                <MenuItemNode item={child} level={level + 1} />
              </Link>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}
