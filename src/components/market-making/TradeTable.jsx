// src/components/market-making/TradeTable.jsx
import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, CircularProgress, Alert } from '@mui/material';
import useMarketMaking from '../../hooks/useMarketMaking';

/**
 * Table displaying the latest 50 market‑making trades.
 * Uses the same glass‑style aesthetics as the rest of the UI.
 */
export default function TradeTable() {
  const { trades, loadingTrades, error } = useMarketMaking();

  if (loadingTrades) return <CircularProgress color="inherit" />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <TableContainer component={Paper} sx={{ background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(12px)' }}>
      <Table size="small" sx={{ minWidth: 650, color: 'white' }}>
        <TableHead sx={{ background: 'rgba(0,0,0,0.3)' }}>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Estratégia</TableCell>
            <TableCell>Par</TableCell>
            <TableCell>Spread</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Nenhum registro encontrado.
              </TableCell>
            </TableRow>
          ) : (
            trades.map((t) => (
              <TableRow key={t._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                <TableCell>{t.strategyName}</TableCell>
                <TableCell>
                  <span style={{ background: '#1e1e1e', padding: '2px 6px', borderRadius: '4px' }}>{t.exchange}</span> {t.symbol}
                </TableCell>
                <TableCell>
                  <span style={{ color: '#34d399' }}>{t.spreadPercent?.toFixed(2)}%</span>
                </TableCell>
                <TableCell>
                  <span
                    style={
                      t.status === 'success'
                        ? { background: '#0f172a', color: '#34d399', padding: '2px 6px', borderRadius: '4px' }
                        : t.status === 'simulated'
                        ? { background: '#0f172a', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px' }
                        : { background: '#0f172a', color: '#f87171', padding: '2px 6px', borderRadius: '4px' }
                    }
                  >
                    {t.status}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
