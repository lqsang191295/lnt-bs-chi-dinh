export const formatDisplayDate = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export const getTextBirthday = (
  ngay?: string | null,
  thang?: string | null,
  nam?: string | null
) => {
  const parts = [ngay, thang, nam].filter(Boolean);
  return parts.join("/");
};

export const StringToDate = (text: string) => {
  const date = new Date(text);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Chuyển sang HH:MM
export const StringToTime = (text: string) => {
  const date = new Date(text);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
