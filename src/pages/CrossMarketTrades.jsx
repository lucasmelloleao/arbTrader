import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Alert, CircularProgress,
  Button, TextField, Grid, MenuItem, Card, CardContent
} from '@mui/material';
import api from '../api';

export default function CrossMarketTrades() {
  const [trades, setTrades] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError('');
      const skip = page * rowsPerPage;
      let url = `/cross-market/trades?limit=${rowsPerPage}&skip=${skip}`;
      
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      
      const res = await api.get(url);
      setTrades(res.data.trades || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Erro ao carregar histórico de operações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [page, rowsPerPage]);

  const handleConsult = () => {
    setPage(0); // Reset page to 0 on new consult
    fetchTrades();
  };

  const handleDeleteHistory = async () => {
    if (!startDate || !endDate) {
      alert("Por favor, selecione a Data Inicial e Data Final para deletar o histórico.");
      return;
    }
    if (!window.confirm(`Tem certeza que deseja deletar o histórico de ${startDate} até ${endDate}?`)) return;

    try {
      setLoading(true);
      let url = `/cross-market/history?startDate=${startDate}&endDate=${endDate}`;
      const res = await api.delete(url);
      alert(res.data.message || 'Histórico deletado com sucesso.');
      setPage(0);
      fetchTrades();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao deletar histórico.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4">Histórico de Operações</Typography>
          <Typography variant="subtitle1" color="success.main" sx={{ mt: 1, fontWeight: 'bold' }}>
            Lucro Estimado (Página): {trades.filter(t => t.status?.toUpperCase() === 'SUCCESS' || t.status?.toUpperCase() === 'SUCESSO').reduce((acc, t) => acc + (t.estimatedProfit || 0), 0).toFixed(4)}
          </Typography>
        </Box>
        
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="Data Inicial"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
          />
          <TextField
            label="Data Final"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
          />
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="SUCCESS">Sucesso</MenuItem>
            <MenuItem value="FAILED">Falha</MenuItem>
          </TextField>
          <Button variant="contained" color="primary" onClick={handleConsult}>
            Consultar
          </Button>
          <Button variant="outlined" color="error" onClick={handleDeleteHistory}>
            Deletar Histórico
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Estratégia</TableCell>
                <TableCell>Rota</TableCell>
                <TableCell>Ativos</TableCell>
                <TableCell>Lucro Estimado</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Nenhuma operação encontrada.</TableCell>
                </TableRow>
              ) : (
                trades.map((trade) => (
                  <TableRow hover key={trade._id}>
                    <TableCell>{new Date(trade.created_at).toLocaleString()}</TableCell>
                    <TableCell>{trade.strategyName}</TableCell>
                    <TableCell>{trade.buyExchange} ➔ {trade.sellExchange}</TableCell>
                    <TableCell>{trade.asset}</TableCell>
                    <TableCell sx={{ color: trade.estimatedProfit > 0 ? 'success.main' : 'error.main' }}>
                      {(trade.status?.toUpperCase() === 'SUCCESS' || trade.status?.toUpperCase() === 'SUCESSO')
                        ? `${trade.estimatedProfit?.toFixed(4) || '0.0000'} ${trade.quoteAsset || ''}`
                        : '-'}
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
