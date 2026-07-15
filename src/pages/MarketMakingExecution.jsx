import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import api from '../api';

export default function MarketMakingExecution() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState({});

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await api.get('/market-making');
        setStrategies((res.data.strategies || []).filter(s => s.active));
      } catch (err) {
        setError('Erro ao carregar estratégias market-making ativas.');
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
          const res = await api.get(`/market-making/logs?strategyId=${st._id}&limit=50`);
          if (res.data && res.data.logs) {
            setLogs(prev => ({
              ...prev,
              [st._id]: res.data.logs
            }));
          }
        } catch (err) {
          console.error(`Erro ao buscar logs da estratégia ${st._id}`, err);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [strategies]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Execução em Tempo Real (Market Making)</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : strategies.length === 0 ? (
        <Alert severity="info">Nenhuma estratégia Market Making ativa no momento.</Alert>
      ) : (
        <Grid container spacing={3}>
          {strategies.map(st => (
            <Grid item xs={12} lg={6} key={st._id}>
              <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">{st.name}</Typography>
                </Box>
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    bgcolor: '#1e1e1e', 
                    color: '#00ff00', 
                    p: 2, 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                >
                  {(logs[st._id] || []).map((log, i) => (
                    <div key={i} style={{ marginBottom: '4px' }}>
                      <span style={{ color: '#888' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                    </div>
                  ))}
                  {(!logs[st._id] || logs[st._id].length === 0) && (
                    <div style={{ color: '#888' }}>Aguardando logs da estratégia...</div>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
