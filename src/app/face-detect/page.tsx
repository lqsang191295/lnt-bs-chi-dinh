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

const CameraComponent = ({
  onCapture,
  capturedImage,
}: {
  onCapture: (img: string) => void;
  capturedImage: string | null;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        console.log("Loading face-api models...");
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models")
        ]);
        
        console.log("Models loaded successfully");
        setModelsLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error("Error loading models:", error);
        setLoading(false);
      }
    };
    loadModels();
  }, []);

  // Get camera stream
  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Đợi video sẵn sàng
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Không thể truy cập camera");
      }
    };
    getCamera();

    // Cleanup camera stream khi component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

// Vẽ khung nhận diện khuôn mặt liên tục
// useEffect(() => {
//   let animationId: number;
//   let isRunning = false;

//   const drawFaceBox = async () => {
//     if (isRunning) return;
//     isRunning = true;

//     try {
//       if (
//         videoRef.current &&
//         canvasRef.current &&
//         modelsLoaded &&
//         videoRef.current.readyState >= 2 &&
//         !videoRef.current.paused &&
//         !videoRef.current.ended &&
//         videoRef.current.videoWidth > 0 &&
//         videoRef.current.videoHeight > 0
//       ) {
//         const video = videoRef.current;
//         const canvas = canvasRef.current;
        
//         // Debug: Log video dimensions
//         console.log("Video dimensions:", {
//           clientWidth: video.clientWidth,
//           clientHeight: video.clientHeight,
//           videoWidth: video.videoWidth,
//           videoHeight: video.videoHeight
//         });
        
//         // Đặt kích thước canvas khớp với video display size
//         const displayWidth = video.clientWidth;
//         const displayHeight = video.clientHeight;
//         const videoWidth = video.videoWidth;
//         const videoHeight = video.videoHeight;
        
//         canvas.width = displayWidth;
//         canvas.height = displayHeight;
        
//         // Tính tỷ lệ scale
//         const scaleX = displayWidth / videoWidth;
//         const scaleY = displayHeight / videoHeight;
        
//         console.log("Scale factors:", { scaleX, scaleY });

//         try {
//           // Phát hiện khuôn mặt
//           console.log("Detecting faces...");
//           const detections = await faceapi.detectAllFaces(
//             video,
//             new faceapi.TinyFaceDetectorOptions({
//               inputSize: 416,
//               scoreThreshold: 0.3 // Giảm threshold để dễ detect hơn
//             })
//           );
          
//           console.log("Detection results:", detections.length, "faces found");

//           const ctx = canvas.getContext("2d");
//           if (ctx) {
//             // Xóa canvas
//             ctx.clearRect(0, 0, canvas.width, canvas.height);

//             // Vẽ background semi-transparent để debug
//             ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
//             ctx.fillRect(0, 0, canvas.width, canvas.height);

//             if (detections && detections.length > 0) {
//               console.log("Drawing", detections.length, "bounding boxes");
              
//               detections.forEach((detection, index) => {
//                 const box = detection.box;
//                 console.log(`Face ${index + 1} box:`, box);
                
//                 // Scale coordinates
//                 const x = box.x * scaleX;
//                 const y = box.y * scaleY;
//                 const width = box.width * scaleX;
//                 const height = box.height * scaleY;
                
//                 console.log(`Scaled coordinates:`, { x, y, width, height });
                
//                 // Vẽ khung chữ nhật với màu nổi bật
//                 ctx.strokeStyle = "#00ff00";
//                 ctx.lineWidth = 4;
//                 ctx.strokeRect(x, y, width, height);
                
//                 // Vẽ background cho text
//                 ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
//                 ctx.fillRect(x, y - 25, 120, 25);
                
//                 // Vẽ text
//                 const confidence = Math.round(detection.score * 100);
//                 ctx.fillStyle = "#000000";
//                 ctx.font = "14px Arial";
//                 ctx.fillText(
//                   `Face ${index + 1}: ${confidence}%`,
//                   x + 2,
//                   y - 8
//                 );
                
//                 // Vẽ điểm giữa
//                 const centerX = x + width / 2;
//                 const centerY = y + height / 2;
//                 ctx.fillStyle = "#ff0000";
//                 ctx.beginPath();
//                 ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
//                 ctx.fill();
                
