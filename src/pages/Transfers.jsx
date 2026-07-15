import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Grid, TextField, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Chip, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import api from '../api';

export default function Transfers() {
  const [exchanges, setExchanges] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search state
  const [searchForm, setSearchForm] = useState({
    exchange: '',
    targetExchange: '',
    currency: ''
  });
  const [searchResults, setSearchResults] = useState(null);

  // Transfer Modal
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferFeedback, setTransferFeedback] = useState('');

  const fetchExchanges = async () => {
    try {
      const res = await api.get('/exchanges');
      setExchanges((res.data.exchanges || []).filter(e => e.active));
    } catch (err) {
      console.error('Error fetching exchanges', err);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await api.get('/transfers/catalog');
      setCatalog(res.data.catalog || []);
    } catch (err) {
      console.error('Error fetching catalog', err);
    }
  };

  useEffect(() => {
    fetchExchanges();
    fetchCatalog();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchForm.exchange || !searchForm.targetExchange || !searchForm.currency) return;

    setSearchLoading(true);
    setSearchResults(null);
    setError('');

    try {
      const res = await api.get(`/transfers/lookup?exchangeId=${searchForm.exchange}&currency=${searchForm.currency.toUpperCase()}`);
      setSearchResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao buscar dados de transferência');
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchAddress = async (networkObj) => {
    try {
      const res = await api.get(`/transfers/deposit-address?exchangeId=${searchForm.targetExchange}&currency=${searchForm.currency.toUpperCase()}&network=${networkObj.network}`);
      
      setSearchResults(prev => ({
        ...prev,
        networks: prev.networks.map(n => 
          n.network === networkObj.network ? { ...n, fetchedAddress: res.data.address, fetchedTag: res.data.tag } : n
        )
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao buscar endereço');
    }
  };

  const addToCatalog = async (networkObj) => {
    try {
      await api.post('/transfers/catalog', {
        exchange: searchForm.exchange,
        currency: searchForm.currency.toUpperCase(),
        network: networkObj.network,
        fee: networkObj.fee,
        minAmount: networkObj.minAmount,
        transferTime: networkObj.transferTime || '',
        targetExchange: searchForm.targetExchange,
        depositAddress: networkObj.fetchedAddress || '',
        depositTag: networkObj.fetchedTag || ''
      });
      alert('Rota adicionada ao catálogo!');
      fetchCatalog();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao adicionar catálogo');
    }
  };

  const removeFromCatalog = async (id) => {
    if (!window.confirm('Remover rota?')) return;
    try {
      await api.delete(`/transfers/catalog/${id}`);
      fetchCatalog();
    } catch (err) {
      alert('Erro ao remover rota');
    }
  };

  const openTransferModal = (route) => {
    setSelectedRoute(route);
    setTransferAmount('');
    setTransferFeedback('');
    setTransferOpen(true);
  };

  const executeTransfer = async () => {
    if (!transferAmount || isNaN(transferAmount) || Number(transferAmount) <= 0) return;

    setTransferFeedback('Executando transferência...');
    try {
      const res = await api.post('/transfers/execute', {
        catalogId: selectedRoute._id,
        amount: Number(transferAmount)
      });
      setTransferFeedback(`Sucesso! TxID: ${res.data.transactionId}`);
      fetchHistory();
      setTimeout(() => setTransferOpen(false), 3000);
    } catch (err) {
      setTransferFeedback(`Erro: ${err.response?.data?.error || err.message}`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado!');
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="overline" color="text.secondary">Transferências</Typography>
        <Typography variant="h4">Catálogo de Rotas</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Origem</InputLabel>
                <Select value={searchForm.exchange} onChange={e => setSearchForm({...searchForm, exchange: e.target.value})} label="Origem" required>
                  {exchanges.map(ex => <MenuItem key={ex.acronym} value={ex.acronym}>{ex.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField 
                label="Moeda" size="small" fullWidth required 
                placeholder="BTC, USDT"
                value={searchForm.currency}
                onChange={e => setSearchForm({...searchForm, currency: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Destino</InputLabel>
                <Select value={searchForm.targetExchange} onChange={e => setSearchForm({...searchForm, targetExchange: e.target.value})} label="Destino" required>
                  {exchanges.map(ex => <MenuItem key={ex.acronym} value={ex.acronym}>{ex.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button type="submit" variant="contained" fullWidth disabled={searchLoading}>
                {searchLoading ? 'Buscando...' : 'Buscar'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {searchResults && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
          <Typography variant="h6" mb={2}>Redes Disponíveis</Typography>
          <Grid container spacing={2}>
            {searchResults.networks?.length === 0 ? (
              <Grid item xs={12}><Typography color="text.secondary">Nenhuma rede ativa encontrada.</Typography></Grid>
            ) : (
              searchResults.networks?.map((net, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">{net.network}</Typography>
                    <Box mt={1} flexGrow={1}>
                      <Typography variant="body2">Taxa: {net.fee} {searchResults.currency}</Typography>
                      <Typography variant="body2">Mínimo: {net.minAmount} {searchResults.currency}</Typography>
                      <Typography variant="body2">Tempo: {net.transferTime || 'N/A'}</Typography>
                      {net.fetchedAddress && (
                        <Box mt={1} p={1} bgcolor="rgba(255,255,255,0.05)">
                          <Typography variant="caption" color="primary">Endereço:</Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{net.fetchedAddress}</Typography>
                          {net.fetchedTag && <Typography variant="body2">Tag: {net.fetchedTag}</Typography>}
                        </Box>
                      )}
                    </Box>
                    <Box mt={2} display="flex" flexDirection="column" gap={1}>
                      <Button size="small" variant="outlined" onClick={() => fetchAddress(net)}>Obter Endereço Destino</Button>
                      <Button size="small" variant="contained" onClick={() => addToCatalog(net)}>Adicionar ao Catálogo</Button>
                    </Box>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Paper>
      )}

      <Box mb={4}>
        <Typography variant="h5" mb={2}>Rotas Catalogadas</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Origem</TableCell>
                <TableCell>Moeda</TableCell>
                <TableCell>Rede</TableCell>
                <TableCell>Taxa</TableCell>
                <TableCell>Destino</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {catalog.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">Vazio</TableCell></TableRow>
              ) : (
                catalog.map(route => (
                  <TableRow hover key={route._id}>
                    <TableCell>{route.exchange.toUpperCase()}</TableCell>
                    <TableCell>{route.currency}</TableCell>
                    <TableCell>{route.network}</TableCell>
                    <TableCell>{route.fee}</TableCell>
                    <TableCell>
                      {route.targetExchange?.toUpperCase()}<br/>
                      <Typography variant="caption" sx={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => copyToClipboard(route.depositAddress)}>
                        {route.depositAddress?.substring(0, 10)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" onClick={() => openTransferModal(route)} disabled={!route.depositAddress}>Transferir</Button>
                      <IconButton size="small" color="error" onClick={() => removeFromCatalog(route._id)}><DeleteIcon/></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Transfer Modal */}
      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)}>
        <DialogTitle>Executar Transferência</DialogTitle>
        <DialogContent dividers>
          {selectedRoute && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="body2">De: {selectedRoute.exchange.toUpperCase()}</Typography>
              <Typography variant="body2">Para: {selectedRoute.targetExchange?.toUpperCase()}</Typography>
              <Typography variant="body2">Moeda: {selectedRoute.currency} ({selectedRoute.network})</Typography>
              <TextField 
                label={`Quantidade (Mín: ${selectedRoute.minAmount})`}
                type="number"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
                fullWidth
              />
              {transferFeedback && <Alert severity="info">{transferFeedback}</Alert>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferOpen(false)}>Cancelar</Button>
          <Button onClick={executeTransfer} variant="contained" color="primary">Confirmar Saque</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
