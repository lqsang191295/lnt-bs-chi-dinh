export class HT_ThamSo {
  Ma!: string;
  Thamso!: string;
  Diengiai?: string | null;
  UPDATE_DATE?: string | null;

  constructor(init?: Partial<HT_ThamSo>) {
    Object.assign(this, init);
  }
}
