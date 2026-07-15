import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Fade,
  CircularProgress,
  Switch,
  FormControlLabel,
  FormGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import api from '../api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Ícones
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SpeedIcon from '@mui/icons-material/Speed';
import BoltIcon from '@mui/icons-material/Bolt';

export default function FlashLoanDashboard() {
  const [status, setStatus] = useState('stopped');
  const [botMode, setBotMode] = useState('simulator');
  const [trades, setTrades] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Efeito visual de scan
  const [scanPulse, setScanPulse] = useState(false);

  // Modal de Estratégia
  const [openStrategyDialog, setOpenStrategyDialog] = useState(false);
  const [strategyForm, setStrategyForm] = useState({
    name: '',
    tokenB: '',
    tokenBMint: '',
    borrowAmount: 100,
    provider: 'jupiter'
  });
  const [editingStrategyId, setEditingStrategyId] = useState(null);
  const [usingShyftRpc, setUsingShyftRpc] = useState(false);

  const fetchStatus = async () => {
    try {
      const statusRes = await api.get('/flash-loan/status');
      setStatus(statusRes.data.status);
      if (statusRes.data.mode) {
        setBotMode(statusRes.data.mode);
      }
      setUsingShyftRpc(!!statusRes.data.usingShyftRpc);

      if (statusRes.data.status === 'running') {
        setScanPulse(prev => !prev);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar status do bot');
    }
  };

  const fetchTrades = async () => {
    try {
      const tradesRes = await api.get('/flash-loan/trades');
      setTrades(tradesRes.data.trades || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar histórico');
    }
  };

  const fetchStrategies = async () => {
    try {
      const res = await api.get('/flash-loan/strategies');
      setStrategies(res.data.strategies || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar estratégias');
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchTrades();
    fetchStrategies();
    const interval = setInterval(fetchStatus, 2000); // Polling apenas no status
    return () => clearInterval(interval);
  }, []);

  const handleToggleBot = async () => {
    setLoading(true);
    try {
      if (status === 'running') {
        await api.post('/flash-loan/stop');
      } else {
        await api.post('/flash-loan/start');
      }
      await fetchStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao alternar status do bot');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = async (event) => {
    const newMode = event.target.checked ? 'live' : 'simulator';
    try {
      await api.post('/flash-loan/mode', { mode: newMode });
      setBotMode(newMode);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao alterar modo');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingStrategyId(null);
    setStrategyForm({ name: '', tokenB: '', tokenBMint: '', borrowAmount: 100, provider: 'jupiter' });
    setOpenStrategyDialog(true);
  };

  const handleEditStrategyClick = (strategy) => {
    setEditingStrategyId(strategy._id);
    setStrategyForm({
      name: strategy.name,
      tokenB: strategy.tokenB,
      tokenBMint: strategy.tokenBMint,
      borrowAmount: strategy.borrowAmount,
      provider: strategy.provider || 'jupiter'
    });
    setOpenStrategyDialog(true);
  };

  const handleSaveStrategy = async () => {
    try {
      if (editingStrategyId) {
        await api.put(`/flash-loan/strategies/${editingStrategyId}`, strategyForm);
      } else {
        await api.post('/flash-loan/strategies', strategyForm);
      }
      setOpenStrategyDialog(false);
      setEditingStrategyId(null);
      setStrategyForm({ name: '', tokenB: '', tokenBMint: '', borrowAmount: 100, provider: 'jupiter' });
      fetchStrategies();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar estratégia');
    }
  };

  const handleDeleteStrategy = async (id) => {
    if (!window.confirm('Excluir esta estratégia?')) return;
    try {
      await api.delete(`/flash-loan/strategies/${id}`);
      fetchStrategies();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao excluir estratégia');
    }
  };

  const handleToggleStrategy = async (id, currentActive) => {
    try {
      await api.put(`/flash-loan/strategies/${id}`, { active: !currentActive });
      fetchStrategies();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao alterar estratégia');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'simulated': return 'info';
      case 'success': return 'success';
      case 'reverted': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const glassStyle = {
    background: 'rgba(17, 25, 40, 0.75)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.125)',
    borderRadius: '16px',
    color: '#fff'
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#0a0e17',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1a2a42 0%, #0a0e17 70%)',
      p: 4,
      color: '#fff',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
    }}>

      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Jito MEV Flash Loan
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              High-Frequency Trading Engine (HFT)
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={botMode === 'live'}
                    onChange={handleToggleMode}
                    color="warning"
                    disabled={status === 'running'}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: botMode === 'live' ? '#ff9800' : '#4fc3f7' }}>
                    {botMode === 'live' ? '🔥 MODO LIVE (Dinheiro Real)' : '🧪 MODO SIMULADOR'}
                  </Typography>
                }
              />
            </FormGroup>
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={handleToggleBot}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (status === 'running' ? <StopIcon /> : <PlayArrowIcon />)}
          sx={{
            px: 4, py: 1.5,
            borderRadius: '30px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            backgroundColor: status === 'running' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
            color: status === 'running' ? '#f44336' : '#4caf50',
            border: `1px solid ${status === 'running' ? '#f44336' : '#4caf50'}`,
            boxShadow: status === 'running' ? '0 0 20px rgba(244, 67, 54, 0.3)' : '0 0 20px rgba(76, 175, 80, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: status === 'running' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
              boxShadow: status === 'running' ? '0 0 30px rgba(244, 67, 54, 0.5)' : '0 0 30px rgba(76, 175, 80, 0.5)',
            }
          }}
        >
          {status === 'running' ? 'INTERROMPER MOTOR' : 'LIGAR MOTOR'}
        </Button>
      </Box>

      {error && (
        <Fade in={!!error}>
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 4, background: 'rgba(211, 47, 47, 0.1)', color: '#ffb4ab', border: '1px solid rgba(211, 47, 47, 0.3)' }}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* METRICS ROW */}
      <Grid container spacing={4} mb={6}>
        <Grid item xs={12} md={4}>
          <Card sx={{ ...glassStyle, position: 'relative', overflow: 'hidden' }}>
            <CardContent sx={{ zIndex: 2, position: 'relative' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <SpeedIcon sx={{ color: '#00d2ff' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Status do Nó (RPC)
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{
                  width: 12, height: 12, borderRadius: '50%',
                  backgroundColor: status === 'running' ? '#00e676' : '#9e9e9e',
                  boxShadow: status === 'running' ? (scanPulse ? '0 0 20px 5px rgba(0, 230, 118, 0.6)' : '0 0 10px 2px rgba(0, 230, 118, 0.4)') : 'none',
                  transition: 'box-shadow 0.5s ease-in-out'
                }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {status === 'running' ? 'ANALISANDO BLOCOS' : 'STANDBY'}
                </Typography>
              </Box>
            </CardContent>
            {/* Efeito de radar ao fundo quando ativo */}
            {status === 'running' && (
              <Box sx={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%',
                background: 'linear-gradient(90deg, transparent, rgba(0, 230, 118, 0.05))',
                transform: scanPulse ? 'translateX(0%)' : 'translateX(-100%)',
                transition: 'transform 1.8s ease-in-out'
              }} />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={glassStyle}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AutoGraphIcon sx={{ color: '#ff4081' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Rota Ativa
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                USDC <span style={{ color: 'rgba(255,255,255,0.3)' }}>➔</span> SOL <span style={{ color: 'rgba(255,255,255,0.3)' }}>➔</span> USDC
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
                Jupiter V6 / Solend Flash Loan
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={glassStyle}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <BoltIcon sx={{ color: '#ffea00' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Oportunidades (Triângulos)
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffea00', textShadow: '0 0 10px rgba(255, 234, 0, 0.3)' }}>
                {trades.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* STRATEGIES TABLE */}
      <Box mt={4} mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Estratégias de Flahs Lons
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
          sx={{ background: 'linear-gradient(45deg, #00d2ff 0%, #3a7bd5 100%)', fontWeight: 'bold' }}
        >
          Nova Estratégia
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ ...glassStyle, background: 'rgba(17, 25, 40, 0.4)', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#aaa' }}>Nome</TableCell>
              <TableCell sx={{ color: '#aaa' }}>Par</TableCell>
              <TableCell sx={{ color: '#aaa' }}>Mint Token B</TableCell>
              <TableCell sx={{ color: '#aaa' }}>Provedor</TableCell>
              <TableCell sx={{ color: '#aaa' }}>Borrow Amount</TableCell>
              <TableCell sx={{ color: '#aaa' }}>Status</TableCell>
              <TableCell sx={{ color: '#aaa' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {strategies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#aaa', py: 3 }}>
                  Nenhuma estratégia configurada.
                </TableCell>
              </TableRow>
            ) : (
              strategies.map((row) => (
                <TableRow key={row._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ color: '#fff' }}>{row.name}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{row.tokenA} / {row.tokenB}</TableCell>
                  <TableCell sx={{ color: '#aaa', fontSize: '0.8rem' }}>{row.tokenBMint}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.provider === 'raptor' ? 'Solana Tracker' : 'Jupiter'}
                      size="small"
                      color={row.provider === 'raptor' ? 'secondary' : 'primary'}
                      sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#00d2ff', fontWeight: 'bold' }}>{row.borrowAmount}</TableCell>
                  <TableCell>
                    <Switch
                      checked={row.active}
                      onChange={() => handleToggleStrategy(row._id, row.active)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEditStrategyClick(row)} sx={{ color: '#00d2ff', mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteStrategy(row._id)} sx={{ color: '#ff5252' }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* TRADES LOG */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ width: 4, height: 24, background: '#00d2ff', borderRadius: 4 }} />
          Log de MEV Bundles
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="outlined" size="small" onClick={fetchTrades} sx={{ color: '#00d2ff', borderColor: '#00d2ff', '&:hover': { backgroundColor: 'rgba(0, 210, 255, 0.1)' } }}>
            ATUALIZAR HISTÓRICO
          </Button>
          {usingShyftRpc && (
            <Chip 
              label="⚡ Shyft RPC Ativa" 
              size="small" 
              sx={{ fontWeight: 'bold', background: 'rgba(0, 230, 118, 0.2)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.5)' }} 
            />
          )}
          {status === 'running' && (
            <Typography variant="body2" sx={{ color: 'rgba(0, 230, 118, 0.8)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={12} sx={{ color: '#00e676' }} /> Ouvindo Blockchain (WSS)
            </Typography>
          )}
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ ...glassStyle, background: 'rgba(17, 25, 40, 0.4)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' } }}>
              <TableCell>TIMESTAMP</TableCell>
              <TableCell>ALVO</TableCell>
              <TableCell>CAPITAL</TableCell>
              <TableCell>LUCRO ESPERADO (USDC)</TableCell>
              <TableCell>TAXA (FEE)</TableCell>
              <TableCell>JITO STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    Nenhuma oportunidade lucrativa encontrada nos blocos recentes.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => (
                <TableRow key={trade._id} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff' }, '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>
                    {new Date(trade.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                  </TableCell>
                  <TableCell>
                    <Chip label={trade.tokenBorrowed} size="small" sx={{ background: 'rgba(38, 166, 154, 0.2)', color: '#26a69a', border: '1px solid rgba(38, 166, 154, 0.5)' }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {trade.amountBorrowed.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: trade.expectedProfit > 0 ? '#00e676' : 'inherit', fontWeight: 'bold' }}>
                    + {trade.expectedProfit.toFixed(6)}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {trade.flashLoanFee.toFixed(6)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={trade.status.toUpperCase()}
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        fontSize: '0.7rem',
                        ...(trade.status === 'simulated' && { background: 'rgba(33, 150, 243, 0.2)', color: '#64b5f6', border: '1px solid rgba(33, 150, 243, 0.5)' }),
                        ...(trade.status === 'success' && { background: 'rgba(0, 230, 118, 0.2)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.5)' }),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Nova Estratégia */}
      <Dialog open={openStrategyDialog} onClose={() => setOpenStrategyDialog(false)} PaperProps={{ style: glassStyle }}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {editingStrategyId ? 'Editar Estratégia de Flash Loan' : 'Nova Estratégia de Flash Loan'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nome da Estratégia (ex: USDC/SOL/USDC)"
            variant="outlined"
            margin="normal"
            value={strategyForm.name}
            onChange={(e) => setStrategyForm({ ...strategyForm, name: e.target.value })}
            sx={{ input: { color: '#fff' }, label: { color: '#aaa' } }}
          />
          <TextField
            fullWidth
            label="Token A (Empréstimo Solend)"
            variant="outlined"
            margin="normal"
            value="USDC"
            disabled
            sx={{ input: { color: '#fff' }, label: { color: '#aaa' } }}
            helperText="Atualmente fixado em USDC devido à integração com a Solend"
          />
          <TextField
            fullWidth
            label="Token B (Símbolo Alvo)"
            variant="outlined"
            margin="normal"
            placeholder="ex: SOL, RAY, BONK"
            value={strategyForm.tokenB}
            onChange={(e) => setStrategyForm({ ...strategyForm, tokenB: e.target.value })}
            sx={{ input: { color: '#fff' }, label: { color: '#aaa' } }}
          />
          <TextField
            fullWidth
            label="Mint Address do Token B"
            variant="outlined"
            margin="normal"
            placeholder="ex: So11111111111111111111111111111111111111112"
            value={strategyForm.tokenBMint}
            onChange={(e) => setStrategyForm({ ...strategyForm, tokenBMint: e.target.value })}
            sx={{ input: { color: '#fff' }, label: { color: '#aaa' } }}
          />
          <TextField
            fullWidth
            label="Valor de Empréstimo (em USDC)"
            type="number"
            variant="outlined"
            margin="normal"
            value={strategyForm.borrowAmount}
            onChange={(e) => setStrategyForm({ ...strategyForm, borrowAmount: e.target.value })}
            sx={{ input: { color: '#fff' }, label: { color: '#aaa' }, mb: 2 }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="provider-select-label" sx={{ color: '#aaa' }} shrink>Provedor de Roteamento (Quotes)</InputLabel>
            <Select
              native
              labelId="provider-select-label"
              id="provider-select"
              value={strategyForm.provider || 'jupiter'}
              label="Provedor de Roteamento (Quotes)"
              onChange={(e) => setStrategyForm({ ...strategyForm, provider: e.target.value })}
              sx={{ 
                color: '#fff', 
                backgroundColor: 'rgba(17, 25, 40, 0.4)',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }, 
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                'select option': { backgroundColor: '#111928', color: '#fff' }
              }}
            >
              <option value="jupiter">Jupiter V6 (Taxa 0%, Rate Limits)</option>
              <option value="raptor">Solana Tracker / Raptor (Taxa 0.5%, Sem Limit)</option>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={() => setOpenStrategyDialog(false)} sx={{ color: '#aaa' }}>Cancelar</Button>
          <Button onClick={handleSaveStrategy} variant="contained" sx={{ background: '#00d2ff' }}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
