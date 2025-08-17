import { useEffect } from "react";

export default function HeadMetadata() {
  useEffect(() => {
    document.title = "Quản lý người dùng";
  }, []);

  return null;
}
