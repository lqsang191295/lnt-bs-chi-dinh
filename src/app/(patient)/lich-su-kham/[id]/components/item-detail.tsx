import {
  getPatientChiDinhByMaBN_SoVaoVien,
  getPatientToaThuocByMaBN_SoVaoVien,
} from "@/actions/act_patient";
import { IPatientLichSuKham } from "@/model/tpatient";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import useSWR from "swr";

interface ItemDetailProps {
  lsKham: IPatientLichSuKham;
}

const PDFViewerBox = ({ title }: { title: string }) => (
  <Box
    className="h-64 relative"
    sx={{
      border: "1px solid #e0e0e0",
      borderRadius: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#fff",
      flexDirection: "column",
    }}>
    <Typography variant="subtitle1" className="absolute bottom-1">
      {title}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      (PDF Viewer sẽ hiển thị ở đây)
    </Typography>
  </Box>
);

const fetcherToaThuoc = async (id: string, sovaovien: string) => {
  if (!id || !sovaovien) return null;
  return await getPatientToaThuocByMaBN_SoVaoVien(id, sovaovien);
};

const fetcherChiDinh = async (id: string, sovaovien: string) => {
  if (!id || !sovaovien) return null;
  return await getPatientChiDinhByMaBN_SoVaoVien(id, sovaovien);
};

function ItemDetail({ lsKham }: ItemDetailProps) {
  const { data: ToaThuoc, isLoading: isLoadingToaThuoc } = useSWR(
    lsKham ? ["patient-toathuoc", lsKham.MaBN] : null,
    () => fetcherToaThuoc(lsKham.MaBN!, lsKham.SoVaoVien!)
  );
  const { data: ChiDinh, isLoading: isLoadingChiDinh } = useSWR(
    lsKham ? ["patient-chidinh", lsKham.MaBN] : null,
    () => fetcherChiDinh(lsKham.MaBN!, lsKham.SoVaoVien!)
  );

  useEffect(() => {
    console.log("lsKham:", lsKham);
  }, [lsKham]);

  return (
    <AccordionDetails className="bg-blue-300">
      <Box className="flex gap-1 !text-[10px]">
        <Typography>Chẩn đoán chính:</Typography>
        <Typography color="text.secondary">
          {lsKham.VVIET_ChanDoanChinh}
        </Typography>
      </Box>
      <Accordion sx={{ mb: 1, boxShadow: 0, bgcolor: "#f9f9f9" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Chỉ định</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Box 1 */}
            <Grid size={{ xs: 12, sm: 12, md: 4 }}>
              <PDFViewerBox title="Toa thuốc 1" />
            </Grid>
            {/* Box 2 */}
            <Grid size={{ xs: 12, sm: 12, md: 4 }}>
              <PDFViewerBox title="Toa thuốc 2" />
            </Grid>
            {/* Box 3 */}
            <Grid size={{ xs: 12, sm: 12, md: 4 }}>
              <PDFViewerBox title="Toa thuốc 3" />
            </Grid>
            {/* Box 4 */}
            <Grid size={{ xs: 12, sm: 12, md: 4 }}>
              <PDFViewerBox title="Toa thuốc 4" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ mb: 1, boxShadow: 0, bgcolor: "#f9f9f9" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Toa thuốc</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Toa thuốc</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion sx={{ mb: 1, boxShadow: 0, bgcolor: "#f9f9f9" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Bảng kê</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Bảng kê</Typography>
        </AccordionDetails>
      </Accordion>
    </AccordionDetails>
  );
}

export default React.memo(ItemDetail);
