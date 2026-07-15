import React from 'react';
import { Box, Typography } from '@mui/material';
import TradeTable from '../components/market-making/TradeTable';

export default function MarketMakingTrades() {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Histórico de Trades (Market Making)</Typography>
      </Box>
      <TradeTable />
    </Box>
  );
}
