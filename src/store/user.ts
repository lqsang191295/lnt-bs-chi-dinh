import { create } from "zustand";
import type { IUserItem } from "@/model/tuser";

interface iUserState {
  data: IUserItem;
  setUserData: (d: IUserItem) => void;
}

export const useUserStore = create<iUserState>((set) => ({
  data: null as unknown as IUserItem,
  setUserData: (d) => set({ data: d }),
}));
