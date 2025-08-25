# HƯỚNG DẪN SỬ DỤNG CHỨC NĂNG ĐĂNG KÝ KHÁM BỆNH

## **Tổng quan**

Chức năng đăng ký khám bệnh cho phép bệnh nhân đăng ký khám bệnh thông qua giao diện web với các tính năng:
- Tìm kiếm bệnh nhân cũ
- Quét CCCD để tự động điền thông tin
- Nhập thông tin thủ công cho bệnh nhân mới
- Xác thực khuôn mặt trước khi đăng ký
- Lưu trữ thông tin vào database

## **Cấu trúc hệ thống**

### **1. Frontend (React + TypeScript)**
```
src/
├── app/waiting-screen/          # Giao diện đăng ký khám bệnh
├── model/dangkykhambenh.ts      # TypeScript interfaces
├── actions/act_dangkykhambenh.ts # API calls
├── store/dangkykhambenh.ts      # State management (Zustand)
└── pages/api/dangkykhambenh.ts  # API endpoints
```

### **2. Backend (SQL Server)**
```
Database: LNT_EMR
├── tbenhnhan              # Bảng thông tin bệnh nhân
├── tdangkykhambenh        # Bảng đăng ký khám bệnh
└── Stored Procedures      # Xử lý business logic
```

## **Cài đặt và triển khai**

### **Bước 1: Cài đặt dependencies**
```bash
npm install
# hoặc
yarn install
```

### **Bước 2: Tạo database**
1. Mở SQL Server Management Studio
2. Kết nối đến database LNT_EMR
3. Chạy script `database_scripts.sql` để tạo bảng và stored procedures

### **Bước 3: Cấu hình kết nối database**
Kiểm tra file `src/api/client.ts` để đảm bảo kết nối database đúng.

### **Bước 4: Chạy ứng dụng**
```bash
npm run dev
# hoặc
yarn dev
```

## **Sử dụng chức năng**

### **1. Tìm kiếm bệnh nhân cũ**
- Nhập số điện thoại hoặc CCCD
- Hệ thống sẽ tìm kiếm trong database
- Nếu tìm thấy, hiển thị thông tin để cập nhật

### **2. Quét CCCD**
- Đặt CCCD vào khung quét
- Hệ thống sẽ đọc thông tin từ CCCD
- Tự động điền form đăng ký

### **3. Nhập thông tin thủ công**
- Điền đầy đủ thông tin bệnh nhân
- Nhập lý do khám và ghi chú

### **4. Xác thực khuôn mặt**
- Sử dụng camera để xác thực
- Đảm bảo bệnh nhân thực sự có mặt
- Hoàn tất quá trình đăng ký

## **API Endpoints**

### **POST /api/dangkykhambenh**

#### **Tìm kiếm bệnh nhân**
```json
{
  "action": "timKiemBenhNhan",
  "data": {
    "cccd": "123456789012",
    "soDienThoai": "0901234567",
    "hoTen": "Nguyễn Văn A"
  }
}
```

#### **Lấy thông tin từ CCCD**
```json
{
  "action": "layThongTinTuCCCD",
  "data": {
    "cccd": "123456789012"
  }
}
```

#### **Thêm bệnh nhân mới**
```json
{
  "action": "themBenhNhan",
  "data": {
    "hoTen": "Nguyễn Văn A",
    "cccd": "123456789012",
    "ngaySinh": "1985-03-15",
    "gioiTinh": "Nam",
    "soDienThoai": "0901234567",
    "diaChi": "123 Đường ABC, Quận 1, TP.HCM"
  }
}
```

#### **Đăng ký khám bệnh**
```json
{
  "action": "dangKyKhamBenh",
  "data": {
    "maBN": "BN202400001",
    "ngayDangKy": "2024-01-15",
    "gioDangKy": "08:00",
    "lyDoKham": "Đau đầu, chóng mặt",
    "ghiChu": "Khám lần đầu",
    "nguoiDangKy": "Hệ thống"
  }
}
```

## **Database Schema**

