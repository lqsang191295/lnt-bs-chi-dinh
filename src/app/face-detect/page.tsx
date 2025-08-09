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
import * as faceapi from "face-api.js";
import { useUserStore } from "@/store/user";
import { getClaimsFromToken } from "@/utils/auth"; // Assuming you have a utility function to decode JWT  
import {luuanhnguoidung} from "@/actions/emr_tnguoidung"; 

const CameraComponent =({
      onCapture,
      capturedImage,
    }: {
      onCapture: (img: string) => void;
      capturedImage: string | null;
    })=> {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      setLoading(false);
    };
    loadModels();
  }, []);

  // Get camera stream
  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert("Không thể truy cập camera");
      }
    };
    getCamera();
  }, []);

  // Vẽ khung nhận diện khuôn mặt liên tục
  useEffect(() => {
    let animationId: number;
    const drawFaceBox = async () => {
      if (
        videoRef.current &&
        canvasRef.current &&
        !videoRef.current.paused &&
        !videoRef.current.ended
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        // Đảm bảo canvas cùng kích thước video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        if (detections && detections.length > 0) {
          detections.forEach(det => {
            const { x, y, width, height } = det.box;
            ctx!.strokeStyle = "#1976d2";
            ctx!.lineWidth = 3;
            ctx!.strokeRect(x, y, width, height);
          });
        }
      }
      animationId = requestAnimationFrame(drawFaceBox);
    };
    if (!loading) drawFaceBox();
    return () => cancelAnimationFrame(animationId);
  }, [loading]);
  
  // Chụp hình và nhận diện khuôn mặt
  const handleCapture = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL("image/jpeg");

    // Nhận diện khuôn mặt
    const detections = await faceapi.detectAllFaces(
      canvas,
      new faceapi.TinyFaceDetectorOptions()
    );
    if (detections.length === 0) {
      alert("Không phát hiện khuôn mặt!");
      return;
    }

    // Gửi imgData lên backend để so sánh với CSDL nhân viên
    onCapture(imgData);
  };

  return (
    <Box sx={{ position: "relative", width: 500, maxWidth: "100%" }}>
      <video
        ref={videoRef}
        autoPlay
        style={{ width: "100%", maxWidth: 500, borderRadius: 8 }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleCapture}
        disabled={loading}
      >
        {loading ? "Đang tải mô hình..." : "Chụp & Nhận diện"}
      </Button>
    </Box>
  );
};

