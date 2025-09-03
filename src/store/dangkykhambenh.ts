import { create } from "zustand";
import { IBenhNhan, IDangKyKhamBenh, IPhieuDangKy } from "@/model/dangkykhambenh";

interface IDangKyKhamBenhState {
  // State cho bệnh nhân
  benhNhan: IBenhNhan | null;
  benhNhanList: IBenhNhan[];
  
  // State cho đăng ký khám
  phieuDangKy: IPhieuDangKy | null;
  
  // State cho UI
  isLoading: boolean;
  currentStep: "home" | "search" | "scan" | "register" | "faceAuth" | "success";
  searchQuery: string;
  
  // Actions
  setBenhNhan: (benhNhan: IBenhNhan | null) => void;
  setBenhNhanList: (list: IBenhNhan[]) => void;
  setPhieuDangKy: (phieu: IPhieuDangKy | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentStep: (step: "home" | "search" | "scan" | "register" | "faceAuth" | "success") => void;
  setSearchQuery: (query: string) => void;
  
  // Reset state
  resetState: () => void;
}

const initialState = {
  benhNhan: null,
  benhNhanList: [],
  phieuDangKy: null,
  isLoading: false,
  currentStep: "home" as const,
  searchQuery: "",
};

export const useDangKyKhamBenhStore = create<IDangKyKhamBenhState>((set) => ({
  ...initialState,
  
  setBenhNhan: (benhNhan) => set({ benhNhan }),
  setBenhNhanList: (list) => set({ benhNhanList: list }),
  setPhieuDangKy: (phieu) => set({ phieuDangKy: phieu }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  resetState: () => set(initialState),
}));
