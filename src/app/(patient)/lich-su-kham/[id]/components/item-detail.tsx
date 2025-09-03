import {
  getPatientBangKeByMaBN_SoVaoVien,
  getPatientChiDinhByMaBN_SoVaoVien,
  getPatientPkBenhByMaBN_SoVaoVien,
  getPatientToaThuocByMaBN_SoVaoVien,
} from "@/actions/act_patient";
import PdfGallery from "@/components/PdfGallery";
import Spinner from "@/components/spinner";
import {
  IPatientBangKe,
  IPatientChiDinh,
  IPatientLichSuKham,
  IPatientPkBenh,
  IPatientToaThuoc,
} from "@/model/tpatient";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";

interface ItemDetailProps {
  lsKham: IPatientLichSuKham;
}

function ItemDetail({ lsKham }: ItemDetailProps) {
  const [dataChiDinh, setDataChiDinh] = React.useState<IPatientChiDinh[]>([]);
  const [loadingChiDinh, setLoadingChiDinh] = React.useState<boolean>(false);
  const [dataToaThuoc, setDataToaThuoc] = React.useState<IPatientToaThuoc[]>(
    []
  );
  const [loadingToaThuoc, setLoadingToaThuoc] = React.useState<boolean>(false);
  const [dataBangKe, setDataBangKe] = React.useState<IPatientBangKe[]>([]);
  const [loadingBangKe, setLoadingBangKe] = React.useState<boolean>(false);
  const [dataPkBenh, setDataPkBenh] = React.useState<IPatientPkBenh[]>([]);
  const [loadingPkBenh, setLoadingPkBenh] = React.useState<boolean>(false);

  useEffect(() => {
    if (!lsKham) return;

    let isMounted = true;
    setLoadingChiDinh(true);

    (async () => {
      try {
        const data = await getPatientChiDinhByMaBN_SoVaoVien(
          lsKham.MaBN!,
          lsKham.SoVaoVien!
        );

        if (isMounted) {
          console.log("data chi dinh:", data);
          setDataChiDinh(data || []);
        }
      } catch (error) {
        console.error("Error fetching Chi Dinh data:", error);
        if (isMounted) setDataChiDinh([]);
      } finally {
        if (isMounted) setLoadingChiDinh(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [lsKham]);

  useEffect(() => {
    if (!lsKham) return;

    let isMounted = true;
    setLoadingToaThuoc(true);

    (async () => {
      try {
        const data = await getPatientToaThuocByMaBN_SoVaoVien(
          lsKham.MaBN!,
          lsKham.SoVaoVien!
        );
        if (isMounted) setDataToaThuoc(data || []);
      } catch (error) {
        console.error("Error fetching Chi Dinh data:", error);
        if (isMounted) setDataToaThuoc([]);
      } finally {
        if (isMounted) setLoadingToaThuoc(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [lsKham]);

  useEffect(() => {
    if (!lsKham) return;

    setLoadingBangKe(true);

    (async () => {
      try {
        const data = await getPatientBangKeByMaBN_SoVaoVien(
          lsKham.MaBN!,
          lsKham.SoVaoVien!
        );
        setDataBangKe(data || []);
      } catch (error) {
        console.error("Error fetching Chi Dinh data:", error);
        setDataBangKe([]);
      } finally {
        setLoadingBangKe(false);
      }
    })();
  }, [lsKham]);

  useEffect(() => {
    if (!lsKham) return;

    setLoadingPkBenh(true);

    (async () => {
      try {
        const data = await getPatientPkBenhByMaBN_SoVaoVien(
          lsKham.MaBN!,
          lsKham.SoVaoVien!
        );
        setDataPkBenh(data || []);
      } catch (error) {
        console.error("Error fetching Chi Dinh data:", error);
        setDataPkBenh([]);
      } finally {
        setLoadingPkBenh(false);
      }
    })();
  }, [lsKham]);

  return (
    <AccordionDetails className="bg-blue-100">
      {dataPkBenh && (
        <Accordion sx={{ mb: 1, boxShadow: 0, background: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              p: 0,
              margin: 0,
            }}>
            <Typography fontWeight={600}>Phiếu khám bệnh</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              p: 0,
              margin: 0,
            }}>
            {!loadingPkBenh && dataPkBenh && dataPkBenh.length > 0 && (
              <PdfGallery
                files={dataPkBenh
                  .filter((i: IPatientPkBenh) => !!i.FilePdfKySo)
                  .map((i: IPatientPkBenh) => ({
                    filename: i.TenLoaiPhieuY,
                    base64: i.FilePdfKySo,
                  }))}
              />
            )}
            {!loadingPkBenh && dataPkBenh && dataPkBenh.length === 0 && (
              <Typography>Không có Phiếu khám bệnh</Typography>
            )}
            {loadingPkBenh && (
              <Box className="flex flex-row gap-2">
                <Spinner />
                <Typography>Đang tải dữ liệu...</Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}
      {dataChiDinh && (
        <Accordion sx={{ p: 0, mb: 1, boxShadow: 0, background: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              p: 0,
              margin: 0,
            }}>
            <Typography fontWeight={600}>Chỉ định</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {!loadingChiDinh && dataChiDinh && dataChiDinh.length > 0 && (
              <PdfGallery
                files={dataChiDinh
                  .filter((i: IPatientChiDinh) => !!i.FilePdfKySo)
                  .map((i: IPatientChiDinh) => ({
                    filename: i.TenLoaiPhieuY,
                    base64: i.FilePdfKySo,
                  }))}
              />
            )}
            {!loadingChiDinh && dataChiDinh && dataChiDinh.length === 0 && (
              <Typography>Không có chỉ định</Typography>
            )}
            {loadingChiDinh && (
              <Box className="flex flex-row gap-2">
                <Spinner />
                <Typography>Đang tải dữ liệu...</Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}
      {dataToaThuoc && (
        <Accordion sx={{ p: 0, mb: 1, boxShadow: 0, background: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              p: 0,
              margin: 0,
            }}>
            <Typography fontWeight={600}>Toa thuốc</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              p: 0,
              margin: 0,
            }}>
            {!loadingToaThuoc && dataToaThuoc && dataToaThuoc.length > 0 && (
              <PdfGallery
                files={dataToaThuoc
                  .filter((i: IPatientToaThuoc) => !!i.FilePdfKySo)
                  .map((i: IPatientToaThuoc) => ({
                    filename: i.TenLoaiPhieuY,
                    base64: i.FilePdfKySo,
                  }))}
              />
            )}
            {!loadingToaThuoc && dataToaThuoc && dataToaThuoc.length === 0 && (
              <Typography>Không có toa thuốc</Typography>
            )}
            {loadingToaThuoc && (
              <Box className="flex flex-row gap-2">
                <Spinner />
                <Typography>Đang tải dữ liệu...</Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}
      {dataBangKe && (
        <Accordion sx={{ mb: 1, boxShadow: 0, background: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              p: 0,
              margin: 0,
            }}>
            <Typography fontWeight={600}>Bảng kê</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              p: 0,
              margin: 0,
            }}>
            {!loadingBangKe && dataBangKe && dataBangKe.length > 0 && (
              <PdfGallery
                files={dataBangKe
                  .filter((i: IPatientBangKe) => !!i.FilePdfKySo)
                  .map((i: IPatientBangKe) => ({
                    filename: i.TenLoaiPhieuY,
                    base64: i.FilePdfKySo,
                  }))}
              />
            )}
            {!loadingBangKe && dataBangKe && dataBangKe.length === 0 && (
              <Typography>Không có Bảng kê</Typography>
            )}
            {loadingBangKe && (
              <Box className="flex flex-row gap-2">
                <Spinner />
                <Typography>Đang tải dữ liệu...</Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </AccordionDetails>
  );
}

export default React.memo(ItemDetail);