export default function HSBAMoPage() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [ctaikhoan, setCtaikhoan] = useState("");
  const [choten, setChoten] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [serverImage, setServerImage] = useState<string | null>(null);
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

    // Hàm gửi ảnh lên backend để kiểm tra nhân viên
  const handleFaceCapture = async (imgBase64: string) => {
    setCapturedImage(imgBase64); // Hiển thị ảnh vừa chụp
    // Gửi imgBase64 lên API backend, backend sẽ trả về thông tin nhân viên nếu trùng khuôn mặt
    console.log("Gửi ảnh lên API để nhận diện nhân viên...");
    const res = await fetch("/api/staff-detect-ol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imgBase64 }),
    });
    const data = await res.json();
    console.log("Kết quả nhận diện:", data);
    if (data.found) {
      alert("Nhận diện thành công: " + data.nhanvien.ctaikhoan + " - " + data.nhanvien.choten);
    } else {
      alert("Không phải nhân viên trong hệ thống!");
    }
  };  
  // Hàm gửi ảnh lên server
  const handleSendCapture = async (imgBase64: string) => {
    if (!loginedUser) {
      alert("Chưa đăng nhập!");
      return;
    }
    if (!ctaikhoan.trim() || !choten.trim()) {
      alert("Vui lòng nhập đầy đủ tài khoản và họ tên!");
      return;
    }
    if (!capturedImage) {
      alert("Chưa có ảnh để lưu!");
      return;
    }
    // Gọi API để lưu ảnh người dùng
    console.log("Đang gửi ảnh lên server..."); 
    //console.log("Gửi ảnh lên server:", imgBase64);
    const result = await luuanhnguoidung(loginedUser.ctaikhoan, "1", 0, ctaikhoan, choten, imgBase64);
    console.log("Kết quả lưu ảnh:", result);
    const arr = result as Array<{ _ID: number}>;

    if (typeof arr === "string" && arr === "Authorization has been denied for this request.") {
      alert("Bạn không có quyền thêm ảnh người dùng!");
    } else if (
      Array.isArray(arr) &&
      arr.length > 0 &&
      typeof arr[0]._ID !== "undefined"
    ) {
      alert("Thêm ảnh người dùng thành công");
    } else {
      alert("Thêm ảnh người dùng thất bại");
    }
   
     
  };
  
  // Hàm load ảnh từ server
  const handleLoadImage = async () => {
    if (!ctaikhoan.trim()) {
      alert("Vui lòng nhập tài khoản!");
      return;
    }
    const result = await luuanhnguoidung(loginedUser.ctaikhoan, "2", 0, ctaikhoan, "", "");

    const arr = result as Array<{ cid: number, ctaikhoan: string, choten: string, cimg: string, cngaytao: string }>;

    if (typeof arr === "string" && arr === "Authorization has been denied for this request.") {
      alert("Bạn không có quyền tải ảnh người dùng!");
    } else if (
      Array.isArray(arr) &&
      arr.length > 0  
    ) {
      setServerImage(arr[0].cimg);
    } else {
      setServerImage(null);
      alert("Không tìm thấy ảnh trên server!");
    }
    
  };

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: "normal", letterSpacing: 1 }}>
       Nhận diện Khuôn mặt Nhân viên
      </Typography>
      <Box display="flex" gap={2} mb={2}>
      <TextField
        label="Tài khoản"
        value={ctaikhoan}
        onChange={(e) => setCtaikhoan(e.target.value)}
        size="small"
        required
      />
      <TextField
        label="Họ tên"
        value={choten}
        onChange={(e) => setChoten(e.target.value)}
        size="small"
        required
      />
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleLoadImage}
      >
        Load ảnh từ server
      </Button>
    </Box>
      <Box display="flex" gap={3} mt={3}>

      <CameraComponent onCapture={handleFaceCapture} capturedImage={capturedImage} />
      
        {/* Ảnh vừa chụp */}
        {capturedImage && (
          <Box
            p={2}
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "#fafbfc",
              minWidth: 320,
            }}
          >
            <Typography fontSize={14} mb={1} fontWeight="bold">
              Ảnh vừa chụp
            </Typography>
            <img
              src={capturedImage}
              alt="Ảnh chụp"
              style={{ maxWidth: 300, borderRadius: 4, border: "1px solid #eee" }}
            />
            <Box mt={2} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (capturedImage) {
                    handleSendCapture(capturedImage);
                  }
                }}
              >
                Lưu ảnh
              </Button>
            </Box>
          </Box>
        )}

        {/* Box trống nếu chưa có ảnh để giữ layout */}
        {!capturedImage && (
          <Box
            p={2}
            sx={{
              minWidth: 320,
              minHeight: 220,
              border: "1px dashed #ccc",
              borderRadius: 2,
              background: "#fafbfc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#bbb",
            }}
          >
            Chưa có ảnh chụp
          </Box>
        )}

        {/* Ảnh từ server */}
        {serverImage ? (
          <Box
            p={2}
            sx={{
              border: "1px solid #1976d2",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "#f0f7ff",
              minWidth: 320,
            }}
          >
            <Typography fontSize={14} mb={1} fontWeight="bold" color="#1976d2">
              Ảnh từ server
            </Typography>
            <img
              src={serverImage}
              alt="Ảnh từ server"
              style={{ maxWidth: 300, borderRadius: 4, border: "1px solid #eee" }}
            />
          </Box>
        ) : (
          <Box
            p={2}
            sx={{
              minWidth: 320,
              minHeight: 220,
              border: "1px dashed #1976d2",
              borderRadius: 2,
              background: "#f0f7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#90caf9",
            }}
          >
            Chưa có ảnh server
          </Box>
        )}

        {/* Box trống thứ 3 để giữ layout 3 box nếu cần */}
        <Box
          p={2}
          sx={{
            minWidth: 320,
            minHeight: 220,
            border: "1px dashed #eee",
            borderRadius: 2,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#bbb",
          }}
        >
          Box thứ 3 (tùy ý)
        </Box>
      </Box>
    </Box>
  );
}
