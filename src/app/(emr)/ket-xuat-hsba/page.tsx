// app/ket-xuat-hsba/page.tsx
"use client";
import { Download, NoteAdd, Refresh } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  Typography,
  LinearProgress,
  Alert,
  MenuItem,
} from "@mui/material";
import { capnhathosobenhan, getHosobenhan, getChiTietHSBA } from "@/actions/act_thosobenhan"; 
import { IHoSoBenhAnChiTiet } from "@/model/thosobenhan_chitiet";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useUserStore } from "@/store/user";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { mergePDFsWithProgress } from "@/utils/pdflib";
import { IPDFItem } from "@/model/ipdf";
import React , { useCallback, useEffect, useState }from "react"; 
// ----------------- MOCK DATA -----------------


const columns: GridColDef[] = [
  { field: "ID", headerName: "ID", width: 60 },
  {
    field: "TrangThaiKetXuat",
    headerName: "Trạng thái",
    width: 120,
    renderCell: (params) => (
      <Box
        sx={{
          backgroundColor: "transparent",
          color: params.value === 1 ? "#f44336": "#8200fcff", // Màu vàng cho MO, màu đỏ cho DONG,
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: params.value === 1 ? "bold" : "normal",
          textAlign: "center",
          minWidth: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
        }}>
        {params.value === 1 ? (
          <>
            <FileDownloadOutlinedIcon sx={{ fontSize: "14px" }} />            
            <button onClick={() => handleDownload(params.row)}>Tải xuống</button>
          </>
        ) : (
          <>
            <KeyboardArrowDownOutlinedIcon sx={{ fontSize: "14px" }} />
            Chưa kết xuất
          </>
        )}
      </Box>
    ),
  }, 
  { field: "Hoten", headerName: "Họ và tên", width: 200 },
  { field: "MaBN", headerName: "Mã BN", width: 130 },
  { field: "Ngaysinh", headerName: "Ngày sinh", width: 130 },
  { field: "SoVaoVien", headerName: "Số vào viện", width: 130 },
  { field: "NgayVao", headerName: "Ngày vào viện", width: 130 },
  { field: "NgayRa", headerName: "Ngày ra viện", width: 130 },
  { field: "KhoaVaoVien", headerName: "Khoa nhập viện", width: 100 },
  { field: "KhoaDieuTri", headerName: "Khoa điều trị", width: 200 },
  { field: "LoaiBenhAn", headerName: "Loại BA", width: 130 },
  { field: "BsDieuTriKyTen", headerName: "Bác sĩ điều trị", width: 130 },
  { field: "SoLuuTru", headerName: "Số lưu trữ", width: 100 },
  { field: "NgayLuuTru", headerName: "Ngày lưu trữ", width: 100 },
  { field: "ViTriLuuTru", headerName: "Vị trí lưu trữ", width: 150 },
  { field: "TenLoaiLuuTru", headerName: "Loại lưu trữ", width: 200 },
  { field: "SoNamLuuTru", headerName: "Số năm lưu trữ", width: 150 },
];
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      className="p-0 w-full h-full"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && (
        <Box className="w-full h-full flex flex-col">{children}</Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
 
function handleDownload(hsba: IHoSoBenhAn)   {
  try {
    if (!hsba.NoiDungPdf) {
      ToastWarning("Hồ sơ bệnh án chưa được kết xuất PDF!");
      return;
    }

    // Validate and clean base64 string
    const cleanBase64 = hsba.NoiDungPdf.replace(/[^A-Za-z0-9+/]/g, '');
    
    // Add padding if needed
    const paddedBase64 = cleanBase64 + '='.repeat((4 - cleanBase64.length % 4) % 4);
    
    // Convert base64 to binary using a safer method
    const binaryString = atob(paddedBase64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Tạo blob để download
    const blob = new Blob([bytes], { type: 'application/pdf' });
    
    const url = URL.createObjectURL(blob);
    
    // Tạo tên file với timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `HSBA_${hsba.MaBN}_${hsba.SoVaoVien}_${timestamp}.pdf`;
    
    // Download file
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error downloading PDF:", error);
    ToastError("Lỗi khi tải xuống hồ sơ bệnh án. Vui lòng thử lại.");
  }
}  

// ----------------- COMPONENT -----------------
export default function KetXuatHsbaPage() {
  // State quản lý các giá trị
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = React.useState(0);
  const [selectedRows, setSelectedRows] = useState<IHoSoBenhAn[]>([]);
  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [selectedKhoa, setSelectedKhoa] = useState("all");
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<IHoSoBenhAn[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện
  const {data: loginedUser } = useUserStore();
  const [searchingData, setSearchingData] = useState<boolean>(false);
 
  const fetchKhoaList = async () => {
    try {
      const dataKhoaPhong = await DataManager.getDmKhoaPhong();
      setKhoaList(dataKhoaPhong);
    } catch (error) {
      console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  };
  // Fetch khoa list from API
  useEffect(() => {
    fetchKhoaList();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Hàm xử lý kết xuất
  const handleKetXuat = async () => {
    try {
      // Kiểm tra có dữ liệu được chọn không
      if (!selectedRows || selectedRows.length === 0) {
      ToastWarning("Vui lòng chọn ít nhất một hồ sơ bệnh án để kết xuất!");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    let hsbaSuccess = 0;
    // Lấy PDF data cho từng HSBA được chọn
    for (const hsba of selectedRows) {
      try {
        // Tạo danh sách PDF từ selectedRows
        const pdfList: IPDFItem[] = [];

        //console.log(`Getting PDF for HSBA: ${hsba.ID}`);
        
        // Gọi API để lấy chi tiết PDF của HSBA
        const chiTietData = await getChiTietHSBA(
          loginedUser.ctaikhoan, 
          popt, 
          hsba.ID
        );

        if (chiTietData && Array.isArray(chiTietData)) {
          chiTietData.forEach((phieu: IHoSoBenhAnChiTiet, index: number) => {
            if (phieu.FilePdfKySo) {
              pdfList.push({
                maHSBA: `${hsba.MaBN}-${hsba.SoVaoVien}-${index + 1}`,
                FilePdf: phieu.FilePdfKySo
              });
            }
          });
        }
            
        if (pdfList.length === 0) {
          ToastError("Không tìm thấy file PDF nào để kết xuất!");
          return;
        }

        //console.log(`Found ${pdfList.length} PDF files to merge`);

        // Gọi trực tiếp mergePDFsWithProgress
        const mergedPdfBase64 = await mergePDFsWithProgress(
          pdfList,
          "HỒ SƠ BỆNH ÁN ĐIỆN TỬ BỆNH VIỆN ĐA KHOA LÊ NGỌC TÙNG", // Text không dấu
          true,
          (current, total, currentHSBA) => {
            setProgress((current / total) * 100);
            // console.log(`Processing ${current}/${total}: ${currentHSBA}`);
          }
        );

        if (mergedPdfBase64) {
          try {
            // XỬ LÝ LƯU TRỮ PDF VÀO BLOB VÀ TẢI VỀ
            try {
                // console.log(`Updating HSBA ID: ${hsba.ID} with merged PDF`);
                const updatedHsba = {
                  ...hsba,
                  NoiDungPdf: mergedPdfBase64 // Cập nhật trường Nội dung PDF với base64 đã hợp nhất
                  ,TrangThaiKetXuat: "1", // Cập nhật trạng thái kết xuất 
                  NguoiKetXuat: loginedUser.ctaikhoan
                };
                const result = await capnhathosobenhan(loginedUser.ctaikhoan, "5", updatedHsba);
                // console.log("Update result:", result);
                if (result && result[0].ROW_COUNT === 1) {
                  // console.log(`Cập nhật thành công hồ sơ bệnh án ID: ${hsba.ID}`);
                  hsbaSuccess++;
                } 
                // else {
                //   console.error(`Cập nhật thất bại cho HSBA ID: ${hsba.ID}`);
                // } 

            } catch (error) {
              // console.error("Error updating HSBA:", error);
              ToastError(`Có lỗi xảy ra khi cập nhật kết xuất HSBA! ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
 
          } catch (conversionError) {
            // console.error('Error converting base64 to blob:', conversionError);
            ToastError('Lỗi khi chuyển đổi dữ liệu PDF. Vui lòng thử lại.');
          }
        }
      } catch (error) {
        // console.error(`Error getting PDF for HSBA ${hsba.ID}:`, error);
        continue;
      }
    }
    if (hsbaSuccess === selectedRows.length) {
      ToastSuccess(`Kết xuất thành công ${selectedRows.length} HSBA!`);
    }
    else {
      ToastWarning(`Kết xuất thành công ${hsbaSuccess} trong tổng số ${selectedRows.length} HSBA!`);
    }
    await handleSearch();

  } catch (error) {
    // console.error("Error in handleKetXuat:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setError(errorMessage);
    ToastError(`Lỗi kết xuất: ${errorMessage}`);
  } finally {
    setLoading(false);
    setProgress(0);
  }
};

  // Hàm xử lý khi chọn rows trong DataGrid
  const handleRowSelectionChange = (selectionModel: GridRowSelectionModel) => {
    let selectionArray: unknown[] = [];

    //console.log("Selected rows for update:", selectionModel);
    if (selectionModel && selectionModel.ids) {
      selectionArray = Array.from(selectionModel.ids);
    } else if (Array.isArray(selectionModel)) {
      selectionArray = selectionModel;
    }
    //console.log("Selection array:", selectionArray);
    const selectedRowsData = rows.filter((row) =>
      selectionArray.includes(row.ID)
    );
    //console.log("Selected rows data:", selectedRowsData);
    setSelectedRows(selectedRowsData);
  };

  // Hàm tìm kiếm hồ sơ bệnh án
  const handleSearch = async () => {
    try {
      if (!tuNgay || !denNgay) return;

      setSearchingData(true);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const data = await getHosobenhan(
        loginedUser.ctaikhoan,
        popt,
        selectedKhoa,
        formatDate(tuNgay),
        formatDate(denNgay)
      );
      //console.log("Fetched HSBA data:", data); // For debugging
      setRows(
        (data || []).map((item: IHoSoBenhAn) => ({
          id: item.ID, // Use ID or index as row ID
          ...item,
        }))
      );
      // console.log("Search results:", data);
    } catch (error) {
      //console.error("Error fetching HSBA data:", error);
    } finally {
      setSearchingData(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>

      <Box p={2} className="w-full h-full flex flex-col">
        <Typography
          variant="h6"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
        QUẢN LÝ KẾT XUẤT HỒ SƠ BỆNH ÁN
      </Typography>

      {/* Bộ lọc */}
      <Box display="flex" gap={2} mb={2}>
          <Box flex={3}>
            <Select
              fullWidth
              value={selectedKhoa}
              size="small"
              onChange={(e) => setSelectedKhoa(e.target.value)}>
              {khoaList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box flex={2}>
            <FormControl>
              <FormLabel
                id="popt-radio-group-label"
                sx={{ color: "#1976d2", fontWeight: "bold" }}
              />
              <RadioGroup
                row
                aria-labelledby="popt-radio-group-label"
                name="popt-radio-group"
                value={popt}
                onChange={(e) => setPopt(e.target.value)}>
                <FormControlLabel
                  value="1"
                  control={
                    <Radio
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                      size="small"
                    />
                  }
                  label="Ngày vào viện"
                  sx={{ color: "#1976d2", fontWeight: "bold" }}
                />
                <FormControlLabel
                  value="2"
                  control={
                    <Radio
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                      size="small"
                    />
                  }
                  label="Ngày ra viện"
                  sx={{ color: "#1976d2", fontWeight: "bold" }}
                />
              </RadioGroup>
            </FormControl>
          </Box>
          <Box flex={1}>
            <DatePicker
              label="Từ ngày"
              value={tuNgay}
              onChange={(value) => setTuNgay(value as Date)}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </Box>
          <Box flex={1}>
            <DatePicker
              label="Đến ngày"
              value={denNgay}
              onChange={(value) => setDenNgay(value as Date)}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </Box>
          <Box flex={1}>
            <Button fullWidth variant="contained" size="small" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Box>          
        </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          aria-label="basic tabs example"
          value={value}
          onChange={handleChange}>
          <Tab label="Kết xuất" {...a11yProps(0)} />
          <Tab label="Lịch sử" {...a11yProps(1)} />
        </Tabs>
      </Box>

      {/* Tab Kết xuất */}
      <CustomTabPanel value={value} index={0}>
        <Box className="bg-white flex gap-2 p-2">
           <Button 
          variant="contained" 
          startIcon={<NoteAdd />} 
          size="small"
          onClick={handleKetXuat}
          disabled={loading}
        >
          {loading ? `Kết xuất... ${progress.toFixed(0)}%` : 'Kết xuất'}
        </Button>
          <Button variant="contained" startIcon={<Refresh />} size="small">
            Làm mới
          </Button>
        </Box>

      {/* Progress indicator */}
      {loading && (
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary">
            Đang xử lý: {progress.toFixed(0)}%
          </Typography>
        </Box>
      )}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
        {/* DataGrid */}
        <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={searchingData}
            pagination
            checkboxSelection
            disableRowSelectionOnClick
            density="compact"
            onRowSelectionModelChange={handleRowSelectionChange}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                border: "1px solid #e0e0e0",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#f9f9f9",
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "white",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#e3f2fd !important",
              },
            }}
          />
        </Box>
      </CustomTabPanel>
      {/* Tab Lịch sử */}
      <CustomTabPanel value={value} index={1}>
        <Box className="bg-white flex gap-2 p-2">
          <Button variant="contained" startIcon={<Refresh />} size="small">
            Làm mới
          </Button>
          <Button variant="contained" startIcon={<Download />} size="small">
            Download
          </Button>
        </Box>

        {/* DataGrid */}
        <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            checkboxSelection
            disableRowSelectionOnClick
            density="compact"
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
            }}
          />
        </Box>
      </CustomTabPanel>
    </Box>
    </LocalizationProvider>
  );
}