//                 console.log(`Drew bounding box for face ${index + 1}`);
//               });
//             } else {
//               // Vẽ text "No faces detected"
//               ctx.fillStyle = "#ff0000";
//               ctx.font = "16px Arial";
//               ctx.fillText("No faces detected", 10, 30);
//             }
//           }
//         } catch (detectionError) {
//           console.error("Face detection error:", detectionError);
//         }
//       } else {
//         console.log("Conditions not met for detection:", {
//           hasVideo: !!videoRef.current,
//           hasCanvas: !!canvasRef.current,
//           modelsLoaded,
//           readyState: videoRef.current?.readyState,
//           paused: videoRef.current?.paused,
//           ended: videoRef.current?.ended,
//           videoWidth: videoRef.current?.videoWidth,
//           videoHeight: videoRef.current?.videoHeight
//         });
//       }
//     } catch (error) {
//       console.error("Error in drawFaceBox:", error);
//     } finally {
//       isRunning = false;
//       // Tiếp tục animation loop
//       animationId = requestAnimationFrame(drawFaceBox);
//     }
//   };

//   // Bắt đầu detection loop
//   if (modelsLoaded && !loading) {
//     console.log("Starting face detection loop");
//     drawFaceBox();
//   }

//   return () => {
//     if (animationId) {
//       cancelAnimationFrame(animationId);
//     }
//   };
// }, [modelsLoaded, loading]);

useEffect(() => {
  let intervalId: NodeJS.Timeout;

  const detectFaces = async () => {
    if (
      videoRef.current &&
      canvasRef.current &&
      modelsLoaded &&
      videoRef.current.readyState >= 2
    ) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) return;

        // Set canvas size
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        // Detect faces
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.3
          })
        );

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw detections
        if (detections.length > 0) {
          const scaleX = canvas.width / video.videoWidth;
          const scaleY = canvas.height / video.videoHeight;

          detections.forEach((detection, i) => {
            const { x, y, width, height } = detection.box;
            
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(
              x * scaleX,
              y * scaleY,
              width * scaleX,
              height * scaleY
            );
            
            ctx.fillStyle = '#00ff00';
            ctx.font = '16px Arial';
            ctx.fillText(
              `Face ${i + 1}`,
              x * scaleX,
              y * scaleY - 5
            );
          });
          
          //console.log(`Detected ${detections.length} faces`);
        }
      } catch (error) {
        //console.error("Detection error:", error);
      }
    }
  };

  if (modelsLoaded && !loading) {
    // Sử dụng setInterval thay vì requestAnimationFrame
    intervalId = setInterval(detectFaces, 100); // 10 FPS
  }

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [modelsLoaded, loading]);

  // Chụp hình và nhận diện khuôn mặt
  const handleCapture = async () => {
    if (!videoRef.current || !modelsLoaded) {
      alert("Camera hoặc models chưa sẵn sàng!");
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        alert("Không thể tạo canvas context!");
        return;
      }

      // Vẽ video frame lên canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL("image/jpeg", 0.9);

      // Kiểm tra phát hiện khuôn mặt trước khi chụp
      const detections = await faceapi.detectAllFaces(
        canvas,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        })
      );

      if (detections.length === 0) {
        alert("Không phát hiện khuôn mặt trong ảnh! Vui lòng thử lại.");
        return;
      }

      console.log(`Captured image with ${detections.length} face(s) detected`);
      
      // Gửi imgData lên backend để so sánh với CSDL nhân viên
      onCapture(imgData);
    } catch (error) {
      console.error("Error capturing image:", error);
      if (error instanceof Error) {
        alert("Lỗi khi chụp ảnh: " + error.message);
      } else {
        alert("Lỗi khi chụp ảnh: " + String(error));
      }
    }
  };

  return (
    <Box sx={{ position: "relative", width: 500, maxWidth: "100%" }}>
      <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ 
            width: "100%", 
            maxWidth: 500, 
            borderRadius: 8,
            display: "block"
          }}
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
            borderRadius: 8
          }}
        />
      </Box>
      
      {/* Status indicators */}
      <Box sx={{ mt: 1, mb: 2 }}>
        <Typography variant="caption" color={modelsLoaded ? "success.main" : "warning.main"}>
          {loading ? "🔄 Đang tải models..." : modelsLoaded ? "✅ Models sẵn sàng" : "❌ Lỗi tải models"}
        </Typography>
      </Box>

      <Button
        variant="contained"
        sx={{ mt: 1 }}
        onClick={handleCapture}
        disabled={loading || !modelsLoaded}
        fullWidth
      >
        {loading ? "Đang tải mô hình..." : "📸 Chụp & Nhận diện"}
      </Button>
    </Box>
  );
};

