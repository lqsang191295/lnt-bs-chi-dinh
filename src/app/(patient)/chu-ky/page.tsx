"use client";

import { saveChuKyPartient } from "@/actions/act_patient";
import BoxSignaturePad from "@/components/BoxSignaturePad";
import HeadMetadata from "@/components/HeadMetadata";
import { IPatientInfo, IPatientInfoCanKyTay } from "@/model/tpatient";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import PatientList from "./components/PatientList";

const ComponentPdfPreview = dynamic(
  () => import("../../../components/PdfPreview"),
  {
    ssr: false, // Dòng này là mấu chốt: Tắt Server-Side Rendering cho component này
  }
);

export default function Page() {
  const sigRef = useRef<SignatureCanvas>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [patientInfo, setPatientInfo] = useState<IPatientInfo | null>(null);
  const [patientSelected, setPatientSelected] =
    useState<IPatientInfoCanKyTay | null>(null);

  const handleClear = () => {
    sigRef.current?.clear();
  };

  const handleSave = async () => {
    try {
      if (!sigRef.current || sigRef.current.isEmpty()) {
        alert("Vui lòng ký tên");
        return;
      }

      if (!patientInfo) {
        alert("Vui lòng chọn bệnh nhân trước khi lưu chữ ký");
        return;
      }

      const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");

      console.log("Base64 Signature:", base64);

      if (base64 == null) {
        alert("Có lỗi xảy ra");
        return;
      }

      await saveChuKyPartient("777683", base64 || "");
    } catch (error) {
      console.error("Error saving signature:", error);
      alert("Có lỗi xảy ra khi lưu chữ ký");
    }
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

  console.log("Selected patient:", patientSelected);

  return (
    <Box className="w-screen h-screen overflow-hidden flex flex-col bg-white">
      <HeadMetadata title="Chữ ký" />
      {/* <Box className="bg-white flex justify-between gap-2 p-2 w-full">
        <Stack direction="row" spacing={1}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
            Chọn bệnh nhân
          </Typography>
          <PatientSearch
            patientInfo={patientInfo}
            setPatientInfo={setPatientInfo}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="error" onClick={handleClear}>
            Xóa chữ ký
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu chữ ký
          </Button>
          <Button variant="contained" onClick={handlePreview}>
            Preview chữ ký
          </Button>
        </Stack>
      </Box> */}

      <Box className="w-full h-full flex flex-row overflow-hidden">
        <Box className="w-2xs h-full ">
          <PatientList onSelectPatient={setPatientSelected} />
        </Box>
        <Box className="flex-1 border-l border-dashed border-gray-500 overflow-hidden">
          <Box className="w-full h-full">
            {patientSelected && (
              <BoxSignaturePad patientSelected={patientSelected} />
            )}
          </Box>
        </Box>
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
              <Image
                src={preview}
                alt="Signature Preview"
                width={400}
                height={200}
                unoptimized
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
