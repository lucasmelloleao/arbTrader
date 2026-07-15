import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
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

export default function MarketMakingLayout() {
  const navigate = useNavigate();
  const routeMatch = useRouteMatch([
    '/market-making',
    '/market-making/execution',
    '/market-making/trades'
  ]);
  const currentTab = routeMatch?.pattern?.path || '/market-making';

  const handleChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleChange} aria-label="market making tabs">
          <Tab label="Estratégias" value="/market-making" />
          <Tab label="Execução" value="/market-making/execution" />
          <Tab label="Histórico" value="/market-making/trades" />
        </Tabs>
      </Box>
      <Outlet />
    </Box>
  );
}
