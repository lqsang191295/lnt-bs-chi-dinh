import { gettDMKhoaPhongs } from "@/actions/act_tdmkhoaphong";
import { getloailuutru } from "@/actions/act_tloailuutru";
import { IDmKhoaPhong } from "@/model/tdmkhoaphong";
import { ILoaiLuuTru } from "@/model/tloailuutru";

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

  static DataDmLoaiLuuTru: ILoaiLuuTru[] = [];
  static async getDmLoaiLuuTru() {
    if (this.DataDmLoaiLuuTru.length > 0) {
      return this.DataDmLoaiLuuTru;
    }

    try {
      const result: ILoaiLuuTru[] = await getloailuutru();
      return result;
    } catch {
      return [];
    }
  }
}
