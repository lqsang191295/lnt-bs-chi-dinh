import { create } from "zustand";
import type { IMenuItem } from "@/model/menu";

interface iMenuState {
  data: IMenuItem[];
  setData: (d: IMenuItem[]) => void;
}

export const useMenuStore = create<iMenuState>((set) => ({
  data: [],
  setData: (d) => set({ data: d }),
}));
