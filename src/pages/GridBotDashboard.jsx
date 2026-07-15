import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import api from '../api';

const GridBotDashboard = () => {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [currentTrades, setCurrentTrades] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  const [editFormData, setEditFormData] = useState({ lowerPrice: '', upperPrice: '', gridLevels: '', investment: '' });

  const fetchBots = async () => {
    try {
      const response = await api.get('/grid-bot');
      setBots(response.data);
    } catch (error) {
      console.error('Error fetching grid bots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
    const interval = setInterval(fetchBots, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, []);

  const handleStopBot = async (id) => {
    try {
      await api.post(`/grid-bot/${id}/stop`);
      fetchBots();
    } catch (error) {
      console.error('Error stopping bot:', error);
    }
  };

  const handleResumeBot = async (id) => {
    try {
      await api.post(`/grid-bot/${id}/resume`);
      fetchBots();
    } catch (error) {
      console.error('Error resuming bot:', error);
    }
  };

  const handleDeleteBot = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta estratégia permanentemente?')) {
      try {
        await api.delete(`/grid-bot/${id}`);
        fetchBots();
      } catch (error) {
        console.error('Error deleting bot:', error);
      }
    }
  };

  const handleOpenEdit = (bot) => {
    setEditingBot(bot);
    setEditFormData({
      lowerPrice: bot.lowerPrice,
      upperPrice: bot.upperPrice,
      gridLevels: bot.gridLevels,
      investment: bot.investment
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    if (!editingBot) return;
    try {
      await api.put(`/grid-bot/${editingBot._id}`, {
        lowerPrice: Number(editFormData.lowerPrice),
        upperPrice: Number(editFormData.upperPrice),
        gridLevels: Number(editFormData.gridLevels),
        investment: Number(editFormData.investment)
      });
      setEditModalOpen(false);
      fetchBots();
    } catch (error) {
      console.error('Error updating bot:', error);
      alert('Erro ao atualizar estratégia.');
    }
  };

  const handleOpenHistory = async (id) => {
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const response = await api.get(`/grid-bot/${id}/trades`);
      setCurrentTrades(response.data);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading && bots.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Meus Grid Bots
      </Typography>
      
      {bots.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Nenhum bot ativo no momento. Vá para "Nova Estratégia" para iniciar.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {bots.map((bot) => (
            <Grid item xs={12} md={6} key={bot._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {bot.symbol} ({bot.exchange})
                    </Typography>
                    <Chip 
                      label={bot.status} 
                      color={bot.status === 'ACTIVE' ? 'success' : 'default'}
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Faixa de Preço</Typography>
                      <Typography variant="body1">{bot.lowerPrice} - {bot.upperPrice}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Níveis (Grids)</Typography>
                      <Typography variant="body1">{bot.gridLevels}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Investimento</Typography>
                      <Typography variant="body1">{bot.investment} {bot.symbol.split('/')[1] || 'USDC'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Lucro Acumulado</Typography>
                      <Typography variant="body1" color={bot.accruedProfit > 0 ? 'success.main' : 'text.primary'}>
                        {bot.accruedProfit} {bot.symbol.split('/')[1] || 'USDC'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                    <Button 
                      variant="outlined" 
                      color="info"
                      onClick={() => handleOpenHistory(bot._id)}
                    >
                      Histórico
                    </Button>
                    {bot.status === 'ACTIVE' ? (
                      <Button 
                        variant="outlined" 
                        color="warning"
                        onClick={() => handleStopBot(bot._id)}
                      >
                        Parar
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outlined" 
                          color="secondary"
                          onClick={() => handleOpenEdit(bot)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="success"
                          onClick={() => handleResumeBot(bot._id)}
                        >
                          Reiniciar
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => handleDeleteBot(bot._id)}
                    >
                      Excluir
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de Histórico */}
      <Dialog open={historyModalOpen} onClose={() => setHistoryModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Histórico de Operações</DialogTitle>
        <DialogContent>
          {loadingHistory ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : currentTrades.length === 0 ? (
            <Typography p={2} color="text.secondary">Nenhuma operação realizada ainda.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data / Hora</TableCell>
                  <TableCell>Ação</TableCell>
                  <TableCell>Preço</TableCell>
                  <TableCell>Quantidade</TableCell>
                  <TableCell>Lucro (P&L)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentTrades.map((trade) => (
                  <TableRow key={trade._id}>
                    <TableCell>{new Date(trade.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={trade.side === 'buy' ? 'Compra' : 'Venda'} 
                        color={trade.side === 'buy' ? 'success' : 'error'} 
                      />
                    </TableCell>
                    <TableCell>{trade.price}</TableCell>
                    <TableCell>{trade.amount}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color={trade.profit > 0 ? 'success.main' : 'text.secondary'}>
                        {trade.profit > 0 ? `+${trade.profit.toFixed(6)}` : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Estratégia</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Preço Inferior"
              name="lowerPrice"
              type="number"
              value={editFormData.lowerPrice}
              onChange={handleEditChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Preço Superior"
              name="upperPrice"
              type="number"
              value={editFormData.upperPrice}
              onChange={handleEditChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Níveis (Grids)"
              name="gridLevels"
              type="number"
              value={editFormData.gridLevels}
              onChange={handleEditChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Investimento"
              name="investment"
              type="number"
              value={editFormData.investment}
              onChange={handleEditChange}
              fullWidth
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GridBotDashboard;
