// src/components/market-making/StrategyCard.jsx
import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import { PlayCircle, StopCircle, Edit, Trash2 } from 'lucide-react';

/**
 * Visual card for a single Market Making strategy.
 * Uses glassmorphism style to match premium UI.
 */
export default function StrategyCard({ strategy, onToggle, onEdit, onDelete }) {
  const active = !!strategy.active;
  return (
    <Card
      sx={{
        background: 'rgba(30,30,30,0.6)',
        backdropFilter: 'blur(12px)',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)' },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" component="div" color="primary.contrastText" sx={{ fontWeight: 'bold' }}>
            {strategy.name}
          </Typography>
          <IconButton onClick={() => onToggle(strategy._id, !active)} aria-label={active ? 'Pause' : 'Play'}
            sx={{ color: active ? 'green.400' : 'gray.400' }}>
            {active ? <StopCircle size={24} /> : <PlayCircle size={24} />}
          </IconButton>
        </Box>
        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
          <Chip label={strategy.exchange} size="small" />
          <Chip label={strategy.symbol} size="small" />
          <Chip label={`Mode: ${strategy.mode}`} size="small" />
          <Chip label={`Budget $${strategy.quoteBudget}`} size="small" />
          <Chip label={`Min Spread ${strategy.minSpreadPercent}%`} size="small" />
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          <IconButton size="small" onClick={() => onEdit(strategy)} aria-label="Edit">
            <Edit size={18} />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(strategy._id)} aria-label="Delete" sx={{ color: 'error.main' }}>
            <Trash2 size={18} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
