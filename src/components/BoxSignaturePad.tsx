"use client";

import PdfSignViewer from "@/components/PdfSignViewer";
import { IPatientInfoCanKyTay } from "@/model/tpatient";
import { Box } from "@mui/material";

export default function BoxSignaturePad({
  patientSelected,
}: {
  patientSelected: IPatientInfoCanKyTay;
}) {
  return (
    <Box className="w-full h-full">
      {patientSelected && <PdfSignViewer patientSelected={patientSelected} />}
    </Box>
  );
}
