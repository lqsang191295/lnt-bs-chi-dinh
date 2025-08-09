"use client";

import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {useRef, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"; 
import { useUserStore } from "@/store/user";
import { getClaimsFromToken } from "@/utils/auth"; // Assuming you have a utility function to decode JWT   

export default function HSBAMoPage() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const { data: loginedUser, setUserData} = useUserStore();  
   useEffect(() => {
        // if (!loginedUser || !loginedUser.ctaikhoan) {
        //   router.push("/login"); // <-- Chuyển hướng nếu chưa đăng nhập
        //   return;
        // } 
        const claims = getClaimsFromToken();
        if (claims) {
          setUserData(claims);
          // Log or handle the claims as needed 
          //console.log("User claims:", claims);
          // You can set user claims in a global state or context if needed
        } else {
          console.warn("No valid claims found in token");
        }  
      }, []);
      
  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: "normal", letterSpacing: 1 }}>
         BỆNH ÁN ĐIỆN TỬ
      </Typography> 

    </Box>
  );
}
