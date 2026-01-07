import { IPatientInfoCanKyTay } from "@/model/tpatient";
import AddBoxIcon from "@mui/icons-material/AddBox";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import { styled } from "@mui/material/styles";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";

const CustomTreeItem = styled(TreeItem)({
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
});

function CloseSquare(props: SvgIconProps) {
  return (
    <SvgIcon
      className="close"
      fontSize="inherit"
      style={{ width: 14, height: 14 }}
      {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

export default function CustomIcons({
  rows,
  onSelectPatient,
}: {
  rows: IPatientInfoCanKyTay[];
  onSelectPatient: (patient: IPatientInfoCanKyTay | null) => void;
}) {
  const groupPatientToTreeItems = (
    data: IPatientInfoCanKyTay[]
  ): TreeViewBaseItem[] => {
    const map = new Map<string, TreeViewBaseItem>();

    data.forEach((item) => {
      // 🔑 KEY GROUP – TUYỆT ĐỐI KHÔNG GẮN item.ID
      const groupId = `bn_${item.Ma}_${item.Sovaovien}`;

      if (!map.has(groupId)) {
        map.set(groupId, {
          id: groupId,
          label: `${item.Hoten} (${item.Gioitinh} - ${item.Namsinh})`,
          children: [],
        });
      }

      const parent = map.get(groupId)!;

      // ✅ ID node con PHẢI DUY NHẤT
      parent.children!.push({
        id: `${groupId}_phieu_${item.ID}`, // 👈 dùng item.ID ở đây
        label: item.LoaiPhieu.replaceAll("_", " "),
        data: item, // gắn full object
      } as TreeViewBaseItem);
    });

    return Array.from(map.values());
  };

  const getRowByItemId = (itemId: string): IPatientInfoCanKyTay | null => {
    const match = itemId.match(/_phieu_(.+)$/);
    if (!match) return null;

    const phieuId = match[1];

    return rows.find((x) => String(x.ID) === phieuId) ?? null;
  };

  const handleSelect = (
    event: React.SyntheticEvent | null,
    itemId: string | null
  ) => {
    console.log("Selected item ID:", itemId);

    if (!itemId) {
      if (onSelectPatient) onSelectPatient(null);
      return;
    }

    console.log(
      "Getting row for item ID getRowByItemId(itemId):",
      getRowByItemId(itemId)
    );

    if (onSelectPatient) onSelectPatient(getRowByItemId(itemId));
  };

  return (
    <RichTreeView
      defaultExpandedItems={["grid"]}
      slots={{
        expandIcon: AddBoxIcon,
        collapseIcon: IndeterminateCheckBoxIcon,
        endIcon: CloseSquare,
        item: CustomTreeItem,
      }}
      items={groupPatientToTreeItems(rows)}
      //   selectedItems={selectedItems}
      onSelectedItemsChange={handleSelect}
      multiSelect={false}
    />
  );
}
