import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const GridBotLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={location.pathname} onChange={handleTabChange}>
          <Tab label="Dashboard" value="/grid-bot" />
          <Tab label="Nova Estratégia" value="/grid-bot/config" />
        </Tabs>
      </Box>
      <Outlet />
    </Box>
  );
};

export default GridBotLayout;
