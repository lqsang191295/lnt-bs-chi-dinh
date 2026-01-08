"use client";

import BoxSignaturePad from "@/components/BoxSignaturePad";
import HeadMetadata from "@/components/HeadMetadata";
import { IPatientInfoCanKyTay } from "@/model/tpatient";
import { Box } from "@mui/material";
import { useState } from "react";
import PatientList from "./components/PatientList";

export default function Page() {
  const [patientSelected, setPatientSelected] =
    useState<IPatientInfoCanKyTay | null>(null);

  return (
    <Box className="w-screen h-screen overflow-hidden flex flex-col bg-white">
      <HeadMetadata title="Chữ ký" />

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
    </Box>
  );
}
