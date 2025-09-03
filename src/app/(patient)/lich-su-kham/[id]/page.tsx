"use client";

import {
  getPatientInfoByMaBN,
  getPatientLichSuKhamByMaBN,
} from "@/actions/act_patient";
import { IPatientInfo, IPatientLichSuKham } from "@/model/tpatient";
import { getTextBirthday, StringToDate, StringToTime } from "@/utils/timer";
import { CalendarMonth, LocationPin, PhoneIphone } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionSummary,
  Avatar,
  Box,
  Card,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ItemDetail from "./components/item-detail";
import {
  PatientInfoSkeleton,
  PatientLsKhamSkeleton,
} from "./components/patient-skeleton";

export default function PatientDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);
  const [patientInfo, setPatientInfo] = useState<IPatientInfo | null>(null);
  const [patientLsKham, setPatientLsKham] = useState<
    IPatientLichSuKham[] | null
  >(null);
  const [expanded, setExpanded] = useState<number | false>(false);

  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingLsKham, setLoadingLsKham] = useState(true);

  const handleChange =
    (idx: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? idx : false);
    };

  const getPatientInfo = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingInfo(true);
      const data = await getPatientInfoByMaBN(id);
      if (data) setPatientInfo(data);
    } finally {
      setLoadingInfo(false);
    }
  }, [id]);

  const getPatientLsKham = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingLsKham(true);
      const data = await getPatientLichSuKhamByMaBN(id);
      if (data) setPatientLsKham(data);
    } finally {
      setLoadingLsKham(false);
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token-patient");
    if (token) {
      setIsChecking(false);
      return;
    }
    if (!token) {
      localStorage.removeItem("token-patient");
      return router.push(`/lich-su-kham?mabn=${id}`);
    }
    const dataToken = JSON.parse(atob(token));
    if (dataToken.mabn !== id) {
      localStorage.removeItem("token-patient");
      return router.push(`/lich-su-kham?mabn=${id}`);
    }
  }, [id, router]);

  useEffect(() => {
    getPatientInfo();
  }, [getPatientInfo]);

  useEffect(() => {
    getPatientLsKham();
  }, [getPatientLsKham]);

  if (isChecking) return null;

  return (
    <Box
      className="h-screen overflow-auto"
      sx={{
        maxWidth: { xs: "100vw", sm: "100vw", md: "80vw", lg: "70vw" },
        mx: "auto",
        bgcolor: "#f5f7fa",
        boxShadow: 2,
        p: 1,
      }}>
      {/* Thông tin cơ bản bệnh nhân */}
      <Card
        className="!bg-blue-500"
        sx={{ p: 1, mb: 3, borderRadius: 3, color: "#fff" }}>
        {loadingInfo ? (
          <PatientInfoSkeleton />
        ) : (
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              sx={{ width: 72, height: 72, fontSize: 32, bgcolor: "#1565c0" }}>
              AS
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} fontSize={20}>
                {patientInfo?.Hoten}
              </Typography>
              <Stack spacing={1} mt={1} fontSize={12}>
                <Box className="flex items-center gap-1">
                  <CalendarMonth fontSize="small" />
                  {getTextBirthday(
                    patientInfo?.Ngaysinh,
                    patientInfo?.Thangsinh,
                    patientInfo?.Namsinh
                  )}{" "}
                  -{" "}
                  {`${
                    new Date().getFullYear() - Number(patientInfo?.Namsinh || 0)
                  }`}
                  tuổi
                </Box>
                {patientInfo?.Diachi && (
                  <Typography
                    variant="body2"
                    className="flex items-center gap-1">
                    <LocationPin fontSize="small" />
                    {patientInfo?.Diachi}
                  </Typography>
                )}
                {patientInfo?.Dienthoai && (
                  <Typography
                    variant="body2"
                    className="flex items-center gap-1">
                    <PhoneIphone fontSize="small" />
                    {patientInfo?.Dienthoai}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        )}
      </Card>

      {/* Lịch sử khám chữa bệnh */}
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Lịch sử khám chữa bệnh
        </Typography>

        {loadingLsKham ? (
          <PatientLsKhamSkeleton />
        ) : (
          patientLsKham?.map((item, idx) => (
            <Accordion
              key={idx}
              sx={{ mb: 1 }}
              expanded={expanded === idx}
              onChange={handleChange(idx)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  sx={{ width: "100%" }}>
                  <Box className="flex gap-1">
                    <Typography fontWeight={600}>Ngày:</Typography>
                    <Typography>{StringToDate(item.TGVao)}</Typography>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ mx: 1, borderColor: "#1976d2" }}
                    />
                    <Typography color="text.secondary">
                      {StringToTime(item.TGVao)}
                    </Typography>
                  </Box>
                  <Box className="flex gap-1">
                    <Typography>Chẩn đoán:</Typography>
                    <Typography color="text.secondary">
                      {item.VVIET_ChanDoanChinh}
                    </Typography>
                  </Box>
                </Stack>
              </AccordionSummary>
              {expanded === idx && <ItemDetail lsKham={item} />}
            </Accordion>
          ))
        )}
      </Box>
    </Box>
  );
}
