import type { IMenuItem } from "@/model/tmenu";
import { create } from "zustand";

interface iMenuState {
  data: IMenuItem[];
  setData: (d: IMenuItem[]) => void;
}

export const useMenuStore = create<iMenuState>((set) => ({
  data: [],
  setData: (d) => set({ data: d }),
}));

interface iMenuToggleState {
  toggle: boolean;
  setToggle: (d: boolean) => void;
}

export const useMenuToggleStore = create<iMenuToggleState>((set) => ({
  toggle: false,
  setToggle: (d) => set({ toggle: d }),
}));
