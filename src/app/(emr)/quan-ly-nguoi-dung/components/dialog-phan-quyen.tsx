"use client";

import { IUserItem } from "@/model/tuser";
import { DataManager } from "@/services/DataManager";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import DialogPhanQuyenMenu from "./dialog-phan-quyen-menu";
import DialogPhanQuyenBa from "./dialog-phan-quyen-ba";
import DialogPhanQuyenBaKhoa from "./dialog-phan-quyen-bakhoa";

function TabPanel(props: {
  children?: React.ReactNode;
  value: number;
  index: number;
}) {
  const { children, value, index, ...other } = props;
  return (
    <div 
      hidden={value !== index} 
      {...other}
      style={{
        height: value === index ? '100%' : 0,
        overflow: 'hidden',
        display: value === index ? 'block' : 'none'
      }}
    >
      {value === index && (
        <Box sx={{ 
          height: '100%', // Chiều cao 100% để fill container
          width: '100%',
          overflow: 'hidden'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface DialogPhanQuyenProps {
  open: boolean;
  onClose: () => void;
  selectedUser: IUserItem | null;
}

const DialogPhanQuyen: React.FC<DialogPhanQuyenProps> = ({
  open,
  onClose,
  selectedUser,
}) => {
  const [khoaList, setKhoaList] = useState<{ value: string; label: string }[]>([]);
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: unknown, newIndex: number) => {
    setTabIndex(newIndex);
  };

  const fetchKhoaList = useCallback(async () => {
    try {
      const dataKhoaPhong = await DataManager.getDmKhoaPhong();
      setKhoaList(dataKhoaPhong);
    } catch (error) {
      console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  }, []);

  useEffect(() => {
    fetchKhoaList();
  }, [fetchKhoaList]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 1200,
          maxWidth: 1200,
          height: 700,
          maxHeight: 700,
        }
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "move",
          userSelect: "none",
          height: 60,
          flexShrink: 0
        }}
      >
        <Typography fontWeight="bold" sx={{ color: '#1976d2' }}>
          PHÂN QUYỀN NGƯỜI DÙNG
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent 
        sx={{ 
          display: "flex", 
          flexDirection: 'column',
          gap: 2,
          height: 'calc(100% - 60px)',
          overflow: 'hidden',
          p: 2 // Padding đều 16px tất cả các phía
        }}
      >
        {/* Thông tin user - nằm ngang trên cùng */}
        <Box 
          sx={{ 
            width: '100%',
            flexShrink: 0,
            bgcolor: "#f7f7f7", 
            p: 2, 
            borderRadius: 2,
            height: 'fit-content'
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              flexWrap: 'wrap'
            }}
          >
            <Typography>
              <strong>Họ tên:</strong> {selectedUser?.choten}
            </Typography>
            <Typography>
              <strong>Tài khoản:</strong> {selectedUser?.ctaikhoan}
            </Typography>
            <Typography>
              <strong>Đơn vị:</strong>{" "}
              {khoaList.find((item) => item.value === selectedUser?.cmadonvi)
                ?.label || ""}
            </Typography>
          </Box>
        </Box>

        {/* Nội dung tabs - phần phân quyền */}
        <Box 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabIndex} 
            onChange={handleTabChange} 
            sx={{ 
              mb: 2,
              flexShrink: 0,
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <Tab label="Phân quyền chức năng" />
            <Tab label="Phân quyền theo HSBA" />
            <Tab label="Phân quyền HSBA theo khoa" />
          </Tabs>

          {/* Tab Content - Chiều cao tự động điều chỉnh */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'hidden'
          }}>
            <TabPanel value={tabIndex} index={0}>
              <DialogPhanQuyenMenu selectedUser={selectedUser} />
            </TabPanel>
            
            <TabPanel value={tabIndex} index={1}>
              <DialogPhanQuyenBa 
                selectedUser={selectedUser} 
                khoaList={khoaList} 
              />
            </TabPanel>
            
            <TabPanel value={tabIndex} index={2}>
              <DialogPhanQuyenBaKhoa selectedUser={selectedUser} />
            </TabPanel>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(DialogPhanQuyen);