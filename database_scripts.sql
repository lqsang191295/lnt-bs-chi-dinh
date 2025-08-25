-- =============================================
-- Scripts tạo database cho chức năng đăng ký khám bệnh
-- =============================================

USE [LNT_EMR]
GO

-- 1. Tạo bảng bệnh nhân
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tbenhnhan]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[tbenhnhan](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [maBN] [varchar](20) NOT NULL,
    [hoTen] [nvarchar](100) NOT NULL,
    [cccd] [varchar](12) NOT NULL,
    [ngaySinh] [date] NOT NULL,
    [gioiTinh] [nvarchar](10) NOT NULL,
    [soDienThoai] [varchar](15) NOT NULL,
    [diaChi] [nvarchar](200) NOT NULL,
    [ngayTao] [datetime] NOT NULL DEFAULT GETDATE(),
    [trangThai] [int] NOT NULL DEFAULT 1,
    CONSTRAINT [PK_tbenhnhan] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UQ_tbenhnhan_maBN] UNIQUE NONCLUSTERED ([maBN] ASC),
    CONSTRAINT [UQ_tbenhnhan_cccd] UNIQUE NONCLUSTERED ([cccd] ASC)
)
END
GO

-- 2. Tạo bảng đăng ký khám bệnh
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tdangkykhambenh]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[tdangkykhambenh](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [maBN] [varchar](20) NOT NULL,
    [maPhieu] [varchar](20) NOT NULL,
    [ngayDangKy] [date] NOT NULL,
    [gioDangKy] [varchar](10) NOT NULL,
    [lyDoKham] [nvarchar](500) NOT NULL,
    [trangThai] [int] NOT NULL DEFAULT 1,
    [ghiChu] [nvarchar](500) NULL,
    [nguoiDangKy] [nvarchar](100) NULL,
    [ngayTao] [datetime] NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_tdangkykhambenh] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UQ_tdangkykhambenh_maPhieu] UNIQUE NONCLUSTERED ([maPhieu] ASC),
    CONSTRAINT [FK_tdangkykhambenh_benhnhan] FOREIGN KEY([maBN]) REFERENCES [dbo].[tbenhnhan] ([maBN])
)
END
GO



-- =============================================
-- STORED PROCEDURES
-- =============================================

-- 1. Stored procedure tìm kiếm bệnh nhân
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[emr_pget_benhnhan_search]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[emr_pget_benhnhan_search]
GO

CREATE PROCEDURE [dbo].[emr_pget_benhnhan_search]
    @pcccd VARCHAR(12) = NULL,
    @psdt VARCHAR(15) = NULL,
    @photen NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        [id],
        [maBN],
        [hoTen],
        [cccd],
        [ngaySinh],
        [gioiTinh],
        [soDienThoai],
        [diaChi],
        [ngayTao],
        [trangThai]
    FROM [dbo].[tbenhnhan]
    WHERE [trangThai] = 1
        AND (@pcccd IS NULL OR [cccd] LIKE '%' + @pcccd + '%')
        AND (@psdt IS NULL OR [soDienThoai] LIKE '%' + @psdt + '%')
        AND (@photen IS NULL OR [hoTen] LIKE N'%' + @photen + '%')
    ORDER BY [ngayTao] DESC
END
GO

-- 2. Stored procedure lấy thông tin bệnh nhân theo CCCD
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[emr_pget_benhnhan_by_cccd]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[emr_pget_benhnhan_by_cccd]
GO

CREATE PROCEDURE [dbo].[emr_pget_benhnhan_by_cccd]
    @pcccd VARCHAR(12)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        [id],
        [maBN],
        [hoTen],
        [cccd],
        [ngaySinh],
        [gioiTinh],
        [soDienThoai],
        [diaChi],
        [ngayTao],
        [trangThai]
    FROM [dbo].[tbenhnhan]
    WHERE [cccd] = @pcccd AND [trangThai] = 1
END
GO

