"use client";

import { getPatientToken } from "@/utils/patient";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const token = getPatientToken();

  console.log("= ==token ", token);
  if (!token || !token.logged) {
    return router.push(`/lich-su-kham?mabn=${id}`);
  }

  return <div className="flex h-screen flex-col md:flex-row">Lich su kham</div>;
}
