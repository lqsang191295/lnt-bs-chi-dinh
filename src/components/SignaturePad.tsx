"use client";

import { Box, Button } from "@mui/material";
import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  onConfirm: (base64: string) => void;
  onCancel: () => void;
};

export default function SignaturePad({ onConfirm, onCancel }: Props) {
  const sigRef = useRef<SignatureCanvas>(null);

  return (
    <Box>
      <SignatureCanvas
        ref={sigRef}
        penColor="#0B3C8A" // 🔵 xanh bút bi
        minWidth={1} // nét mảnh
        maxWidth={1.2} // không bị phình
        throttle={60} // mượt
        canvasProps={{
          width: 400,
          height: 200,
          style: {
            border: "1px dashed #aaa",
            background: "transparent",
          },
        }}
      />

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button onClick={() => sigRef.current?.clear()} color="warning">
          Xóa
        </Button>

        <Box>
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() =>
              onConfirm(
                sigRef.current!.getTrimmedCanvas().toDataURL("image/png")
              )
            }>
            Xác nhận
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
