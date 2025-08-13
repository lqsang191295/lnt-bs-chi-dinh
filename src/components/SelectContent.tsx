"use client";
import { Stack } from "@mui/material";
import Image from "next/image";

export default function SelectContent() {
  return (
    <div className="flex items-center">
      <Image src="/logo.png" alt="Logo" width={32} height={32} />
      <Stack spacing={1}>
        <span className="font-bold text-xs">
          BỆNH VIỆN ĐA KHOA LÊ NGỌC TÙNG
        </span>
        <span className="text-xs text-gray-500">HỆ THỐNG EMR</span>
      </Stack>
    </div>
    // <Select
    //   labelId="company-select"
    //   id="company-simple-select"
    //   value={company}
    //   onChange={handleChange}
    //   displayEmpty
    //   inputProps={{ "aria-label": "Select company" }}
    //   fullWidth
    //   sx={{
    //     maxHeight: 56,
    //     width: 215,
    //     "&.MuiList-root": {
    //       p: "8px",
    //     },
    //     [`& .${selectClasses.select}`]: {
    //       display: "flex",
    //       alignItems: "center",
    //       gap: "2px",
    //       pl: 1,
    //     },
    //   }}>
    //   <ListSubheader sx={{ pt: 0 }}>Production</ListSubheader>
    //   <MenuItem value="">
    //     <ListItemAvatar>
    //       <Avatar alt="Sitemark web">
    //         <DevicesRoundedIcon sx={{ fontSize: "1rem" }} />
    //       </Avatar>
    //     </ListItemAvatar>
    //     <ListItemText primary="Sitemark-web" secondary="Web app" />
    //   </MenuItem>
    //   <MenuItem value={10}>
    //     <ListItemAvatar>
    //       <Avatar alt="Sitemark App">
    //         <SmartphoneRoundedIcon sx={{ fontSize: "1rem" }} />
    //       </Avatar>
    //     </ListItemAvatar>
    //     <ListItemText primary="Sitemark-app" secondary="Mobile application" />
    //   </MenuItem>
    //   <MenuItem value={20}>
    //     <ListItemAvatar>
    //       <Avatar alt="Sitemark Store">
    //         <DevicesRoundedIcon sx={{ fontSize: "1rem" }} />
    //       </Avatar>
    //     </ListItemAvatar>
    //     <ListItemText primary="Sitemark-Store" secondary="Web app" />
    //   </MenuItem>
    //   <ListSubheader>Development</ListSubheader>
    //   <MenuItem value={30}>
    //     <ListItemAvatar>
    //       <Avatar alt="Sitemark Store">
    //         <ConstructionRoundedIcon sx={{ fontSize: "1rem" }} />
    //       </Avatar>
    //     </ListItemAvatar>
    //     <ListItemText primary="Sitemark-Admin" secondary="Web app" />
    //   </MenuItem>
    //   <Divider sx={{ mx: -1 }} />
    //   <MenuItem value={40}>
    //     <ListItemIcon>
    //       <AddRoundedIcon />
    //     </ListItemIcon>
    //     <ListItemText primary="Add product" secondary="Web app" />
    //   </MenuItem>
    // </Select>
  );
}
