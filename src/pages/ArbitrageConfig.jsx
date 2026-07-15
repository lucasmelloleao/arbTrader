import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControlLabel, Switch, Select, MenuItem,
  FormControl, InputLabel, Alert, CircularProgress, Chip
} from '@mui/material';
import api from '../api';

export default function ArbitrageConfig() {
  const [strategies, setStrategies] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    exchange: '',
    assetsMode: 'list',
    startAssets: 'USDC',
    bridgeAssets: 'BTC,ETH,SOL',
    targetAssets: 'ETH,SOL,XRP',
    investmentAmount: 100,
    tradingFee: 0.001,
    scanIntervalMs: 3000,
    maxTrianglesPerCycle: 8,
    orderBookDepth: 10,
    maxSpreadPercent: 0.2,
    minVolumeBuffer: 1.05,
    minProfitPercent: 0.1,
    maxSlippagePercent: 0.15,
    chunkSize: 15,
    enableLiveTrading: false,
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stratsRes, exchRes] = await Promise.all([
        api.get('/arbitrage/strategies'),
        api.get('/exchanges')
      ]);
      setStrategies(Array.isArray(stratsRes.data) ? stratsRes.data : []);
      setExchanges(exchRes.data?.exchanges || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados');
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
        exchange: strat.exchange || '',
        assetsMode: strat.assetsMode || 'list',
        startAssets: strat.startAssets ? strat.startAssets.join(',') : 'USDC',
        bridgeAssets: strat.bridgeAssets ? strat.bridgeAssets.join(',') : 'BTC,ETH,SOL',
        targetAssets: strat.targetAssets ? strat.targetAssets.join(',') : 'ETH,SOL,XRP',
        investmentAmount: strat.investmentAmount || 100,
        tradingFee: strat.tradingFee || 0.001,
        scanIntervalMs: strat.scanIntervalMs || 3000,
        maxTrianglesPerCycle: strat.maxTrianglesPerCycle || 8,
        orderBookDepth: strat.orderBookDepth || 10,
        maxSpreadPercent: strat.maxSpreadPercent || 0.2,
        minVolumeBuffer: strat.minVolumeBuffer || 1.05,
        minProfitPercent: strat.minProfitPercent || 0.1,
        maxSlippagePercent: strat.maxSlippagePercent || 0.15,
        chunkSize: strat.chunkSize || 15,
        enableLiveTrading: strat.enableLiveTrading || false,
        notes: strat.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', exchange: '', assetsMode: 'list', startAssets: 'USDC', bridgeAssets: 'BTC,ETH,SOL',
        targetAssets: 'ETH,SOL,XRP', investmentAmount: 100, tradingFee: 0.001, scanIntervalMs: 3000,
        maxTrianglesPerCycle: 8, orderBookDepth: 10, maxSpreadPercent: 0.2, minVolumeBuffer: 1.05,
        minProfitPercent: 0.1, maxSlippagePercent: 0.15, chunkSize: 15, enableLiveTrading: false, notes: ''
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
        startAssets: formData.startAssets.split(',').map(s => s.trim()).filter(Boolean),
        bridgeAssets: formData.bridgeAssets.split(',').map(s => s.trim()).filter(Boolean),
        targetAssets: formData.targetAssets.split(',').map(s => s.trim()).filter(Boolean),
        investmentAmount: Number(formData.investmentAmount),
        tradingFee: Number(formData.tradingFee),
        scanIntervalMs: Number(formData.scanIntervalMs),
        maxTrianglesPerCycle: Number(formData.maxTrianglesPerCycle),
        orderBookDepth: Number(formData.orderBookDepth),
        maxSpreadPercent: Number(formData.maxSpreadPercent),
        minVolumeBuffer: Number(formData.minVolumeBuffer),
        minProfitPercent: Number(formData.minProfitPercent),
        maxSlippagePercent: Number(formData.maxSlippagePercent),
        chunkSize: Number(formData.chunkSize),
      };

      if (editingId) {
        await api.put(`/arbitrage/strategies/${editingId}`, payload);
      } else {
        await api.post('/arbitrage/strategies', payload);
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
      await api.delete(`/arbitrage/strategies/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao deletar');
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.patch(`/arbitrage/strategies/${id}/toggle`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao alterar status');
    }
  };

  if (loading && strategies.length === 0) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Estratégias Clássicas</Typography>
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
                <Typography variant="body2" color="text.secondary">Exchange: {st.exchange}</Typography>
                <Typography variant="body2" color="text.secondary">Investimento: {st.investmentAmount}</Typography>
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
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nome da Estratégia" name="name" value={formData.name} onChange={handleChange} required margin="dense" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Exchange</InputLabel>
                  <Select name="exchange" value={formData.exchange} onChange={handleChange} required label="Exchange">
                    {exchanges.map(ex => <MenuItem key={ex.acronym} value={ex.acronym}>{ex.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField fullWidth label="Start Assets" name="startAssets" value={formData.startAssets} onChange={handleChange} placeholder="USDC" margin="dense" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Bridge Assets" name="bridgeAssets" value={formData.bridgeAssets} onChange={handleChange} placeholder="BTC,ETH,SOL" margin="dense" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Target Assets" name="targetAssets" value={formData.targetAssets} onChange={handleChange} placeholder="ETH,SOL,XRP" margin="dense" />
              </Grid>

              <Grid item xs={6} sm={4}>
                <TextField fullWidth type="number" label="Investment Amount" name="investmentAmount" value={formData.investmentAmount} onChange={handleChange} margin="dense" />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth type="number" inputProps={{ step: "any" }} label="Min Profit (%)" name="minProfitPercent" value={formData.minProfitPercent} onChange={handleChange} margin="dense" />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth type="number" inputProps={{ step: "any" }} label="Trading Fee (%)" name="tradingFee" value={formData.tradingFee} onChange={handleChange} margin="dense" />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth type="number" inputProps={{ step: "any" }} label="Max Spread (%)" name="maxSpreadPercent" value={formData.maxSpreadPercent} onChange={handleChange} margin="dense" />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth type="number" inputProps={{ step: "any" }} label="Max Slippage (%)" name="maxSlippagePercent" value={formData.maxSlippagePercent} onChange={handleChange} margin="dense" />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth type="number" label="Scan Interval (ms)" name="scanIntervalMs" value={formData.scanIntervalMs} onChange={handleChange} margin="dense" />
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
