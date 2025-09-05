/**
 * Utility functions để tối ưu hóa việc sử dụng Date objects
 * Tránh gọi new Date() nhiều lần trong cùng một session
 */

// Cache các giá trị Date thường dùng
const CURRENT_DATE = new Date()
const CURRENT_YEAR = CURRENT_DATE.getFullYear()
const MIN_YEAR = CURRENT_YEAR - 100
const MAX_YEAR = CURRENT_YEAR

// Cache các Date objects thường dùng
const TODAY = new Date(CURRENT_YEAR, CURRENT_DATE.getMonth(), CURRENT_DATE.getDate())
const START_OF_YEAR = new Date(CURRENT_YEAR, 0, 1)
const END_OF_YEAR = new Date(CURRENT_YEAR, 11, 31)

export const DateUtils = {
  // Lấy ngày hiện tại (cached)
  getCurrentDate: () => CURRENT_DATE,
  
  // Lấy năm hiện tại (cached)
  getCurrentYear: () => CURRENT_YEAR,
  
  // Lấy khoảng năm cho date picker
  getYearRange: () => ({ min: MIN_YEAR, max: MAX_YEAR }),
  
  // Lấy ngày hôm nay (cached)
  getToday: () => TODAY,
  
  // Lấy đầu năm hiện tại (cached)
  getStartOfYear: () => START_OF_YEAR,
  
  // Lấy cuối năm hiện tại (cached)
  getEndOfYear: () => END_OF_YEAR,
  
  // Format ngày hiện tại theo locale Việt Nam
  getCurrentDateFormatted: (locale: string = "vi-VN") => CURRENT_DATE.toLocaleString(locale),
  
  // Tạo Date mới từ năm, tháng, ngày
  createDate: (year: number, month: number, day: number) => new Date(year, month - 1, day),
  
  // Kiểm tra xem một ngày có phải hôm nay không
  isToday: (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  },
  
  // Format date theo định dạng Việt Nam
  formatVietnamese: (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
  },
  
  // Format datetime theo định dạng Việt Nam
  formatVietnameseDateTime: (date: Date) => {
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  }
}

// Export constants để sử dụng trực tiếp
export {
  CURRENT_DATE,
  CURRENT_YEAR,
  MIN_YEAR,
  MAX_YEAR,
  TODAY,
  START_OF_YEAR,
  END_OF_YEAR
}