-- 3. Stored procedure thêm bệnh nhân mới
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[emr_pinsert_benhnhan]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[emr_pinsert_benhnhan]
GO

CREATE PROCEDURE [dbo].[emr_pinsert_benhnhan]
    @photen NVARCHAR(100),
    @pcccd VARCHAR(12),
    @pngaysinh DATE,
    @pgioitinh NVARCHAR(10),
    @psdt VARCHAR(15),
    @pdiachi NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @maBN VARCHAR(20) = 'BN' + CAST(YEAR(GETDATE()) AS VARCHAR(4)) + 
                                RIGHT('00000' + CAST(IDENT_CURRENT('tbenhnhan') + 1 AS VARCHAR(10)), 5)
    
    BEGIN TRY
        INSERT INTO [dbo].[tbenhnhan] ([maBN], [hoTen], [cccd], [ngaySinh], [gioiTinh], [soDienThoai], [diaChi])
        VALUES (@maBN, @photen, @pcccd, @pngaysinh, @pgioitinh, @psdt, @pdiachi)
        
        SELECT @maBN AS maBN
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS error
    END CATCH
END
GO



-- 4. Stored procedure đăng ký khám bệnh
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[emr_pinsert_dangkykhambenh]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[emr_pinsert_dangkykhambenh]
GO

CREATE PROCEDURE [dbo].[emr_pinsert_dangkykhambenh]
    @pmanbn VARCHAR(20),
    @pngaydangky DATE,
    @pgiogio VARCHAR(10),
    @plydokham NVARCHAR(500),
    @pghichu NVARCHAR(500),
    @pnguoidangky NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @maPhieu VARCHAR(20) = 'PK' + CAST(YEAR(GETDATE()) AS VARCHAR(4)) + 
                                   RIGHT('00000' + CAST(IDENT_CURRENT('tdangkykhambenh') + 1 AS VARCHAR(10)), 5)
    
    BEGIN TRY
        INSERT INTO [dbo].[tdangkykhambenh] ([maBN], [maPhieu], [ngayDangKy], [gioDangKy], [lyDoKham], [ghiChu], [nguoiDangKy])
        VALUES (@pmanbn, @maPhieu, @pngaydangky, @pgiogio, @plydokham, @pghichu, @pnguoidangky)
        
        SELECT @maPhieu AS maPhieu
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS error
    END CATCH
END
GO

-- 5. Stored procedure tạo mã phiếu tự động
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[emr_pget_maphieu_tudong]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[emr_pget_maphieu_tudong]
GO

CREATE PROCEDURE [dbo].[emr_pget_maphieu_tudong]
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @maPhieu VARCHAR(20) = 'PK' + CAST(YEAR(GETDATE()) AS VARCHAR(4)) + 
                                   RIGHT('00000' + CAST(IDENT_CURRENT('tdangkykhambenh') + 1 AS VARCHAR(10)), 5)
    
    SELECT @maPhieu AS maPhieu
END
GO

-- =============================================
-- INDEXES để tối ưu hiệu suất
-- =============================================

-- Index cho bảng bệnh nhân
CREATE NONCLUSTERED INDEX [IX_tbenhnhan_cccd] ON [dbo].[tbenhnhan] ([cccd])
CREATE NONCLUSTERED INDEX [IX_tbenhnhan_sdt] ON [dbo].[tbenhnhan] ([soDienThoai])
CREATE NONCLUSTERED INDEX [IX_tbenhnhan_hoten] ON [dbo].[tbenhnhan] ([hoTen])

-- Index cho bảng đăng ký khám bệnh
CREATE NONCLUSTERED INDEX [IX_tdangkykhambenh_mabn] ON [dbo].[tdangkykhambenh] ([maBN])
CREATE NONCLUSTERED INDEX [IX_tdangkykhambenh_ngaydangky] ON [dbo].[tdangkykhambenh] ([ngayDangKy])

PRINT 'Database scripts đã được tạo thành công!'
GO