### **Bảng tbenhnhan**
| Cột | Kiểu dữ liệu | Mô tả |
|-----|---------------|-------|
| id | int | ID tự động tăng |
| maBN | varchar(20) | Mã bệnh nhân (unique) |
| hoTen | nvarchar(100) | Họ và tên |
| cccd | varchar(12) | Số CCCD (unique) |
| ngaySinh | date | Ngày sinh |
| gioiTinh | nvarchar(10) | Giới tính |
| soDienThoai | varchar(15) | Số điện thoại |
| diaChi | nvarchar(200) | Địa chỉ |
| ngayTao | datetime | Ngày tạo |
| trangThai | int | Trạng thái (1: Hoạt động, 0: Không hoạt động) |

### **Bảng tdangkykhambenh**
| Cột | Kiểu dữ liệu | Mô tả |
|-----|---------------|-------|
| id | int | ID tự động tăng |
| maBN | varchar(20) | Mã bệnh nhân (FK) |
| maPhieu | varchar(20) | Mã phiếu đăng ký (unique) |
| ngayDangKy | date | Ngày đăng ký |
| gioDangKy | varchar(10) | Giờ đăng ký |
| lyDoKham | nvarchar(500) | Lý do khám |
| trangThai | int | Trạng thái (1: Chờ khám, 2: Đang khám, 3: Hoàn thành, 4: Hủy) |
| ghiChu | nvarchar(500) | Ghi chú |
| nguoiDangKy | nvarchar(100) | Người đăng ký |
| ngayTao | datetime | Ngày tạo |

## **Stored Procedures**

### **1. emr_pget_benhnhan_search**
Tìm kiếm bệnh nhân theo CCCD, số điện thoại hoặc họ tên.

### **2. emr_pget_benhnhan_by_cccd**
Lấy thông tin bệnh nhân theo CCCD.

### **3. emr_pinsert_benhnhan**
Thêm bệnh nhân mới với mã BN tự động.

### **4. emr_pinsert_dangkykhambenh**
Đăng ký khám bệnh với mã phiếu tự động.

### **5. emr_pget_maphieu_tudong**
Tạo mã phiếu đăng ký tự động.

## **Xử lý lỗi**

### **Validation Errors**
- Kiểm tra thông tin bắt buộc
- Validate định dạng CCCD, số điện thoại
- Kiểm tra ngày sinh hợp lệ

### **Database Errors**
- Xử lý lỗi kết nối database
- Xử lý lỗi duplicate key
- Xử lý lỗi foreign key constraint

### **Network Errors**
- Timeout handling
- Retry mechanism
- Fallback data

## **Bảo mật**

### **Input Validation**
- Sanitize user input
- Validate data types
- Prevent SQL injection

### **Authentication**
- JWT token validation
- Role-based access control
- Session management

### **Data Privacy**
- Encrypt sensitive data
- Audit logging
- Data retention policies

## **Monitoring và Logging**

### **Performance Monitoring**
- API response time
- Database query performance
- Error rates

### **Audit Logging**
- User actions
- Data changes
- System events

## **Troubleshooting**

### **Common Issues**

#### **1. Không thể kết nối database**
- Kiểm tra connection string
- Kiểm tra firewall settings
- Kiểm tra SQL Server service

#### **2. Lỗi stored procedure**
- Kiểm tra syntax SQL
- Kiểm tra permissions
- Kiểm tra parameter types

#### **3. Lỗi xác thực khuôn mặt**
- Kiểm tra camera permissions
- Kiểm tra browser compatibility
- Kiểm tra face-api.js library

### **Debug Mode**
```typescript
// Enable debug logging
const DEBUG = true;

if (DEBUG) {
  console.log('API Response:', response);
  console.log('Database Query:', query);
}
```

## **Tính năng mở rộng**

### **1. Tích hợp OCR**
- Sử dụng Tesseract.js để đọc CCCD
- Tích hợp với API OCR của bên thứ 3

### **2. Tích hợp AI**
- Sử dụng face-api.js để nhận diện khuôn mặt
- Tích hợp với AI service để phân tích hình ảnh

### **3. Tích hợp SMS/Email**
- Gửi thông báo xác nhận qua SMS
- Gửi email thông tin đăng ký

### **4. Tích hợp Payment**
- Thanh toán phí khám bệnh
- Tích hợp với cổng thanh toán

## **Liên hệ hỗ trợ**

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ:
- Email: support@lnt-emr.com
- Phone: 1900-xxxx
- Documentation: https://docs.lnt-emr.com
