"use client";

import { luuanhnguoidung } from "@/actions/act_tnguoidung";
import { useUserStore } from "@/store/user";
import { getClaimsFromToken } from "@/utils/auth";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CryptoJS from "crypto-js";
import * as faceapi from "face-api.js";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// Interface cho camera IP
interface IPCameraConfig {
  url: string;
  username: string;
  password: string;
  name: string;
}

const CameraComponent = ({
  onCapture,
}: {
  onCapture: (img: string) => void;
  capturedImage: string | null;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraSource, setCameraSource] = useState<"local" | "ip">("local");
  const [showIPCameraDialog, setShowIPCameraDialog] = useState(false);
  const [ipCameraConfig, setIpCameraConfig] = useState<IPCameraConfig>({
    url: "http://172.16.1.186",
    username: "admin",
    password: "admin123",
    name: "Camera IP 186",
  });
  const [ipCameraError, setIpCameraError] = useState<string | null>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        console.log("Loading face-api models...");

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
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

  // Get local camera stream
  const getLocalCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Local camera metadata loaded");
        };
      }
      setIpCameraError(null);
    } catch (err) {
      console.error("Local camera error:", err);
      alert("Không thể truy cập camera local");
    }
  };

  // // Get IP camera stream
  // const getIPCamera = async (config: IPCameraConfig) => {
  //   try {
  //     setIpCameraError(null);
  //     console.log("Connecting to IP camera:", config.url);

  //     // Tạo URL stream với authentication
  //     const streamUrl = `${config.url}/doc/page/main.html`;

  //     // Sử dụng fetch để test connection trước
  //     const response = await fetch(streamUrl, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Basic ${btoa(
  //           `${config.username}:${config.password}`
  //         )}`,
  //         "Content-Type": "text/html",
  //       },
  //       mode: "cors",
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     // Nếu connection OK, tạo video stream
  //     if (videoRef.current) {
  //       // Stop local camera nếu đang chạy
  //       const currentStream = videoRef.current.srcObject as MediaStream;
  //       if (currentStream) {
  //         currentStream.getTracks().forEach((track) => track.stop());
  //       }

  //       // Tạo video element mới với IP camera stream
  //       // Lưu ý: Nhiều camera IP cần RTSP hoặc WebRTC, không phải HTTP trực tiếp
  //       // Đây là cách tiếp cận cho camera hỗ trợ HTTP stream
  //       const videoElement = videoRef.current;
  //       videoElement.src = `${config.url}/video_stream`; // URL stream thực tế
  //       videoElement.crossOrigin = "anonymous";

  //       // Alternative: Sử dụng iframe hoặc img cho MJPEG stream
  //       const img = new window.Image();
  //       img.crossOrigin = "anonymous";
  //       img.src = `${config.url}/video.cgi?user=${config.username}&pwd=${config.password}`;

  //       img.onload = () => {
  //         console.log("IP camera stream connected");
  //         // Update video source với image stream
  //         if (videoRef.current) {
  //           const canvas = document.createElement("canvas");
  //           const ctx = canvas.getContext("2d");
  //           canvas.width = img.width;
  //           canvas.height = img.height;
  //           ctx?.drawImage(img, 0, 0);

  //           // Convert to video stream (simplified approach)
  //           videoRef.current.srcObject = canvas.captureStream(30); // 30 FPS
  //         }
  //       };

  //       img.onerror = (error) => {
  //         console.error("IP camera connection error:", error);
  //         setIpCameraError(
  //           "Không thể kết nối đến camera IP. Kiểm tra URL, username, password."
  //         );
  //       };
  //     }
  //   } catch (error) {
  //     console.error("IP camera error:", error);
  //     setIpCameraError(
  //       `Lỗi kết nối camera IP: ${
  //         error instanceof Error ? error.message : "Unknown error"
  //       }`
  //     );
  //   }
  // };

  // Enhanced IP camera connection với WebRTC hoặc MJPEG

  // Helper function để thực hiện đăng nhập camera IP theo đúng quy trình
  const performCameraLogin = useCallback(
    async (
      config: IPCameraConfig
    ): Promise<{ success: boolean; sessionID?: string; error?: string }> => {
      try {
        console.log("1-Starting camera login process...");

        // Step 1: Get session login (lấy salt và sessionID) với better error handling
        const sessionUrl = `${
          config.url
        }/CGI/Security/sessionLogin?timestamp=${new Date().getTime()}`;
        console.log("2-Session login URL:", sessionUrl);

        let sessionResponse;
        try {
          sessionResponse = await fetch(sessionUrl, {
            method: "GET",
            headers: {
              "If-Modified-Since": "0",
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            mode: "cors",
            cache: "no-cache", // Tránh cache issues
            // Thêm timeout để tránh hang
            signal: AbortSignal.timeout(10000), // 10 seconds timeout
          });
        } catch (fetchError) {
          console.error("Fetch error:", fetchError);

          // Kiểm tra nếu là lỗi headers
          if (
            fetchError instanceof Error &&
            fetchError.message.includes("ERR_RESPONSE_HEADERS")
          ) {
            console.log(
              "3-Header error detected, trying alternative approach..."
            );

            // Alternative 1: Thử với XMLHttpRequest thay vì fetch
            try {
              const sessionData = await tryWithXHR(sessionUrl);
              if (sessionData) {
                return await continueLoginProcess(config, sessionData);
              }
            } catch (xhrError) {
              console.error("XHR also failed:", xhrError);
            }

            // Alternative 2: Thử bypass headers issue
            try {
              const bypassResponse = await fetch(sessionUrl + "&bypass=1", {
                method: "GET",
                headers: {
                  Accept: "application/json, text/plain, */*",
                },
                mode: "no-cors", // Thử no-cors mode
              });

              if (bypassResponse.type === "opaque") {
                console.log(
                  "Received opaque response, cannot read data directly"
                );
                setIpCameraError(
                  "Camera kết nối nhưng không thể đọc dữ liệu do CORS policy. Cần cấu hình CORS trên camera."
                );
                return { success: false, error: "CORS policy issue" };
              }
            } catch (bypassError) {
              console.error("Bypass attempt failed:", bypassError);
            }
          }

          return {
            success: false,
            error: `Lỗi kết nối: ${
              fetchError instanceof Error ? fetchError.message : "Network error"
            }`,
          };
        }

        console.log("3-Session login response status:", sessionResponse.status);

        if (!sessionResponse.ok) {
          throw new Error(
            `Session login failed: HTTP ${sessionResponse.status}`
          );
        }

        let sessionData;
        try {
          const responseText = await sessionResponse.text();
          console.log("4-Raw response text:", responseText);

          // Thử parse JSON
          sessionData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          return {
            success: false,
            error: "Camera response không đúng định dạng JSON",
          };
        }

        return await continueLoginProcess(config, sessionData);
      } catch (error) {
        console.error("Camera login error:", error);
        return {
          success: false,
          error: `Lỗi đăng nhập: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Helper function để thử với XMLHttpRequest
  const tryWithXHR = (url: string): Promise<Record<string, unknown>> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.setRequestHeader("If-Modified-Since", "0");
      xhr.setRequestHeader("Cache-Control", "no-cache");
      xhr.timeout = 10000; // 10 seconds

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log("XHR success:", data);
              resolve(data);
            } catch (parseError) {
              console.error("XHR JSON parse error:", parseError);
              reject(parseError);
            }
          } else {
            console.error("XHR failed with status:", xhr.status);
            reject(new Error(`XHR failed: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        console.error("XHR network error");
        reject(new Error("XHR network error"));
      };

      xhr.ontimeout = () => {
        console.error("XHR timeout");
        reject(new Error("XHR timeout"));
      };

      xhr.send();
    });
  };

  // Helper function để tiếp tục quy trình login
  const continueLoginProcess = async (
    config: IPCameraConfig,
    sessionData: Record<string, unknown>
  ): Promise<{ success: boolean; sessionID?: string; error?: string }> => {
    console.log("4-Session login response:", sessionData);

    if (sessionData.statusValue !== "200") {
      throw new Error(`Session login error: ${sessionData.statusValue}`);
    }

    // Step 2: Hash password và thực hiện userCheck
    const password = config.password;
    const hashedPassword = await hashPassword(password); // MD5 hash
    const finalPassword = await hashPassword(hashedPassword + sessionData.salt); // MD5(MD5(password) + salt)

    const loginData = {
      Username: config.username,
      Password: finalPassword,
      Sessionid: sessionData.sessionID,
    };

    console.log("5-Sending user check with data:", {
      ...loginData,
      Password: "***hidden***",
    });

    const userCheckUrl = `${config.url}/CGI/Security/SelfExt/userCheck`;

    // Thử userCheck với cùng error handling
    let userCheckResponse;
    try {
      userCheckResponse = await fetch(userCheckUrl, {
        method: "POST",
        headers: {
          "If-Modified-Since": "0",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(loginData),
        mode: "cors",
        signal: AbortSignal.timeout(10000),
      });
    } catch (fetchError) {
      console.error("UserCheck fetch error:", fetchError);

      // Thử với XHR cho userCheck
      try {
        const userCheckData = await tryUserCheckWithXHR(
          userCheckUrl,
          loginData
        );
        return processUserCheckResponse(userCheckData);
      } catch {
        return {
          success: false,
          error: `UserCheck failed: ${
            fetchError instanceof Error ? fetchError.message : "Unknown error"
          }`,
        };
      }
    }

    if (!userCheckResponse.ok) {
      throw new Error(`User check failed: HTTP ${userCheckResponse.status}`);
    }

    const userCheckData = await userCheckResponse.json();
    return processUserCheckResponse(userCheckData);
  };

  // Helper cho userCheck với XHR
  const tryUserCheckWithXHR = (
    url: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("If-Modified-Since", "0");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 10000;

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const responseData = JSON.parse(xhr.responseText);
              resolve(responseData);
            } catch (parseError) {
              reject(parseError);
            }
          } else {
            reject(new Error(`XHR UserCheck failed: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("XHR UserCheck network error"));
      xhr.ontimeout = () => reject(new Error("XHR UserCheck timeout"));

      xhr.send(JSON.stringify(data));
    });
  };

  // Helper để xử lý response của userCheck
  const processUserCheckResponse = (
    userCheckData: Record<string, unknown>
  ): { success: boolean; sessionID?: string; error?: string } => {
    console.log("6-User check response:", userCheckData);

    if (userCheckData.statusValue === "200") {
      return {
        success: true,
        sessionID: userCheckData.sessionID as string,
      };
    } else {
      const errorMessages: { [key: string]: string } = {
        "203": "Mật khẩu không đúng",
        "206": "Tài khoản bị khóa",
        "207": "IP trong danh sách đen",
        "208": "Người dùng đã đăng nhập",
        "220": "Lỗi hệ thống camera",
      };

      const errorMsg =
        errorMessages[userCheckData.statusValue as string] ||
        "Tên đăng nhập hoặc mật khẩu không đúng";
      return {
        success: false,
        error: errorMsg,
      };
    }
  };

  // Enhanced IP Camera connection với better error handling
  const connectIPCameraAdvanced = useCallback(
    async (config: IPCameraConfig) => {
      try {
        setIpCameraError(null);
        console.log("Connecting to advanced IP camera stream:", config.url);

        // Step 1: Perform camera login với improved error handling
        const loginResult = await performCameraLogin(config);
        if (!loginResult.success) {
          const errorMsg = loginResult.error || "Đăng nhập camera IP thất bại";
          setIpCameraError(errorMsg);

          // Thêm gợi ý cho user
          if (errorMsg.includes("CORS")) {
            setIpCameraError(
              errorMsg +
                "\n\nGợi ý: Cấu hình CORS trên camera hoặc sử dụng proxy server."
            );
          } else if (errorMsg.includes("ERR_RESPONSE_HEADERS")) {
            setIpCameraError(
              "Camera có vấn đề về HTTP headers. Thử restart camera hoặc cập nhật firmware."
            );
          }

          return;
        }

        console.log(
          "Camera login successful, sessionID:",
          loginResult.sessionID
        );

        // Continue with video stream setup...
        // (rest of the video stream code remains the same)
      } catch (error) {
        console.error("Advanced IP camera error:", error);
        setIpCameraError(
          `Lỗi kết nối camera IP: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    [performCameraLogin]
  );

  // Helper function để hash password bằng MD5
  const hashPassword = async (password: string): Promise<string> => {
    return CryptoJS.MD5(password).toString();
  };

  // Initialize camera based on source
  useEffect(() => {
    const initCamera = async () => {
      if (cameraSource === "local") {
        await getLocalCamera();
      } else if (
        cameraSource === "ip" &&
        ipCameraConfig.username &&
        ipCameraConfig.password
      ) {
        await connectIPCameraAdvanced(ipCameraConfig);
      }
    };

    initCamera();

    // Cleanup function
    return () => {
      // Stop any running streams
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const videoElement = videoRef.current;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [
    cameraSource,
    ipCameraConfig,
    ipCameraConfig.username,
    ipCameraConfig.password,
    ipCameraConfig.url,
    connectIPCameraAdvanced,
  ]);

  // Face detection effect (unchanged)
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

          canvas.width = video.clientWidth;
          canvas.height = video.clientHeight;

          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.3,
            })
          );

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detections.length > 0) {
            const scaleX = canvas.width / video.videoWidth;
            const scaleY = canvas.height / video.videoHeight;

            detections.forEach((detection, i) => {
              const { x, y, width, height } = detection.box;

              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 3;
              ctx.strokeRect(
                x * scaleX,
                y * scaleY,
                width * scaleX,
                height * scaleY
              );

              ctx.fillStyle = "#00ff00";
              ctx.font = "16px Arial";
              ctx.fillText(`Face ${i + 1}`, x * scaleX, y * scaleY - 5);
            });
          }
        } catch {
          // Silent error handling
        }
      }
    };

    if (modelsLoaded && !loading) {
      intervalId = setInterval(detectFaces, 100);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [modelsLoaded, loading]);

  // Handle capture (unchanged)
  const handleCapture = async () => {
    if (!videoRef.current || !modelsLoaded) {
      alert("Camera hoặc models chưa sẵn sàng!");
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        alert("Không thể tạo canvas context!");
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL("image/jpeg", 0.9);

      const detections = await faceapi.detectAllFaces(
        canvas,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5,
        })
      );

      if (detections.length === 0) {
        alert("Không phát hiện khuôn mặt trong ảnh! Vui lòng thử lại.");
        return;
      }

      console.log(
        `Captured image with ${detections.length} face(s) detected from ${cameraSource} camera`
      );
      onCapture(imgData);
    } catch (error) {
      console.error("Error capturing image:", error);
      alert(
        "Lỗi khi chụp ảnh: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  // Handle IP Camera login
  const handleIPCameraLogin = async () => {
    if (!ipCameraConfig.username || !ipCameraConfig.password) {
      alert("Vui lòng nhập username và password!");
      return;
    }

    setShowIPCameraDialog(false);
    setCameraSource("ip");
  };

  return (
    <Box sx={{ position: "relative", width: 500, maxWidth: "100%" }}>
      {/* Camera Source Selection */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel>Nguồn Camera</InputLabel>
          <Select
            value={cameraSource}
            label="Nguồn Camera"
            onChange={(e) => {
              const newSource = e.target.value as "local" | "ip";
              if (newSource === "ip") {
                setShowIPCameraDialog(true);
              } else {
                setCameraSource(newSource);
              }
            }}>
            <MenuItem value="local">📷 Camera Local</MenuItem>
            <MenuItem value="ip">🌐 Camera IP (172.16.1.186)</MenuItem>
          </Select>
        </FormControl>

        {cameraSource === "ip" && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowIPCameraDialog(true)}>
            ⚙️ Cấu hình IP Camera
          </Button>
        )}
      </Box>

      {/* Error display for IP Camera */}
      {ipCameraError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {ipCameraError}
        </Alert>
      )}

      {/* Video display */}
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
            display: "block",
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
            borderRadius: 8,
          }}
        />
      </Box>

      {/* Status indicators */}
      <Box sx={{ mt: 1, mb: 2 }}>
        <Typography
          variant="caption"
          color={modelsLoaded ? "success.main" : "warning.main"}>
          {loading
            ? "🔄 Đang tải models..."
            : modelsLoaded
            ? `✅ Models sẵn sàng (${
                cameraSource === "ip" ? "IP Camera" : "Local Camera"
              })`
            : "❌ Lỗi tải models"}
        </Typography>
      </Box>

      <Button
        variant="contained"
        sx={{ mt: 1 }}
        onClick={handleCapture}
        disabled={loading || !modelsLoaded}
        fullWidth>
        {loading ? "Đang tải mô hình..." : "📸 Chụp & Nhận diện"}
      </Button>

      {/* IP Camera Configuration Dialog */}
      <Dialog
        open={showIPCameraDialog}
        onClose={() => setShowIPCameraDialog(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Cấu hình Camera IP</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="URL Camera"
              value={ipCameraConfig.url}
              onChange={(e) =>
                setIpCameraConfig((prev) => ({ ...prev, url: e.target.value }))
              }
              sx={{ mb: 2 }}
              helperText="Ví dụ: http://172.16.1.186"
            />
            <TextField
              fullWidth
              label="Username"
              value={ipCameraConfig.username}
              onChange={(e) =>
                setIpCameraConfig((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={ipCameraConfig.password}
              onChange={(e) =>
                setIpCameraConfig((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              sx={{ mb: 2 }}
            />
            <Alert severity="info">
              Camera sẽ kết nối tới: {ipCameraConfig.url}/doc/page/main.html
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIPCameraDialog(false)}>Hủy</Button>
          <Button onClick={handleIPCameraLogin} variant="contained">
            Kết nối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Export default component remains the same as your original code
export default function FacedetectPage() {
  // ... (rest of your original component code remains unchanged)
  const [ctaikhoan, setCtaikhoan] = useState("");
  const [choten, setChoten] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [serverImage, setServerImage] = useState<string | null>(null);
  const { data: loginedUser, setUserData } = useUserStore();
  const [token, setToken] = useState<string | null>(null);
  const [recognitionTime, setRecognitionTime] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const getTokenFromClient = () => {
      const storedToken = localStorage.getItem("authToken");
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      return storedToken || cookieToken || null;
    };

    const clientToken = getTokenFromClient();
    setToken(clientToken);

    if (!loginedUser) {
      const claims = getClaimsFromToken();
      if (claims) {
        setUserData(claims);
        console.log("User claims:", claims);
      } else {
        console.warn("No valid claims found in token");
      }
    }

    setInitialized(true);
  }, [initialized, loginedUser, setUserData]);

  const handleFaceCapture = useCallback(
    async (imgBase64: string) => {
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
        console.log(
          "Thời gian gọi API:",
          new Date(apiStartTime).toLocaleString()
        );

        const res = await fetch("/api/staff-detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token, image: imgBase64 }),
        });

        const apiEndTime = Date.now();
        const apiDuration = apiEndTime - apiStartTime;
        console.log(
          "⏱️ Thời gian API response:",
          new Date(apiEndTime).toLocaleString()
        );
        console.log("⚡ Thời gian xử lý API:", apiDuration + "ms");

        const data = await res.json();
        console.log("📋 Kết quả nhận diện:", data);

        if (data.found) {
          setServerImage(data.nhanvien.cimg);
          setCtaikhoan(data.nhanvien.ctaikhoan);
          setChoten(data.nhanvien.choten);
          console.log(
            "✅ Nhận diện thành công:",
            data.nhanvien.ctaikhoan + " - " + data.nhanvien.choten
          );

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
        setChoten(
          "Lỗi khi nhận diện: " +
            (error instanceof Error ? error.message : String(error))
        );
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
        console.log(
          "⏰ TỔNG THỜI GIAN NHẬN DIỆN:",
          (totalDuration / 1000).toFixed(2) + " giây"
        );

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
    },
    [token]
  );

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

    console.log("Đang gửi ảnh lên server..." + Date.now());
    const result = await luuanhnguoidung(
      loginedUser.ctaikhoan,
      "1",
      0,
      ctaikhoan,
      choten,
      imgBase64
    );
    console.log("Kết quả lưu ảnh:", result);
    const arr = result as Array<{ _ID: number }>;

    if (
      typeof arr === "string" &&
      arr === "Authorization has been denied for this request."
    ) {
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

  const handleLoadImage = async () => {
    if (!ctaikhoan.trim()) {
      alert("Vui lòng nhập tài khoản!");
      return;
    }
    const result = await luuanhnguoidung(
      loginedUser.ctaikhoan,
      "2",
      0,
      ctaikhoan,
      "",
      ""
    );

    const arr = result as Array<{
      cid: number;
      ctaikhoan: string;
      choten: string;
      cimg: string;
      cngaytao: string;
    }>;

    if (
      typeof arr === "string" &&
      arr === "Authorization has been denied for this request."
    ) {
      alert("Bạn không có quyền tải ảnh người dùng!");
    } else if (Array.isArray(arr) && arr.length > 0) {
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
    <Box
      p={2}
      sx={{
        minHeight: "100vh",
        overflow: "auto",
        pb: 4,
      }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: "normal", letterSpacing: 1 }}>
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
        <Button variant="outlined" color="secondary" onClick={handleLoadImage}>
          Load ảnh từ server
        </Button>
      </Box>

      <Box mb={3}>
        <CameraComponent
          onCapture={handleFaceCapture}
          capturedImage={capturedImage}
        />
      </Box>

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

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mt: 3,
          flexWrap: "wrap",
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}>
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
              minWidth: { xs: "100%", sm: 320 },
              maxWidth: { xs: "100%", sm: 400 },
              flex: { md: "1" },
            }}>
            <Typography
              fontSize={14}
              mb={1}
              fontWeight="bold"
              color="#071b30ff">
              Ảnh vừa chụp
            </Typography>
            <Box
              sx={{
                width: "100%",
                maxWidth: 300,
                aspectRatio: "4/3",
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
                border: "1px solid #eee",
              }}>
              <Image
                src={capturedImage}
                alt="Ảnh chụp"
                fill
                style={{
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
                priority
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
                }}>
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
            }}>
            <Typography variant="body2" textAlign="center">
              Chưa có ảnh chụp
            </Typography>
          </Box>
        )}

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
            }}>
            <Typography
              fontSize={14}
              mb={1}
              fontWeight="bold"
              color="#071b30ff"
              textAlign="center">
              Nhân viên: {ctaikhoan} - {choten}
            </Typography>
            <Box
              sx={{
                width: "100%",
                maxWidth: 300,
                aspectRatio: "4/3",
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
                border: "1px solid #eee",
              }}>
              <Image
                src={serverImage}
                alt="Ảnh từ server"
                fill
                style={{
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
                priority
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
            }}>
            <Typography variant="body2" textAlign="center">
              Không phát hiện ảnh
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ height: 50 }} />
    </Box>
  );
}
