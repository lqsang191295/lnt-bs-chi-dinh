"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Divider,
  Button,
  Typography,
} from "@mui/material";
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';

interface PolicyDialogProps {
  open: boolean;
  onClose: () => void;
}

const PolicyDialog: React.FC<PolicyDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "18px",
          backgroundColor: "#1976d2",
          color: "white",
          textAlign: "center",
          letterSpacing: 1,
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AdminPanelSettingsOutlinedIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            CHÍNH SÁCH BẢO VỆ DỮ LIỆU CÁ NHÂN
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
          
          {/* Tiêu đề chính */}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: "bold", 
              color: "#1976d2", 
              textAlign: "center",
              mb: 2
            }}
          >
            THÔNG BÁO CHẤP THUẬN VỀ VIỆC XỬ LÝ VÀ BẢO VỆ DỮ LIỆU CÁ NHÂN
          </Typography>

          {/* Phần giới thiệu */}
          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
            Căn cứ vào Nghị định số 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân do Chính phủ nước Cộng hòa Xã hội chủ nghĩa Việt Nam ban hành, chúng tôi trân trọng thông báo đến Quý Khách hàng các nguyên tắc xử lý dữ liệu cá nhân mà chúng tôi thực hiện theo quy định của pháp luật nhằm giúp Quý Khách hàng hiểu mục đích thu thập, sử dụng, tiết lộ, xử lý và bảo vệ dữ liệu cá nhân của Quý Khách hàng.
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
            Các nguyên tắc này áp dụng cho toàn bộ nhân viên trực thuộc <strong>Bệnh Viện Đa Khoa Tư Nhân Lê Ngọc Tùng</strong>.
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* 1. Loại dữ liệu cá nhân được xử lý */}
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}>
            1. Loại dữ liệu cá nhân được xử lý
          </Typography>
          
          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 1 }}>
            Dữ liệu cá nhân bao gồm dữ liệu cá nhân cơ bản và dữ liệu cá nhân nhạy cảm; là các thông tin dưới dạng ký hiệu, chữ viết, chữ số, hình ảnh, âm thanh hoặc dạng tương tự gắn liền với một con người cụ thể hoặc giúp xác định một con người cụ thể. Dữ liệu cá nhân có thể là họ và tên, thông tin nhân khẩu học, quốc tịch, số điện thoại, số CMND/CCCD/hộ chiếu, thông tin tài chính, thông tin y tế, đặc điểm di truyền, đặc điểm sinh học, xu hướng tính dục và bất kỳ dữ liệu, thông tin nào mà theo quy định của pháp luật tại từng thời điểm được định nghĩa là dữ liệu cá nhân.
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
            Xử lý là một hoặc nhiều hoạt động tác động tới dữ liệu cá nhân như: thu thập, ghi, phân tích, xác nhận, lưu trữ, chỉnh sửa, công khai, kết hợp, truy cập, truy xuất, thu hồi, mã hóa, giải mã, sao chép, chia sẻ, truyền đưa, cung cấp, chuyển giao, xóa, hủy dữ liệu cá nhân hoặc các hành động khác có liên quan.
          </Typography>

          {/* 2. Mục đích và cách thức xử lý dữ liệu cá nhân */}
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}>
            2. Mục đích và cách thức xử lý dữ liệu cá nhân
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 1 }}>
            Bằng việc tự nguyện cung cấp dữ liệu cá nhân của Quý Khách hàng để sử dụng sản phẩm/dịch vụ y tế của chúng tôi, điều này được xem như là Quý Khách hàng đã đồng ý cho chúng tôi xử lý dữ liệu cá nhân của Quý Khách hàng như được định nghĩa ở trên cho các mục đích liên quan đến việc cung cấp sản phẩm/dịch vụ y tế cho Quý Khách hàng. Chúng tôi cam kết chỉ xử lý dữ liệu cá nhân của Quý Khách hàng cho các mục đích mà Quý Khách hàng đã được thông báo và chấp thuận hoặc được cho phép/yêu cầu theo quy định của pháp luật hiện hành, cụ thể là:
          </Typography>

          <Box component="ul" sx={{ ml: 2, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, mb: 0.5 }}>
              Cung cấp dịch vụ xét nghiệm, chẩn đoán và các dịch vụ khám bệnh, chữa bệnh khác bao gồm việc chia sẻ dữ liệu cá nhân của Quý Khách hàng với các chuyên viên y tế, các tổ chức y tế khác;
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, mb: 0.5 }}>
              Thực hiện các hoạt động khác liên quan đến sức khỏe, bổ trợ cho các dịch vụ khám bệnh, chữa bệnh;
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, mb: 0.5 }}>
              Liên lạc với bên cung cấp bảo hiểm của Quý Khách hàng hoặc bên thứ ba thanh toán;
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, mb: 0.5 }}>
              Liên lạc với Quý Khách hàng, bao gồm cung cấp cho Quý Khách hàng thông tin về các sản phẩm/dịch vụ hiện có tại các cơ sở y tế của chúng tôi;
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, mb: 0.5 }}>
              Xử lý các khoản thanh toán của Quý Khách hàng đối với các sản phẩm/dịch vụ cung cấp bởi chúng tôi;
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, mb: 0.5 }}>
              Quản lý hoạt động kinh doanh, vận hành và tuân thủ các chính sách, quy định nội bộ và theo pháp luật;
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, mb: 0.5 }}>
              Lập các báo cáo theo yêu cầu của pháp luật.
            </Typography>
          </Box>

          {/* 3. Bảo vệ dữ liệu cá nhân và các rủi ro tiềm ẩn */}
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}>
            3. Bảo vệ dữ liệu cá nhân và các rủi ro tiềm ẩn
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
            Chúng tôi cam kết, bằng mọi nỗ lực cần thiết và hợp lý, xử lý dữ liệu cá nhân của Quý Khách hàng một cách an toàn, bảo mật và đảm bảo các quyền của Quý Khách hàng tuân thủ theo quy định của pháp luật. Tuy nhiên, một số quyền của Quý Khách hàng với tư cách là chủ thể dữ liệu có thể bị ảnh hưởng và những hậu quả, thiệt hại không mong muốn có thể xảy ra trong một số trường hợp bất khả kháng, không thể lường trước được như mất điện, lỗi phần cứng, sự cố phần mềm, thiên tai, bão, lũ và các trường hợp khác được xem là bất khả kháng.
          </Typography>

          {/* 4. Quyền và nghĩa vụ của Quý Khách hàng */}
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}>
            4. Quyền và nghĩa vụ của Quý Khách hàng
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 1 }}>
            Quý Khách hàng có thể truy cập dữ liệu cá nhân của Quý Khách hàng mà chúng tôi hiện đang nắm giữ. Chúng tôi sẽ xử lý yêu cầu của Quý Khách hàng theo quy định của pháp luật và cung cấp cho Quý Khách hàng dữ liệu cá nhân liên quan trong thời gian hợp lý sau khi nhận được yêu cầu từ Quý Khách hàng.
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 1, fontWeight: "500" }}>
            Một số yêu cầu dưới đây sẽ không được chấp nhận:
          </Typography>

          <Box component="ul" sx={{ ml: 2, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, mb: 0.5 }}>
              Yêu cầu xóa và chỉnh sửa hồ sơ bệnh án;
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, mb: 0.5 }}>
              Yêu cầu che giấu, không cung cấp, cung cấp không đầy đủ hoặc cung cấp sai dữ liệu cá nhân cho cơ quan nhà nước có thẩm quyền hoặc bên thứ ba khác;
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.6, mb: 0.5 }}>
              Yêu cầu xóa dữ liệu của các nhân và/hoặc các giao dịch liên quan khi chúng tôi có nghĩa vụ lưu trữ hồ sơ cá nhân và các giao dịch nhằm tuân thủ nghĩa vụ pháp lý.
            </Typography>
          </Box>

          {/* 5. Thông tin liên hệ */}
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}>
            5. Thông tin liên hệ
          </Typography>

          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 1 }}>
            Nếu Quý Khách hàng có bất kỳ câu hỏi, yêu cầu hoặc có bất kỳ góp ý, phản hồi nào về việc bảo mật dữ liệu cá nhân của mình, Quý Khách hàng vui lòng liên hệ Bộ phận Bảo vệ dữ liệu của chúng tôi theo:
          </Typography>

          <Box 
            sx={{ 
              backgroundColor: "#f0f7ff", 
              border: "1px solid #cce7ff", 
              borderRadius: 1, 
              p: 2, 
              mb: 2 
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "500", mb: 1 }}>
              📞 Tổng đài: 02763 797999
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "500", mb: 1 }}>
              📞 Hotline: 1900 561 510
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "500", mb: 1 }}>
              🚨 Cấp cứu: 0888 79 52 59
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "500", mb: 1 }}>
              📧 Email: info@bvlengoctung.com
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "500" }}>
              📍 Địa chỉ: Số 500 - Cách Mạng Tháng 8, Kp. 3 - P. Tân Ninh - tỉnh Tây Ninh
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography 
            variant="body2" 
            sx={{ 
              lineHeight: 1.6, 
              fontStyle: "italic", 
              color: "#666",
              textAlign: "center"
            }}
          >
            Thông báo này là một phần không thể tách rời các hợp đồng, thỏa thuận và các văn bản mà Quý Khách hàng đã xác lập, ký kết với chúng tôi. Chúng tôi khuyến khích Quý Khách hàng thường xuyên kiểm tra thông tin, thông báo để kịp thời cập nhật bất kỳ thay đổi nào mà chúng tôi có thể thực hiện theo quy định của pháp luật.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, borderTop: "1px solid #eee" }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          startIcon={<InfoOutlinedIcon />}
          sx={{ minWidth: 120 }}
        >
          Đã hiểu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(PolicyDialog);