"use client";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import CardAlert from "./CardAlert";
import MenuContent from "./MenuContent";
import SelectContent from "./SelectContent";

const drawerWidth = 320;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  return (
    <Drawer variant="permanent">
      <Box
        sx={{
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}>
        <SelectContent />
      </Box>
      <Divider />
      <Box
        className="h-full relative"
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}>
        <MenuContent />
        <CardAlert />
      </Box>
    </Drawer>
  );
}
