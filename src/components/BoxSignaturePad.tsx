"use client";

import PdfSignViewer, { iSignPoint } from "@/components/PdfSignViewer";
import SignaturePad from "@/components/SignaturePad";
import { IPatientInfoCanKyTay } from "@/model/tpatient";
import { signPdf } from "@/utils/signPdf";
import { Box, Dialog } from "@mui/material";
import { useEffect, useState } from "react";

export default function BoxSignaturePad({
  patientSelected,
}: {
  patientSelected: IPatientInfoCanKyTay;
}) {
  const [openPad, setOpenPad] = useState(false);
  const [signPoint, setSignPoint] = useState<iSignPoint | null>(null);

  // 🔥 PDF đang hiển thị
  const [pdfBase64, setPdfBase64] = useState<string>("");

  useEffect(() => {
    setPdfBase64(patientSelected?.FilePdfKySo || "");
  }, [patientSelected]);

  return (
    <Box className="w-full h-full">
      {/* PREVIEW PDF */}
      {pdfBase64 && (
        <PdfSignViewer
          base64={pdfBase64}
          onSelectPoint={(p) => {
            setSignPoint(p);
            setOpenPad(true);
          }}
        />
      )}

      {/* POPUP KÝ TAY */}
      <Dialog
        open={openPad}
        onClose={() => setOpenPad(false)}
        maxWidth="sm"
        fullWidth>
        <SignaturePad
          onCancel={() => setOpenPad(false)}
          onConfirm={async (signatureBase64) => {
            if (!signPoint) return;

            // 🔥 GẮN CHỮ KÝ VÀO PDF
            const signedPdfBase64 = await signPdf({
              pdfBase64,
              signatureBase64,
              page: signPoint.page,
              pdfX: signPoint.pdfX,
              pdfY: signPoint.pdfY,
              width: 60,
            });

            // 🔥 UPDATE PDF HIỂN THỊ
            setPdfBase64(signedPdfBase64);

            // 🔥 UPDATE DATA PATIENT (local)
            patientSelected.FilePdfKySo = signedPdfBase64;

            // TODO (backend):
            // await api.updatePdfSigned({
            //   maBN: patientSelected.MaBN,
            //   pdfBase64: signedPdfBase64,
            // });

            setOpenPad(false);
          }}
        />
      </Dialog>
    </Box>
  );
}
