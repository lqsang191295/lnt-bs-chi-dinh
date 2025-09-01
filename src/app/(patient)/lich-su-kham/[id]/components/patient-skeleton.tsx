"use client";

import { Box, Skeleton, Stack } from "@mui/material";

export function PatientInfoSkeleton() {
  return (
    <Stack direction="row" spacing={3} alignItems="center">
      <Skeleton variant="circular" width={72} height={72} />
      <Box>
        <Skeleton variant="text" width={200} height={30} />
        <Skeleton variant="text" width={150} height={20} />
        <Skeleton variant="text" width={180} height={20} />
      </Box>
    </Stack>
  );
}

export function PatientLsKhamSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width={200} height={30} sx={{ mb: 2 }} />
      {Array.from(new Array(3)).map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={60}
          sx={{ mb: 2, borderRadius: 1 }}
        />
      ))}
    </Box>
  );
}
