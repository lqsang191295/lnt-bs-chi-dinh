// utils/menu.ts
import type { IMenuItem, IMenuTree } from "@/model/tmenu";

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

export function getBreadcrumbs(
  menuTree: IMenuTree[],
  linkToFind: string
): IMenuItem[] {
  // Chuẩn hóa pathname: bỏ dấu "/" ở đầu và cuối
  const normalize = (link: string) =>
    link.replace(/^\/+|\/+$/g, "").toLowerCase();

  const target = normalize(linkToFind);

  function findPath(
    nodes: IMenuTree[],
    path: IMenuItem[] = []
  ): IMenuItem[] | null {
    for (const node of nodes) {
      const newPath = [...path, node];

      // Chuẩn hóa clink của menu node
      const nodeLink = node.clink ? normalize(node.clink) : "";

      // Match nếu giống hệt hoặc target bắt đầu bằng nodeLink
      if (nodeLink && (target === nodeLink || target.startsWith(nodeLink))) {
        if (target === nodeLink) {
          return newPath;
        }
        // Nếu còn children thì tiếp tục tìm
        if (node.children && node.children.length > 0) {
          const found = findPath(node.children, newPath);
          if (found) return found;
        }
      } else {
        // Nếu không match link nhưng vẫn có children → tiếp tục tìm
        if (node.children && node.children.length > 0) {
          const found = findPath(node.children, newPath);
          if (found) return found;
        }
      }
    }
    return null;
  }

  return findPath(menuTree) || [];
}
