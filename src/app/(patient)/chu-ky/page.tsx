"use client";

import HeadMetadata from "@/components/HeadMetadata";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function Page() {
  const sigRef = useRef<SignatureCanvas>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleClear = () => {
    sigRef.current?.clear();
  };

  const handleSave = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("Vui lòng ký tên");
      return;
    }
    const base64 = sigRef.current?.getTrimmedCanvas().toDataURL("image/png");

    console.log("Base64 Signature:", base64);
  };

  const handlePreview = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("Chưa có chữ ký để preview");
      return;
    }

    const base64 = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    setPreview(base64);
    setOpenPreview(true);
  };

  useEffect(() => {
    if (!wrapperRef.current) return;

    const resize = () => {
      setSize({
        width: wrapperRef.current!.offsetWidth,
        height: wrapperRef.current!.offsetHeight,
      });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <Box className="w-screen h-screen overflow-hidden flex flex-col bg-white">
      <HeadMetadata title="Chữ ký" />
      <Box className="bg-white flex gap-2 p-2 w-full">
        <Stack direction="row" spacing={2}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
            Chọn bệnh nhân
          </Typography>
          <Select
            className="w-full flex-1"
            //value={selectedKhoa}
            size="small"
            //onChange={(e) => setSelectedKhoa(e.target.value)}
            displayEmpty>
            {/* {khoaList.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))} */}
          </Select>
          <Button variant="outlined" onClick={handleClear}>
            Xóa
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu chữ ký
          </Button>
          <Button variant="contained" onClick={handlePreview}>
            Preview chữ ký
          </Button>
        </Stack>
      </Box>

      <Box
        ref={wrapperRef}
        className="w-full h-full flex-1 border border-red-500">
        {size.width > 0 && (
          <SignatureCanvas
            ref={sigRef}
            backgroundColor="rgba(0,0,0,0)" // hoặc bỏ luôn
            penColor="#ff0000"
            canvasProps={{
              width: size.width,
              height: size.height,
            }}
          />
        )}
      </Box>

      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Xem trước chữ ký</DialogTitle>

        <DialogContent>
          {preview && (
            <Box
              sx={{
                border: "1px dashed #ccc",
                p: 2,
                textAlign: "center",
              }}>
              <img
                src={preview}
                alt="Signature Preview"
                style={{
                  maxWidth: "100%",
                  background:
                    "repeating-conic-gradient(#f5f5f5 0% 25%, #fff 0% 50%) 50% / 20px 20px",
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
