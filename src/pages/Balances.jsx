import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Grid, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Slider, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import api from '../api';

export default function Balances() {
  const [exchanges, setExchanges] = useState([]);
  const [balancesMap, setBalancesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalUsdt, setTotalUsdt] = useState(0);

  // Simple Trades History
  const [trades, setTrades] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [totalTrades, setTotalTrades] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Trade Modal
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeForm, setTradeForm] = useState({
    exchange: '', coin: '', free: 0, price: 0,
    side: 'sell', mode: 'base', amount: 0, percentage: 100
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exchanges');
      const activeEx = (res.data.exchanges || []).filter(e => e.active);
      setExchanges(activeEx);

      let newTotal = 0;
      const newMap = {};

      for (const ex of activeEx) {
        try {
          const balRes = await api.get(`/cross-market/${ex.acronym}/balances`);
          const exchangeData = balRes.data.balances?.find(b => b.exchange === ex.acronym.toUpperCase());
          let assets = exchangeData?.assets || [];
          assets = assets.filter(a => a.valueUsdt >= 0.1);
          newMap[ex.acronym] = assets;

          assets.forEach(a => {
            if (typeof a.valueUsdt === 'number') newTotal += a.valueUsdt;
          });
        } catch (err) {
          console.error(`Error loading balances for ${ex.acronym}`, err);
          newMap[ex.acronym] = [];
        }
      }
      setBalancesMap(newMap);
      setTotalUsdt(newTotal);
    } catch (err) {
      setError('Erro ao carregar corretoras ou saldos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimpleTrades = async () => {
    try {
      const skip = page * rowsPerPage;
      const res = await api.get(`/cross-market/simple-trades?limit=${rowsPerPage}&skip=${skip}`);
      setTrades(res.data.trades || []);
      setTotalTrades(res.data.total || 0);
    } catch (err) {
      console.error('Erro ao carregar trades simples', err);
    }
  };

  useEffect(() => {
    const fetchTransferHistory = async () => {
      try {
        const res = await api.get('/transfers/history');
        setTransferHistory(res.data.history || []);
      } catch (err) {
        console.error('Error fetching transfer history', err);
      }
    };

    fetchData();
    fetchTransferHistory();
  }, []);

  useEffect(() => {
    fetchSimpleTrades();
  }, [page, rowsPerPage]);

  const handleOpenTrade = (exchange, asset) => {
    setTradeForm({
      exchange: exchange.toUpperCase(),
      coin: (asset.currency || asset.coin).toUpperCase(),
      free: asset.free || asset.available || 0,
      price: asset.price || 0,
      side: 'sell',
      mode: 'base',
      amount: asset.free || asset.available || 0,
      percentage: 100
    });
    setTradeOpen(true);
  };

  const handleCloseTrade = () => setTradeOpen(false);

  const executeTrade = async () => {
    try {
      const symbol = `${tradeForm.coin}/USDC`;
      let amount = tradeForm.amount;
      if (tradeForm.mode === 'quote') {
        amount = tradeForm.price > 0 ? (tradeForm.amount / tradeForm.price) : 0;
      }
      
      await api.post(`/cross-market/${tradeForm.exchange}/trade`, {
        symbol, side: tradeForm.side, amount
      });
      alert('Trade executado com sucesso!');
      setTradeOpen(false);
      fetchData();
      fetchSimpleTrades();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao executar trade');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">Carteira</Typography>
          <Typography variant="h4">Saldos Consolidados</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Paper sx={{ p: 2, bgcolor: 'rgba(125, 249, 193, 0.05)', borderColor: 'rgba(125, 249, 193, 0.4)', border: 1 }}>
            <Typography variant="caption" color="primary">Saldo Geral Estimado</Typography>
            <Typography variant="h6">$ {totalUsdt.toFixed(2)}</Typography>
          </Paper>
          <Button variant="contained" color="primary" onClick={fetchData} disabled={loading}>
            Atualizar Saldos
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3} mb={5}>
          {exchanges.map(ex => (
            <Grid item xs={12} key={ex.acronym}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{ex.name}</Typography>
                  <Typography variant="h6" color="primary">
                    Total: $ {balancesMap[ex.acronym]?.reduce((sum, asset) => sum + (asset.valueUsdt || 0), 0).toFixed(2) || '0.00'} USDT
                  </Typography>
                </Box>
                {balancesMap[ex.acronym]?.length > 0 ? (
                  <Grid container spacing={2}>
                    {balancesMap[ex.acronym].map((asset, i) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                        <Box sx={{ p: 2, border: '1px solid #333', borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">{(asset.currency || asset.coin).toUpperCase()}</Typography>
                            <Typography variant="subtitle1" color="primary">$ {asset.valueUsdt?.toFixed(2)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexGrow: 1 }}>
                            <Typography variant="body2" color="text.secondary">Disp: {asset.free?.toFixed(4)}</Typography>
                            <Typography variant="body2" color="text.secondary">Total: {(asset.free + (asset.used || 0)).toFixed(4)}</Typography>
                          </Box>
                          <Box sx={{ mt: 'auto', pt: 1, textAlign: 'right', borderTop: '1px solid #333' }}>
                            <Button size="small" variant="outlined" onClick={() => handleOpenTrade(ex.acronym, asset)}>
                              Trade
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">Sem saldos relevantes.</Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Box mb={4}>
        <Typography variant="h5" mb={2}>Histórico de Transferências</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Rota</TableCell>
                <TableCell>Moeda</TableCell>
                <TableCell>Qtd</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transferHistory.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">Nenhum histórico</TableCell></TableRow>
              ) : (
                transferHistory.map(item => (
                  <TableRow hover key={item._id}>
                    <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                    <TableCell>{item.exchange} ➔ {item.targetExchange || '?'}</TableCell>
                    <TableCell>{item.currency}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box mb={2}>
        <Typography variant="h5">Trades Diretos (Histórico)</Typography>
      </Box>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Corretora</TableCell>
                <TableCell>Par</TableCell>
                <TableCell>Operação</TableCell>
                <TableCell align="right">Qtde</TableCell>
                <TableCell align="right">Preço</TableCell>
                <TableCell align="right">Total Est.</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trades.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center">Nenhum trade encontrado.</TableCell></TableRow>
              ) : (
                trades.map(t => (
                  <TableRow hover key={t._id}>
                    <TableCell>{new Date(t.created_at || t.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{t.exchange}</TableCell>
                    <TableCell>{t.symbol}</TableCell>
                    <TableCell sx={{ color: t.side === 'buy' ? 'success.main' : 'error.main' }}>
                      {t.side.toUpperCase()}
                    </TableCell>
                    <TableCell align="right">{t.amount?.toFixed(6)}</TableCell>
                    <TableCell align="right">{t.price?.toFixed(4)}</TableCell>
                    <TableCell align="right">$ {(t.amount * t.price)?.toFixed(2)}</TableCell>
                    <TableCell>{t.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalTrades}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>

      {/* Trade Modal */}
      <Dialog open={tradeOpen} onClose={handleCloseTrade} maxWidth="xs" fullWidth>
        <DialogTitle>Trade Simples - {tradeForm.exchange}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <ToggleButtonGroup
              color="primary"
              value={tradeForm.side}
              exclusive
              onChange={(e, val) => val && setTradeForm(p => ({...p, side: val}))}
              fullWidth
            >
              <ToggleButton value="buy" sx={{ color: 'success.main', '&.Mui-selected': { bgcolor: 'success.main', color: 'white' }}}>COMPRA</ToggleButton>
              <ToggleButton value="sell" sx={{ color: 'error.main', '&.Mui-selected': { bgcolor: 'error.main', color: 'white' }}}>VENDA</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="body2">Ativo: {tradeForm.coin} / USDC</Typography>

            <ToggleButtonGroup
              color="primary"
              value={tradeForm.mode}
              exclusive
              onChange={(e, val) => val && setTradeForm(p => ({...p, mode: val}))}
              fullWidth
            >
              <ToggleButton value="base">Qtde ({tradeForm.coin})</ToggleButton>
              <ToggleButton value="quote">Valor (USDC)</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              label={tradeForm.mode === 'base' ? 'Quantidade' : 'Valor Total'}
              type="number"
              value={tradeForm.amount}
              onChange={e => setTradeForm(p => ({...p, amount: Number(e.target.value)}))}
              fullWidth
            />
            
            <Box>
              <Typography variant="body2">USDC Estimado: $ {tradeForm.mode === 'base' ? (tradeForm.amount * tradeForm.price).toFixed(2) : tradeForm.amount.toFixed(2)}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTrade}>Cancelar</Button>
          <Button onClick={executeTrade} variant="contained" color={tradeForm.side === 'buy' ? 'success' : 'error'}>
            Executar {tradeForm.side.toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
