import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import StrategyList from '../components/market-making/StrategyList';
import MarketMakingForm from '../components/MarketMakingForm';
import { Plus } from 'lucide-react';

export default function MarketMakingDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);

  const handleEdit = (strategy) => {
    setEditingStrategy(strategy);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingStrategy(null);
  };

  const handleFormSubmit = async (data) => {
    setIsFormOpen(false);
    setEditingStrategy(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Estratégias Market Making</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Plus />} 
          onClick={() => { setEditingStrategy(null); setIsFormOpen(true); }}
        >
          Nova Estratégia
        </Button>
      </Box>

      <StrategyList onEdit={handleEdit} />

      {isFormOpen && (
        <MarketMakingForm
          initialData={editingStrategy}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </Box>
  );
}
