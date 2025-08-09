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

export function getBreadcrumbs(
  menuTree: IMenuTree[],
  clink: string
): IMenuItem[] {
  // Hàm đệ quy để tìm kiếm nút menu và tạo breadcrumbs
  function findPath(
    nodes: IMenuTree[],
    linkToFind: string,
    path: IMenuItem[] = []
  ): IMenuItem[] | null {
    for (const node of nodes) {
      // Thêm nút hiện tại vào đường dẫn
      const newPath = [...path, node];

      // Nếu link của nút hiện tại khớp với link cần tìm, trả về đường dẫn
      if (node.clink === linkToFind) {
        return newPath;
      }

      // Nếu có menu con, tiếp tục tìm kiếm đệ quy
      if (node.children && node.children.length > 0) {
        const foundPath = findPath(node.children, linkToFind, newPath);
        if (foundPath) {
          return foundPath;
        }
      }
    }
    // Nếu không tìm thấy, trả về null
    return null;
  }

  // Gọi hàm đệ quy để tìm đường dẫn từ cây menu gốc
  const breadcrumbs = findPath(menuTree, clink);

  // Nếu tìm thấy, trả về mảng breadcrumbs, ngược lại trả về mảng rỗng
  return breadcrumbs || [];
}
