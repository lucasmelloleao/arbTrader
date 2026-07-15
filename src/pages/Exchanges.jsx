import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import api from '../api';

export default function Exchanges() {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    apiKey: '',
    secretKey: '',
    password: '',
    assetsMode: 'list',
    active: true,
    enableLiveTrading: false,
    envInfo: '',
    notes: '',
    marketMakingConfig: {
      mode: 'simulation',
      symbol: '',
      orderBookDepth: 10,
      quoteOffsetPercent: 0.15,
      minSpreadPercent: 0.22,
      quoteBudget: 8,
      maxSymbolAttempts: 10,
      updateIntervalMs: 1500,
      keepListening: true
    }
  });

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exchanges');
      setExchanges(res.data.exchanges || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar corretoras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const handleOpen = (exchange = null) => {
    if (exchange) {
      setEditingId(exchange._id);
      setFormData({
        name: exchange.name || '',
        acronym: exchange.acronym || '',
        apiKey: '', 
        secretKey: '',
        password: '',
        assetsMode: exchange.assetsMode || 'list',
        active: exchange.active !== false,
        enableLiveTrading: exchange.enableLiveTrading || false,
        envInfo: exchange.envInfo || '',
        notes: exchange.notes || '',
        marketMakingConfig: {
          mode: exchange.marketMakingConfig?.mode || 'simulation',
          symbol: exchange.marketMakingConfig?.symbol || '',
          orderBookDepth: exchange.marketMakingConfig?.orderBookDepth || 10,
          quoteOffsetPercent: exchange.marketMakingConfig?.quoteOffsetPercent || 0.15,
          minSpreadPercent: exchange.marketMakingConfig?.minSpreadPercent || 0.22,
          quoteBudget: exchange.marketMakingConfig?.quoteBudget || 8,
          maxSymbolAttempts: exchange.marketMakingConfig?.maxSymbolAttempts || 10,
          updateIntervalMs: exchange.marketMakingConfig?.updateIntervalMs || 1500,
          keepListening: exchange.marketMakingConfig?.keepListening !== false
        }
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', acronym: '', apiKey: '', secretKey: '', password: '',
        assetsMode: 'list', active: true, enableLiveTrading: false, envInfo: '', notes: '',
        marketMakingConfig: {
          mode: 'simulation', symbol: '', orderBookDepth: 10, quoteOffsetPercent: 0.15,
          minSpreadPercent: 0.22, quoteBudget: 8, maxSymbolAttempts: 10,
          updateIntervalMs: 1500, keepListening: true
        }
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('marketMakingConfig.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        marketMakingConfig: {
          ...prev.marketMakingConfig,
          [key]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.apiKey) delete payload.apiKey;
      if (!payload.secretKey) delete payload.secretKey;
      if (!payload.password) delete payload.password;

      if (editingId) {
        await api.put(`/exchanges/${editingId}`, payload);
      } else {
        await api.post('/exchanges', payload);
      }
      setOpen(false);
      fetchExchanges();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar corretora');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta corretora?')) return;
    try {
      await api.delete(`/exchanges/${id}`);
      fetchExchanges();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao deletar');
    }
  };

  if (loading && exchanges.length === 0) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Corretoras</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>Nova Corretora</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {exchanges.map(ex => (
          <Grid item xs={12} sm={6} md={4} key={ex._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{ex.name}</Typography>
                  <Chip 
                    label={ex.active ? 'Ativa' : 'Inativa'} 
                    color={ex.active ? 'success' : 'default'} 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">Sigla: {ex.acronym}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Modo Live: {ex.enableLiveTrading ? 'Sim' : 'Não'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleOpen(ex)}>Editar</Button>
                <Button size="small" color="error" onClick={() => handleDelete(ex._id)}>Remover</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? `Editar Corretora` : `Nova Corretora`}</DialogTitle>
        <DialogContent dividers>
          <form id="exchange-form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {(() => {
                const isDex = formData.acronym.toUpperCase() === 'RAYDIUM';
                return (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Nome" name="name" value={formData.name} onChange={handleChange} required margin="dense" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Sigla (ex: BINANCE, RAYDIUM)" name="acronym" value={formData.acronym} onChange={handleChange} required margin="dense" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label={isDex ? "RPC URL (Opcional)" : "API Key"} name="apiKey" value={formData.apiKey} onChange={handleChange} placeholder="Deixe vazio para manter" margin="dense" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label={isDex ? "Wallet Private Key (Base58)" : "Secret Key"} name="secretKey" type="password" value={formData.secretKey} onChange={handleChange} placeholder="Deixe vazio para manter" margin="dense" />
                    </Grid>
                  </>
                );
              })()}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Passphrase (ex: OKX)" name="password" type="password" value={formData.password} onChange={handleChange} margin="dense" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Modo de Ativos</InputLabel>
                  <Select name="assetsMode" value={formData.assetsMode} onChange={handleChange} label="Modo de Ativos">
                    <MenuItem value="list">Lista - apenas configurados</MenuItem>
                    <MenuItem value="all">Todos - monitorar todos disponíveis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Market Making Config</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Modo</InputLabel>
                  <Select name="marketMakingConfig.mode" value={formData.marketMakingConfig.mode} onChange={handleChange} label="Modo">
                    <MenuItem value="simulation">Simulation</MenuItem>
                    <MenuItem value="live">Live</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Símbolos" name="marketMakingConfig.symbol" value={formData.marketMakingConfig.symbol} onChange={handleChange} placeholder="Ex: PEPE/USDT,SUI/USDT" margin="dense" />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={formData.active} onChange={handleChange} name="active" color="primary" />}
                  label="Corretora Ativa para Operação"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={formData.enableLiveTrading} onChange={handleChange} name="enableLiveTrading" color="warning" />}
                  label="Habilitar Modo Real (Live Trading)"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
