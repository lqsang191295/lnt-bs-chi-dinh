import { create } from "zustand";
import type { IUserItem } from "@/model/user";

interface iUserState {
  data: IUserItem[];
  setUserData: (d: IUserItem[]) => void;
}

export const useUserStore = create<iUserState>((set) => ({
  data: [],
  setUserData: (d) => set({ data: d }),
}));
