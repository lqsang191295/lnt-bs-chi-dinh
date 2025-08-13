import { gettDMKhoaPhongs } from "@/actions/emr_tdmkhoaphong";
import { IDmKhoaPhong } from "@/model/tdmkhoaphong";

export class DataManager {
  static DataKhoaPhong: { value: string; label: string }[] = [];
  static async getDmKhoaPhong() {
    if (this.DataKhoaPhong.length > 0) {
      return this.DataKhoaPhong;
    }

    try {
      const result: IDmKhoaPhong[] = await gettDMKhoaPhongs();
      if (Array.isArray(result)) {
        const mapped = result.map((item) => ({
          value: item.cmakhoa,
          label: item.ckyhieu + " - " + item.ctenkhoa,
        }));
        this.DataKhoaPhong = [{ value: "all", label: "Tất cả" }, ...mapped];
      }
    } catch (error) {
      console.error("Error fetching khoa list:", error);
    }

    return this.DataKhoaPhong;
  }
}
