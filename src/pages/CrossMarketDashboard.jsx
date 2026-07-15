import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControlLabel, Switch, Select, MenuItem,
  FormControl, InputLabel, Alert, CircularProgress, Chip
} from '@mui/material';
import api from '../api';

export default function CrossMarketDashboard() {
  const [strategies, setStrategies] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    exchange1: '',
    exchange2: '',
    asset1: 'BTC',
    asset2: 'USDT',
    operationAmount: 100,
    minSpreadPercent: 0.2,
    maxSlippagePercent: 0.1,
    tradingFeePercent: 0.1,
    scanIntervalMs: 3000,
    enableLiveTrading: false,
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stratsRes, exchRes] = await Promise.all([
        api.get('/cross-market'),
        api.get('/exchanges')
      ]);
      setStrategies(stratsRes.data.strategies || []);
      setExchanges(exchRes.data.exchanges || []);
    } catch (err) {
      setError('Erro ao carregar dados cross-market');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (strat = null) => {
    if (strat) {
      setEditingId(strat._id);
      setFormData({
        name: strat.name || '',
        exchange1: strat.exchange1 || '',
        exchange2: strat.exchange2 || '',
        asset1: strat.asset1 || 'BTC',
        asset2: strat.asset2 || 'USDT',
        operationAmount: strat.operationAmount || 100,
        minSpreadPercent: strat.minSpreadPercent || 0.2,
        maxSlippagePercent: strat.maxSlippagePercent || 0.1,
        tradingFeePercent: strat.tradingFeePercent || 0.1,
        scanIntervalMs: strat.scanIntervalMs || 3000,
        enableLiveTrading: strat.enableLiveTrading || false,
        notes: strat.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', exchange1: '', exchange2: '', asset1: 'BTC', asset2: 'USDT',
        operationAmount: 100, minSpreadPercent: 0.2, maxSlippagePercent: 0.1,
        tradingFeePercent: 0.1, scanIntervalMs: 3000, enableLiveTrading: false, notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        operationAmount: Number(formData.operationAmount),
        minSpreadPercent: Number(formData.minSpreadPercent),
        maxSlippagePercent: Number(formData.maxSlippagePercent),
        tradingFeePercent: Number(formData.tradingFeePercent),
        scanIntervalMs: Number(formData.scanIntervalMs),
      };

      if (editingId) {
        await api.put(`/cross-market/${editingId}`, payload);
      } else {
        await api.post('/cross-market', payload);
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar estratégia');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deletar estratégia?')) return;
    try {
      await api.delete(`/cross-market/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao deletar');
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.patch(`/cross-market/${id}/toggle`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao alterar status');
    }
  };

  if (loading && strategies.length === 0) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Estratégias Cross-Market</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>Nova Estratégia</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {strategies.map(st => (
          <Grid item xs={12} sm={6} md={4} key={st._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{st.name}</Typography>
                  <Chip 
                    label={st.active ? 'Ativa' : 'Inativa'} 
                    color={st.active ? 'success' : 'default'} 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Corretoras: {st.exchange1} ⟷ {st.exchange2}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ativos: {st.asset1}/{st.asset2}
                </Typography>
                <Typography variant="body2" color="text.secondary">Investimento: {st.operationAmount}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => toggleActive(st._id)}>
                  {st.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button size="small" onClick={() => handleOpen(st)}>Editar</Button>
                <Button size="small" color="error" onClick={() => handleDelete(st._id)}>Remover</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? `Editar Estratégia` : `Nova Estratégia`}</DialogTitle>
        <DialogContent dividers>
          <form id="strategy-form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Nome da Estratégia" name="name" value={formData.name} onChange={handleChange} required margin="dense" />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Corretora 1</InputLabel>
                  <Select name="exchange1" value={formData.exchange1} onChange={handleChange} required label="Corretora 1">
                    {exchanges.map(ex => <MenuItem key={ex.acronym} value={ex.acronym}>{ex.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Corretora 2</InputLabel>
                  <Select name="exchange2" value={formData.exchange2} onChange={handleChange} required label="Corretora 2">
                    {exchanges.map(ex => <MenuItem key={ex.acronym} value={ex.acronym}>{ex.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={6}>
                <TextField fullWidth label="Ativo 1 (ex: BTC, ETH)" name="asset1" value={formData.asset1} onChange={handleChange} required margin="dense" />
              </Grid>
              <Grid item xs={6} sm={6}>
                <TextField fullWidth label="Ativo 2 (ex: USDT, USDC)" name="asset2" value={formData.asset2} onChange={handleChange} required margin="dense" />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField fullWidth type="number" label="Tamanho da Op. (Asset 2)" name="operationAmount" value={formData.operationAmount} onChange={handleChange} margin="dense" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth type="number" inputProps={{ step: "any" }} label="Spread Mínimo (%)" name="minSpreadPercent" value={formData.minSpreadPercent} onChange={handleChange} margin="dense" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth type="number" inputProps={{ step: "any" }} label="Slippage Máx (%)" name="maxSlippagePercent" value={formData.maxSlippagePercent} onChange={handleChange} margin="dense" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth type="number" inputProps={{ step: "any" }} label="Taxa Taker (%)" name="tradingFeePercent" value={formData.tradingFeePercent} onChange={handleChange} margin="dense" />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={formData.enableLiveTrading} onChange={handleChange} name="enableLiveTrading" color="warning" />}
                  label="Executar Ordens Reais (Live Trading)"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
