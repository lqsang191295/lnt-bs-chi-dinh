// hooks/useQueue.ts
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentQueueNumbers } from "@/actions/act_dangkykhambenh"
import { ICurrentQueueNumber, IResponse } from "@/model/dangkykhambenh";

async function fetchQueue(maQuay: string): Promise<ICurrentQueueNumber[]> {
  const respone: IResponse<ICurrentQueueNumber[]> = await fetchCurrentQueueNumbers(true, maQuay);
  return respone?.data || [];
}

export function useQueue(maQuay: string) {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["queue", maQuay],
    queryFn: () => fetchQueue(maQuay),
    refetchInterval: 10000, // poll mỗi 10 giây
  });

  // lấy current patient
  const current = data.find((x) => x.MaQuay === maQuay && x.TrangThai === 1) || null;
  // danh sách còn lại
  const queueList = current
    ? data.filter((x) => x.STT !== current.STT)
    : data;

  return {
    currentPatient: current,
    queueList,
    isLoading,
    error,
  };
}
