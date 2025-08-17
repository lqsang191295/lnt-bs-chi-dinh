"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HSBAMoPage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/tra-cuu-hsba");
  }, [router]);

  return null;
}
