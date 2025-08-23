"use client";
import { useMenuToggleStore } from "@/store/menu";
import { Box, styled } from "@mui/material";
import Divider from "@mui/material/Divider";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
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

export default function SideMenuMobile() {
  const { toggle, setToggle } = useMenuToggleStore();

  const toggleDrawer = (toggle: boolean) => () => {
    setToggle(toggle);
  };

  return (
    <Drawer
      className="!block xl:!hidden"
      anchor="left"
      open={toggle}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none",
          backgroundColor: "background.paper",
        },
      }}>
      <Stack
        sx={{
          maxWidth: "70dvw",
          height: "100%",
        }}>
        <Box
          sx={{
            display: "flex",
            p: 1.5,
          }}>
          <SelectContent />
        </Box>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <CardAlert />
      </Stack>
    </Drawer>
  );
}
