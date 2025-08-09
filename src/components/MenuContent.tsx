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
import { ExpandLess, ExpandMore, Folder, Bookmark } from "@mui/icons-material";
import HomeIcon from "@mui/icons-material/Home";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryIcon from "@mui/icons-material/History";
import IosShareIcon from "@mui/icons-material/IosShare";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import StorageIcon from "@mui/icons-material/Storage";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
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
            <Bookmark />
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
  const pathname = usePathname() || "";
  console.log(
    'pathname.replace(/^/+|/+$/g, "").toLowerCase() ============= ',
    pathname?.replace(/^\/+|\/+$/g, "").toLowerCase()
  );

  const hasChildren = item.children && item.children.length > 0;

  const iconMap: Record<string, React.ElementType> = {
    home: HomeIcon,
    SettingsIcon: SettingsIcon,
    folder: Folder,
    ManageAccountsIcon: ManageAccountsIcon,
    HistoryIcon: HistoryIcon,
    IosShareIcon: IosShareIcon,
    PublishedWithChangesIcon: PublishedWithChangesIcon,
    StorageIcon: StorageIcon,
    ContentPasteSearchIcon: ContentPasteSearchIcon,
    ManageSearchIcon: ManageSearchIcon,
    SwitchAccountIcon: SwitchAccountIcon,
    EventRepeatOutlinedIcon: EventRepeatOutlinedIcon,
    // thêm các icon khác nếu cần
  };
  const handleClick = () => {
    if (hasChildren) setOpen(!open);
    // nếu không có children thì bạn có thể điều hướng tại đây
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={{
          pl: 2 + level * 2,
          backgroundColor:
            item.clink === pathname.replace(/^\/+|\/+$/g, "").toLowerCase()
              ? "oklch(80.9% 0.105 251.813)"
              : "",
          "&:hover": {
            backgroundColor:
              item.clink === pathname.replace(/^\/+|\/+$/g, "").toLowerCase()
                ? "oklch(70.7% 0.165 254.624)"
                : "",
          },
        }}>
        <ListItemIcon>
          {(() => {
            const IconComponent = iconMap[item.cicon] || Folder;
            //console.log("iconname", item.cicon);
            return <IconComponent />;
          })()}
        </ListItemIcon>
        <ListItemText primary={item.ctenmenu} />
        {hasChildren ? open ? <ExpandLess /> : <ExpandMore /> : null}
      </ListItemButton>

      {hasChildren && (
        <Collapse in={true} timeout="auto" unmountOnExit>
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
