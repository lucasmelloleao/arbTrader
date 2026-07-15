import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import api from '../api';

export default function Arbitrage() {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const res = await api.get('/exchanges');
        setExchanges((res.data.exchanges || []).filter(ex => ex.active));
      } catch (err) {
        setError('Erro ao carregar corretoras ativas.');
      } finally {
        setLoading(false);
      }
    };
    fetchExchanges();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="overline" color="text.secondary">Workspace</Typography>
          <Typography variant="h4">Arbitrage</Typography>
          <Typography variant="body2" color="text.secondary">
            Varreduras, rotas, histórico de scans e logs por corretora.
          </Typography>
        </Box>
        <Box>
          <Button variant="contained" color="primary" sx={{ mr: 1 }}>Executar todas</Button>
          <Button variant="outlined" color="secondary" sx={{ mr: 1 }}>Escutar todas</Button>
          <Button variant="outlined">Atualizar</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {exchanges.map(ex => (
            <Grid xs={12} md={6} key={ex._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{ex.name}</Typography>
                    <Box>
                      <Button size="small" variant="contained" sx={{ mr: 1 }}>Executar</Button>
                      <Button size="small" variant="outlined">Escutar</Button>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">Aguardando atualização...</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {exchanges.length === 0 && !error && (
            <Grid item xs={12}>
              <Alert severity="info">Nenhuma corretora ativa encontrada.</Alert>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
