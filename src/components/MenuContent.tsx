"use client";

import React, { useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Stack,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
// import { ExpandLess, ExpandMore, Folder, Bookmark } from "@mui/icons-material"; 
import Link from "next/link";
import { useMenuStore } from "@/store/menu";
import { buildMenuTree } from "@/utils/menu";
import type { IMenuTree } from "@/model/menu";
import { usePathname } from "next/navigation";
export default function MenuContent() {
  const { data: menuData } = useMenuStore();
  const menuTree = buildMenuTree(menuData);
  return (
    <Stack sx={{ flexGrow: 1, p: 1 }}>
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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // console.log(
  //   'pathname.replace(/^/+|/+$/g, "").toLowerCase() ============= ',
  //   pathname.replace(/^\/+|\/+$/g, "").toLowerCase()
  // );

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
          item.clink === (pathname?.replace(/^\/+|\/+$/g, "").toLowerCase() ?? "")
            ? "bg-blue-300 hover:bg-blue-400"
            : ""
        }>
        <ListItemIcon>
          {/* {(() => {
            const IconComponent = iconMap[item.cicon] || Folder;
            //console.log("iconname", item.cicon);
            return <IconComponent />;
          })()} */
          renderIcon(item.cicon)
          }
        </ListItemIcon>
        <ListItemText primary={item.ctenmenu} />
        {hasChildren ? open ? <MuiIcons.ExpandLess /> : <MuiIcons.ExpandMore /> : null}
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
