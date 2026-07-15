import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import api from '../api';

export default function ArbitrageExecution() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState({});

  const handleExecuteScan = async (exchange) => {
    try {
      await api.post(`/arbitrage/${exchange}/scan`);
      alert(`Varredura executada com sucesso na exchange ${exchange}!`);
    } catch (err) {
      alert(`Erro ao executar varredura: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await api.get('/arbitrage/strategies');
        setStrategies((res.data.strategies || []).filter(s => s.active));
      } catch (err) {
        setError('Erro ao carregar estratégias para execução.');
      } finally {
        setLoading(false);
      }
    };
    fetchStrategies();
  }, []);

  useEffect(() => {
    if (strategies.length === 0) return;
    
    const interval = setInterval(async () => {
      for (const st of strategies) {
        try {
          const res = await api.get(`/arbitrage/${st._id}/logs`);
          if (res.data && res.data.logs) {
            setLogs(prev => ({
              ...prev,
              [st._id]: res.data.logs
            }));
          }
        } catch (err) {
          console.error(`Erro ao buscar logs da exchange ${st._id}`, err);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [strategies]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Execução em Tempo Real</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {strategies.map(st => (
            <Grid item xs={12} key={st._id}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{st.name} ({st.exchange})</Typography>
                  <Box>
                    <Button variant="contained" color="primary" onClick={() => handleExecuteScan(st.exchange)}>Executar Varredura</Button>
                  </Box>
                </Box>
                
                <Box sx={{ bgcolor: 'black', color: '#00ff00', p: 2, borderRadius: 1, fontFamily: 'monospace', minHeight: 300, maxHeight: 600, overflowY: 'auto' }}>
                  {logs[st._id] && logs[st._id].length > 0 ? (
                    logs[st._id].map((log, index) => (
                      <div key={index} style={{ marginBottom: '4px' }}>
                        [{log.timestamp}] {log.message} {log.data ? JSON.stringify(log.data) : ''}
                      </div>
                    ))
                  ) : (
                    <div>Aguardando logs...</div>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
          {strategies.length === 0 && !error && (
            <Alert severity="info">Nenhuma estratégia ativa para execução.</Alert>
          )}
        </Grid>
      )}
    </Box>
  );
}
