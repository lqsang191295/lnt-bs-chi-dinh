"use client";

import { getphanquyenmenu, luuphanquyenmenu } from "@/actions/act_tnguoidung";
import { IMenuItem, IMenuTree } from "@/model/tmenu";
import { IUserItem } from "@/model/tuser";
import { useUserStore } from "@/store/user";
import { ToastSuccess } from "@/utils/toast";
import * as MuiIcons from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

interface DialogPhanQuyenMenuProps {
  selectedUser: IUserItem | null;
}

const DialogPhanQuyenMenu: React.FC<DialogPhanQuyenMenuProps> = ({
  selectedUser,
}) => {
  const { data: loginedUser } = useUserStore();
  const [dsMenu, setDsMenu] = useState<IMenuItem[]>([]);

  const handleCheckMenu = (
    cid: number,
    checked: boolean,
    newMenuList: IMenuItem[]
  ) => {
    setDsMenu(newMenuList);
  };

  const handleLuuPhanQuyenMenu = async () => {
    if (!selectedUser) return;
    for (const item of dsMenu) {
      await luuphanquyenmenu(
        loginedUser.ctaikhoan,
        "2",
        selectedUser.ctaikhoan,
        item.cid,
        item.ctrangthai.toString()
      );
    }
    ToastSuccess("Lưu phân quyền menu thành công!");
  };

  function MenuTree({
    menuList,
    onCheck,
  }: {
    menuList: IMenuItem[];
    onCheck: (cid: number, checked: boolean, newMenuList: IMenuItem[]) => void;
  }) {
    const buildTree = (list: IMenuItem[], parentId: number): IMenuTree[] =>
      list
        .filter((item) => item.cidcha === parentId)
        .sort((a, b) => Number(a.cthutu) - Number(b.cthutu))
        .map((item) => ({
          ...item,
          children: buildTree(list, item.cid),
        }));

    const tree = buildTree(menuList, 0);

    const updateNodeCheck = (
      nodes: IMenuTree[],
      cid: number,
      checked: boolean
    ): IMenuTree[] =>
      nodes.map((node) => {
        if (node.cid === cid) {
          return {
            ...node,
            ctrangthai: checked ? 1 : 0,
            children: node.children
              ? updateAllChildren(node.children, checked)
              : [],
          };
        }
        return {
          ...node,
          children: node.children
            ? updateNodeCheck(node.children, cid, checked)
            : [],
        };
      });

    const updateAllChildren = (
      nodes: IMenuTree[],
      checked: boolean
    ): IMenuTree[] =>
      nodes.map((node) => ({
        ...node,
        ctrangthai: checked ? 1 : 0,
        children: node.children
          ? updateAllChildren(node.children, checked)
          : [],
      }));

    const handleCheck = (cid: number, checked: boolean) => {
      const newTree = updateNodeCheck(tree, cid, checked);
      const flatten = (nodes: IMenuTree[]): IMenuItem[] =>
        nodes.reduce<IMenuItem[]>(
          (acc, node) => [
            ...acc,
            { ...node, children: undefined } as IMenuItem,
            ...(node.children ? flatten(node.children) : []),
          ],
          []
        );
      const newMenuList = flatten(newTree);
      onCheck(cid, checked, newMenuList);
    };

    const renderIcon = (iconName: string) => {
      const IconComponent =
        MuiIcons[iconName.replace("Icon", "") as keyof typeof MuiIcons];
      return IconComponent ? (
        <IconComponent fontSize="small" sx={{ mr: 1, color: '#666' }} />
      ) : null;
    };

    // Flatten tree cho từng column (mỗi parent là 1 cột)
    const flattenTreeForColumn = (node: IMenuTree, level: number = 0): Array<IMenuTree & { level: number }> => {
      const result: Array<IMenuTree & { level: number }> = [];
      result.push({ ...node, level });
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          result.push(...flattenTreeForColumn(child, level + 1));
        });
      }
      
      return result;
    };

    // Render một item menu
    const renderMenuItem = (item: IMenuTree & { level: number }) => (
      <Box
        key={item.cid}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          pl: item.level * 2 + 1, // Thụt đầu dòng theo level
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          bgcolor: item.level === 0 ? '#f8f9fa' : '#fff',
          mb: 0.5,
          '&:hover': {
            bgcolor: '#f0f7ff',
            borderColor: '#1976d2'
          },
          minHeight: 40
        }}
      > 
        {/* Checkbox */}
          {/* Prefix cho child items */}
        <Typography
            variant="caption"
            sx={{ 
              color: '#1976d2',
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              fontSize: '0.7rem',
              ml: 1
            }}
          >
          {item.level > 0 && '└─  '}
          </Typography>
        <input
          type="checkbox"
          checked={item.ctrangthai === 1}
          onChange={(e) => handleCheck(item.cid, e.target.checked)}
          style={{ 
            marginRight: 8,
            cursor: 'pointer'
          }}
        />
        
        {/* Icon */}
        {renderIcon(item.cicon)}
        
        {/* Text */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: item.level === 0 ? 'bold' : 'normal',
            fontSize: item.level === 0 ? '0.9rem' : '0.85rem',
            color: item.level === 0 ? '#1976d2' : '#333',
            flex: 1,
            userSelect: 'none',
            cursor: 'pointer'
          }}
          onClick={() => handleCheck(item.cid, item.ctrangthai === 0)}
        > 
          {item.ctenmenu}
        </Typography>
        
        {/* Badge level */}
        {item.level > 0 && (
          <Typography
            variant="caption"
            sx={{
              bgcolor: '#e3f2fd',
              color: '#1976d2',
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              fontSize: '0.7rem',
              ml: 1
            }}
          >
            {item.level}
          </Typography>
        )}
      </Box>
    );

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Responsive columns
          gap: 2,
          p: 2
        }}
      >
        {tree.map((parentNode) => {
          const columnItems = flattenTreeForColumn(parentNode);
          
          return (
            <Box
              key={parentNode.cid}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid #e3f2fd',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#fafafa'
              }}
            >
              {/* Column Header - Parent Menu */}
              {/* <Box
                sx={{
                  bgcolor: '#1976d2',
                  color: 'white',
                  p: 1.5,
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                >
                  {renderIcon(parentNode.cicon)}
                  {parentNode.ctenmenu}
                </Typography>
              </Box> */}
              
              {/* Column Content - All items in this column */}
              <Box sx={{ p: 1 }}>
                {columnItems.map((item) => renderMenuItem(item))}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  const GetMenuPhanQuyen = useCallback(async () => {
    if (!selectedUser) return;

    const result = await getphanquyenmenu(
      loginedUser.ctaikhoan,
      "1",
      selectedUser.ctaikhoan
    );
    console.log("dsMenu phan quyen user", result);
    if (Array.isArray(result)) setDsMenu(result);
    else setDsMenu([]);
  }, [loginedUser, selectedUser]);

  useEffect(() => {
    GetMenuPhanQuyen();
  }, [GetMenuPhanQuyen]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: "1px solid #ccc",
        borderRadius: 2,
        bgcolor: "#fff",
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      {/* <Box sx={{ p: 2, flexShrink: 0, borderBottom: '1px solid #eee' }}>
        <Typography fontWeight="bold" sx={{ color: "#1976d2" }}>
          Danh sách chức năng
        </Typography>
        <Typography variant="caption" sx={{ color: '#666', mt: 0.5 }}>
          Chọn các chức năng để phân quyền cho người dùng. Mỗi cột đại diện cho một nhóm chức năng.
        </Typography>
      </Box>
       */}
      {/* Content - Column Layout */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >
        <MenuTree menuList={dsMenu} onCheck={handleCheckMenu} />
      </Box>
      
      {/* Footer */}
      <Box sx={{ p: 2, textAlign: "right", flexShrink: 0, borderTop: '1px solid #eee' }}>
        <Button 
          variant="contained" 
          onClick={handleLuuPhanQuyenMenu}
          sx={{
            minWidth: 100,
            height: 36
          }}
        >
          LƯU
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(DialogPhanQuyenMenu);