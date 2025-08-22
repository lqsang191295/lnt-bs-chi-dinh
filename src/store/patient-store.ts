import { create } from "zustand";

export type tPatient = {
  phone: number;
  logged: boolean;
};

interface PatientState {
  patient: tPatient | null;
  setPhone: (phone: number) => void;
  setLogged: (logged: boolean) => void;
}

const usePatientStore = create<PatientState>((set, get) => ({
  patient: null,

  setPhone: (phone: number) => {
    const current = get().patient;
    if (current) {
      set({ patient: { ...current, phone } });
    } else {
      set({ patient: { phone, logged: false } }); // hoặc default logged tùy ý
    }
  },

  setLogged: (logged: boolean) => {
    const current = get().patient;
    if (current) {
      set({ patient: { ...current, logged } });
    } else {
      set({ patient: { phone: 0, logged } }); // hoặc default phone tùy ý
    }
  },
}));

export { usePatientStore };
