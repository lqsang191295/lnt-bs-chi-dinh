"use client";

import {
  getPatientInfoByMaBN,
  getPatientLichSuKhamByMaBN,
} from "@/actions/act_patient";
import { IPatientInfo, IPatientLichSuKham } from "@/model/tpatient";
import { getTextBirthday, StringToDate, StringToTime } from "@/utils/timer";
import { CalendarMonth, LocationPin, PhoneIphone } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TimelineIcon from "@mui/icons-material/Timeline";
import {
  Accordion,
  AccordionSummary,
  Avatar,
  Box,
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

  if (!id || id == "null") {
    return router.push(`/lich-su-kham`);
  }

  if (isChecking) return null;

  return (
    <div className="w-full h-full min-h-screen sm:p-4 md:p-6 lg:p-8 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Thông tin cơ bản bệnh nhân */}
        <Box className="bg-card text-card-foreground flex flex-col gap-6 sm:rounded-xl glass-card border-0 shadow-2xl">
          <Box className="p-2 sm:p-4 md:p-4 lg:p-6">
            <Box className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {loadingInfo ? (
                <PatientInfoSkeleton />
              ) : (
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      fontSize: 32,
                      bgcolor: "#1565c0",
                    }}>
                    AS
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600} fontSize={20}>
                      {patientInfo?.Hoten}
                    </Typography>
                    <Stack spacing={1} mt={1} fontSize="small">
                      <Box className="flex gap-2">
                        <Box className="flex items-center gap-1">
                          <CalendarMonth fontSize="small" />
                          {getTextBirthday(
                            patientInfo?.Ngaysinh,
                            patientInfo?.Thangsinh,
                            patientInfo?.Namsinh
                          )}{" "}
                          -{" "}
                          {`${
                            new Date().getFullYear() -
                            Number(patientInfo?.Namsinh || 0)
                          }`}
                          tuổi
                        </Box>
                        {patientInfo?.Dienthoai && (
                          <Typography
                            variant="body2"
                            className="flex items-center gap-1"
                            fontSize={"small"}>
                            <PhoneIphone fontSize="small" />
                            {patientInfo?.Dienthoai}
                          </Typography>
                        )}
                      </Box>

                      {patientInfo?.Diachi && (
                        <Typography
                          variant="body2"
                          className="flex items-center gap-1"
                          fontSize={"small"}>
                          <LocationPin fontSize="small" />
                          {patientInfo?.Diachi}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              )}
            </Box>
          </Box>
        </Box>

        {/* Lịch sử khám chữa bệnh */}
        <Box className="bg-card text-card-foreground flex flex-col gap-6 sm:rounded-xl glass-card border-0 shadow-2xl">
          <Box className="p-6">
            <Typography variant="h6" fontWeight={700}>
              <TimelineIcon className="text-[#10b981]" /> Lịch sử khám chữa bệnh
            </Typography>

            {loadingLsKham ? (
              <PatientLsKhamSkeleton />
            ) : (
              patientLsKham?.map((item, idx) => (
                <Accordion
                  key={idx}
                  sx={{
                    mb: 1,
                    boxShadow: "none",
                    background: "none",
                  }}
                  expanded={expanded === idx}
                  onChange={handleChange(idx)}>
                  <AccordionSummary
                    className="!p-0"
                    expandIcon={<ExpandMoreIcon />}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      sx={{ width: "100%" }}>
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium">
                            Ngày: {StringToDate(item.TGVao)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Thời gian: {StringToTime(item.TGVao)}
                          </p>
                        </div>
                      </div>
                      <Box className="flex gap-1 items-center border-1 border-green-500 px-3 rounded-lg mt-2 sm:mt-0">
                        <Typography fontSize="small">Chẩn đoán:</Typography>
                        <Typography fontSize="small" color="text.secondary">
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
      </div>
    </div>
  );
}
