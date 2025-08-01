// utils/menu.ts
import type { IMenuItem, IMenuTree } from "@/model/menu";

export function buildMenuTree(data: IMenuItem[]): IMenuTree[] {
  const map = new Map<number, IMenuTree>();
  const tree: IMenuTree[] = [];

  data.forEach((item) => {
    map.set(item.cid, { ...item, children: [] });
  });

  data.forEach((item) => {
    const current = map.get(item.cid)!;
    if (item.cidcha && item.cidcha !== 0) {
      const parent = map.get(item.cidcha);
      parent?.children?.push(current);
    } else {
      tree.push(current);
    }
  });

  return tree;
}
