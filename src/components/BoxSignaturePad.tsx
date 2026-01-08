"use client";

import { IPatientInfoCanKyTay } from "@/model/tpatient";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";

const PdfSignViewerNoSSR = dynamic(
  () => import("../components/PdfSignViewer"),
  { ssr: false }
);

export default function BoxSignaturePad({
  patientSelected,
}: {
  patientSelected: IPatientInfoCanKyTay;
}) {
  return (
    <Box className="w-full h-full">
      {patientSelected && (
        <PdfSignViewerNoSSR patientSelected={patientSelected} />
      )}
    </Box>
  );
}
