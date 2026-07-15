import React from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { Outlet, useNavigate, useLocation, matchPath } from 'react-router-dom';

function useRouteMatch(patterns) {
  const { pathname } = useLocation();
  for (let i = 0; i < patterns.length; i += 1) {
    const pattern = patterns[i];
    const possibleMatch = matchPath(pattern, pathname);
    if (possibleMatch !== null) {
      return possibleMatch;
    }
  }
  return null;
}

export default function ArbitrageLayout() {
  const navigate = useNavigate();
  const routeMatch = useRouteMatch([
    '/arbitrage',
    '/arbitrage/config',
    '/arbitrage/execution',
    '/arbitrage/trades'
  ]);
  const currentTab = routeMatch?.pattern?.path || '/arbitrage';

  const handleChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleChange} aria-label="arbitrage tabs">
          <Tab label="Dashboard" value="/arbitrage" />
          <Tab label="Estratégias" value="/arbitrage/config" />
          <Tab label="Execução" value="/arbitrage/execution" />
          <Tab label="Histórico" value="/arbitrage/trades" />
        </Tabs>
      </Box>
      <Outlet />
    </Box>
  );
}
