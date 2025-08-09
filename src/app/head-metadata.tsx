import { useEffect } from "react";

export default function HeadMetadata() {
  useEffect(() => {
    document.title = "HỒ SƠ BỆNH ÁN";
  }, []);

  return null;
}
