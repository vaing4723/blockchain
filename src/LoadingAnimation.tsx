import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingAnimation = () => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="200px">
    <CircularProgress size={60} />
    <Typography variant="h6" style={{ marginTop: '20px' }}>正在加载钱包数据...</Typography>
  </Box>
);

export default LoadingAnimation;