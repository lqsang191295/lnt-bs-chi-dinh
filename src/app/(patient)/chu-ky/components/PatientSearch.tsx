"use client";

import { searchPartient } from "@/actions/act_patient";
import { IPatientInfo } from "@/model/tpatient";
import {
  Box,
  CircularProgress,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function PatientSearch({
  patientInfo,
  setPatientInfo,
}: {
  patientInfo: IPatientInfo | null;
  setPatientInfo: (info: IPatientInfo | null) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<IPatientInfo[]>([]);
  const [open, setOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔎 Search nội bộ (thay bằng API thật sau)
  const searchPatient = async (
    text: string
  ): Promise<IPatientInfo[] | null> => {
    // Thêm cache vào đây
    await new Promise((r) => setTimeout(r, 800)); // fake API delay

    return await searchPartient(text);
  };

  useEffect(() => {
    // ⛔ Đã chọn bệnh nhân → không search
    if (patientInfo) return;

    if (!keyword.trim()) {
      setItems([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    // reset debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        const result = await searchPatient(keyword.trim());
        if (result && result.length > 0) {
          setItems(result);
        }
      } finally {
        setLoading(false);
      }
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [keyword, patientInfo]);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative", width: 320 }}>
        <TextField
          size="small"
          label="Tìm kiếm bệnh nhân..."
          fullWidth
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPatientInfo(null); // 👈 gõ lại → clear bệnh nhân đã chọn
          }}
        />

        {/* loading */}
        {loading && (
          <Box
            sx={{
              position: "absolute",
              right: 10,
              top: 10,
            }}>
            <CircularProgress size={18} />
          </Box>
        )}

        {/* dropdown list */}
        {open && items.length > 0 && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 10,
              maxHeight: 240,
              overflow: "auto",
            }}>
            <List dense>
              {items.map((item) => (
                <ListItemButton
                  key={item.Ma}
                  onClick={() => {
                    setKeyword(`${item.Hoten} (${item.Ma})`);
                    setPatientInfo(item); // ✅ đánh dấu đã chọn
                    setItems([]);
                    setLoading(false);
                    setOpen(false);
                  }}>
                  <ListItemText
                    primary={item.Hoten}
                    secondary={`Mã BN: ${item.Ma}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}

        {/* no result */}
        {!loading && keyword && open && items.length === 0 && (
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              p: 1.5,
              zIndex: 10,
            }}>
            <Typography variant="body2" color="text.secondary">
              Không tìm thấy bệnh nhân
            </Typography>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
