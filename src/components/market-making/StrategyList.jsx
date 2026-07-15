// src/components/market-making/StrategyList.jsx
import React from 'react';
import { Grid, CircularProgress, Alert } from '@mui/material';
import StrategyCard from './StrategyCard';
import api from '../../api';
import useMarketMaking from '../../hooks/useMarketMaking';
import MarketMakingForm from '../MarketMakingForm';

export default function StrategyList({ onEdit }) {
  const {
    strategies,
    loadingStrategies,
    error,
    refreshStrategies,
  } = useMarketMaking();

  const handleToggle = async (id, active) => {
    try {
      await api.post(`/market-making/${id}/toggle`, { active });
      refreshStrategies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta estratégia?')) return;
    try {
      await api.delete(`/market-making/${id}`);
      refreshStrategies();
    } catch (e) {
      console.error(e);
    }
  };

  if (loadingStrategies) return <CircularProgress color="inherit" />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Grid container spacing={3}>
      {strategies.map((s) => (
        <Grid item xs={12} sm={6} md={4} key={s._id}>
          <StrategyCard
            strategy={s}
            onToggle={handleToggle}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        </Grid>
      ))}
    </Grid>
  );
}
