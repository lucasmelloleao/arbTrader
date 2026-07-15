import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Alert, CircularProgress
} from '@mui/material';
import api from '../api';

export default function ArbitrageTrades() {
  const [trades, setTrades] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const skip = page * rowsPerPage;
      const res = await api.get(`/arbitrage/trades?limit=${rowsPerPage}&skip=${skip}`);
      setTrades(res.data.trades);
      setTotal(res.data.total);
    } catch (err) {
      setError('Erro ao carregar histórico de trades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Histórico de Arbitragem Clássica</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Exchange</TableCell>
                <TableCell>Estratégia</TableCell>
                <TableCell>Pares</TableCell>
                <TableCell>Investimento</TableCell>
                <TableCell>Lucro Estimado</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Nenhum trade encontrado.</TableCell>
                </TableRow>
              ) : (
                trades.map((trade) => (
                  <TableRow hover key={trade._id}>
                    <TableCell>{new Date(trade.created_at).toLocaleString()}</TableCell>
                    <TableCell>{trade.exchange}</TableCell>
                    <TableCell>{trade.strategyName}</TableCell>
                    <TableCell>
                      {trade.route ? trade.route.join(' ➔ ') : 'N/A'}
                    </TableCell>
                    <TableCell>{trade.investmentAmount}</TableCell>
                    <TableCell sx={{ color: trade.estimatedProfit > 0 ? 'success.main' : 'error.main' }}>
                      {trade.estimatedProfit?.toFixed(4) || '0.0000'}
                    </TableCell>
                    <TableCell>{trade.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[15, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
        />
      </Paper>
    </Box>
  );
}
