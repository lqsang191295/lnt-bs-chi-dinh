"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token-patient");

    if (token) {
      setIsChecking(false);
      return;
    }

    if (!token) {
      return router.push(`/lich-su-kham?mabn=${id}`);
    }
  }, [id, router]);

  if (isChecking) return null;

  return <div className="flex h-screen flex-col md:flex-row">Lich su kham</div>;
}