export default function staffdetectPage() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [ctaikhoan, setCtaikhoan] = useState("");
  const [choten, setChoten] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [serverImage, setServerImage] = useState<string | null>(null);
  const { data: loginedUser, setUserData} = useUserStore();  
  const [token, setToken] = useState<string | null>(null);
  const [recognitionTime, setRecognitionTime] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
   useEffect(() => {
        // if (!loginedUser || !loginedUser.ctaikhoan) {
        //   router.push("/login"); // <-- Chuyển hướng nếu chưa đăng nhập
        //   return;
        // } 
      const getTokenFromClient = () => {
      // Cách 1: Từ localStorage nếu bạn lưu token ở đó
      const storedToken = localStorage.getItem("authToken");
      
      // Cách 2: Từ document.cookie
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];
      
      return storedToken || cookieToken || null;
    };

    const clientToken = getTokenFromClient();
    setToken(clientToken);
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
    const startTime = Date.now();
    const startDate = new Date(startTime);
    
    setIsRecognizing(true);
    setRecognitionTime(null);
    
    console.log("=== BẮT ĐẦU NHẬN DIỆN KHUÔN MẶT ===");
    console.log("Thời gian bắt đầu:", startDate.toLocaleString());
    console.log("Timestamp bắt đầu:", startTime);
    
    setCapturedImage(imgBase64);
    
    try {
      console.log("🔄 Đang gửi ảnh lên API để nhận diện nhân viên...");
      
      const apiStartTime = Date.now();
      console.log("Thời gian gọi API:", new Date(apiStartTime).toLocaleString());
      
      const res = await fetch("/api/staff-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, image: imgBase64 }),
      });
      
      const apiEndTime = Date.now();
      const apiDuration = apiEndTime - apiStartTime;
      console.log("⏱️ Thời gian API response:", new Date(apiEndTime).toLocaleString());
      console.log("⚡ Thời gian xử lý API:", apiDuration + "ms");
      
      const data = await res.json();
      console.log("📋 Kết quả nhận diện:", data);
      
      if (data.found) {
        setServerImage(data.nhanvien.cimg);
        setCtaikhoan(data.nhanvien.ctaikhoan);
        setChoten(data.nhanvien.choten);
        console.log("✅ Nhận diện thành công:", data.nhanvien.ctaikhoan + " - " + data.nhanvien.choten);
        
        if (data.confidence) {
          console.log("🎯 Độ tin cậy:", data.confidence + "%");
        }
      } else {
        setChoten("Không tìm thấy nhân viên trùng khớp");     
        setServerImage(null);
        console.log("❌ Không tìm thấy nhân viên trùng khớp");
      }
      
    } catch (error) {
      console.error("🚨 Lỗi trong quá trình nhận diện:", error);
      setChoten("Lỗi khi nhận diện: " + error.message);     
      setServerImage(null);
    } finally {
      const endTime = Date.now();
      const endDate = new Date(endTime);
      const totalDuration = endTime - startTime;
      
      setIsRecognizing(false);
      setRecognitionTime(`${(totalDuration / 1000).toFixed(2)}s`);
      
      console.log("=== KẾT THÚC NHẬN DIỆN KHUÔN MẶT ===");
      console.log("Thời gian kết thúc:", endDate.toLocaleString());
      console.log("Timestamp kết thúc:", endTime);
      console.log("⏰ TỔNG THỜI GIAN NHẬN DIỆN:", totalDuration + "ms");
      console.log("⏰ TỔNG THỜI GIAN NHẬN DIỆN:", (totalDuration / 1000).toFixed(2) + " giây");
      
      if (totalDuration < 1000) {
        console.log("🚀 Hiệu suất: Rất nhanh");
      } else if (totalDuration < 3000) {
        console.log("⚡ Hiệu suất: Nhanh");
      } else if (totalDuration < 5000) {
        console.log("⏳ Hiệu suất: Trung bình");
      } else {
        console.log("🐌 Hiệu suất: Chậm");
      }
      
      console.log("================================================");
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
    console.log("Đang gửi ảnh lên server..." + Date.now()); 
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
      setCtaikhoan(arr[0].ctaikhoan);
      setChoten(arr[0].choten);
    } else {
      setServerImage(null);
      setChoten("");
      alert("Không tìm thấy ảnh trên server!");
    }
    
  };

  return (
   <Box p={2} 
    sx={{ 
      minHeight: "100vh", // Đảm bảo chiều cao đủ
      overflow: "auto", // Cho phép scroll nếu cần
      pb: 4 // Padding bottom thêm
    }}>
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
    
    {/* Camera Component */}
    <Box mb={3}>
      <CameraComponent onCapture={handleFaceCapture} capturedImage={capturedImage} />
    </Box>
    
    {/* Hiển thị trạng thái nhận diện */}
    {isRecognizing && (
      <Box sx={{ mb: 2, p: 1, backgroundColor: "#fff3cd", borderRadius: 1 }}>
        <Typography color="warning.main">
          🔄 Đang nhận diện... Vui lòng chờ
        </Typography>
      </Box>
    )}
    
    {recognitionTime && (
      <Box sx={{ mb: 2, p: 1, backgroundColor: "#d1ecf1", borderRadius: 1 }}>
        <Typography color="info.main">
          ⏱️ Thời gian nhận diện: {recognitionTime}
        </Typography>
      </Box>
    )}
    
    {/* Container cho ảnh - sử dụng layout responsive */}
    <Box 
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // Vertical trên mobile, horizontal trên desktop
        gap: 3,
        mt: 3,
        flexWrap: "wrap", // Cho phép wrap xuống dòng nếu cần
        justifyContent: "flex-start",
        alignItems: "flex-start" // Align top để không bị stretch
      }}
    >
      {/* Ảnh vừa chụp */}
      {capturedImage ? (
        <Box
          sx={{
            p: 2,
            border: "1px solid #ccc",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#fafbfc",
            minWidth: { xs: "100%", sm: 320 }, // Full width trên mobile
            maxWidth: { xs: "100%", sm: 400 }, // Giới hạn width
            flex: { md: "1" }, // Flexible trên desktop
          }}
        >
          <Typography fontSize={14} mb={1} fontWeight="bold" color="#071b30ff">
            Ảnh vừa chụp
          </Typography>
          <Box
            sx={{
              width: "100%",
              maxWidth: 300,
              overflow: "hidden",
              borderRadius: 1,
              border: "1px solid #eee"
            }}
          >
            <img
              src={capturedImage}
              alt="Ảnh chụp"
              style={{ 
                width: "100%", 
                height: "auto", 
                display: "block",
                objectFit: "contain" // Giữ tỷ lệ ảnh
              }}
            />
          </Box>
          <Box mt={2} textAlign="center" sx={{ width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
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
      ) : (
        <Box
          sx={{
            p: 2,
            minWidth: { xs: "100%", sm: 320 },
            minHeight: 280,
            border: "1px dashed #ccc",
            borderRadius: 2,
            background: "#fafbfc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#bbb",
            flex: { md: "1" },
          }}
        >
          <Typography variant="body2" textAlign="center">
            Chưa có ảnh chụp
          </Typography>
        </Box>
      )}

      {/* Ảnh từ server */}
      {serverImage ? (
        <Box
          sx={{
            p: 2,
            border: "1px solid #1976d2",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#f0f7ff",
            minWidth: { xs: "100%", sm: 320 },
            maxWidth: { xs: "100%", sm: 400 },
            flex: { md: "1" },
          }}
        >
          <Typography fontSize={14} mb={1} fontWeight="bold" color="#071b30ff" textAlign="center">
            Nhân viên: {ctaikhoan} - {choten}
          </Typography>
          <Box
            sx={{
              width: "100%",
              maxWidth: 300,
              overflow: "hidden",
              borderRadius: 1,
              border: "1px solid #eee"
            }}
          >
            <img
              src={serverImage}
              alt="Ảnh từ server"
              style={{ 
                width: "100%", 
                height: "auto", 
                display: "block",
                objectFit: "contain"
              }}
            />
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            p: 2,
            minWidth: { xs: "100%", sm: 320 },
            minHeight: 280,
            border: "1px dashed #1976d2",
            borderRadius: 2,
            background: "#f0f7ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#90caf9",
            flex: { md: "1" },
          }}
        >
          <Typography variant="body2" textAlign="center">
            Không phát hiện ảnh
          </Typography>
        </Box>
      )}
    </Box>
    
    {/* Spacer để đảm bảo có khoảng trống phía dưới */}
    <Box sx={{ height: 50 }} />
  </Box>
  );
}
