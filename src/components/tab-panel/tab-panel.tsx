import { Box } from '@material-ui/core';
import React from 'react';

type TabPanelProps = {
  index: number;
  currentIndex: number;
  children: React.ReactNode;
  className?: string;
};

export function TabPanel({ index, currentIndex, children, className }: TabPanelProps) {
  return (
    // @ts-ignore
    <Box className={className} py={3} style={{ display: index !== currentIndex && 'none' }}>
      {children}
    </Box>
  );
}
