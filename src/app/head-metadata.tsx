import { useEffect } from "react";

export default function HeadMetadata() {
  useEffect(() => {
    document.title = "BỆNH ÁN ĐIỆN TỬ";
  }, []);

  return null;
}
