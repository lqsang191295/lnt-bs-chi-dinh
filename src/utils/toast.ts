import { toast } from "sonner";

export const ToastSuccess = (mess: string) => {
  toast.success(mess, {
    style: {
      background: "#22c55e", // 🌿 Màu xanh lá sáng (#22c55e là màu xanh của Tailwind)
      color: "#fff", // Chữ trắng
      border: "1px solid #16a34a", // Viền xanh lá đậm hơn
    },
  });
};

export const ToastError = (mess: string) => {
  toast.error(mess, {
    style: {
      background: "#dc2626", // 🔥 Màu đỏ đậm
      color: "#fff", // Chữ trắng
      border: "1px solid #b91c1c", // Viền đỏ đậm hơn
    },
  });
};
