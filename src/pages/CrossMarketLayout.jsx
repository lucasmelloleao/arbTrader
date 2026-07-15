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

export default function CrossMarketLayout() {
  const navigate = useNavigate();
  const routeMatch = useRouteMatch([
    '/cross-market',
    '/cross-market/execution',
    '/cross-market/trades'
  ]);
  const currentTab = routeMatch?.pattern?.path || '/cross-market';

  const handleChange = (event, newValue) => {
    navigate(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleChange} aria-label="cross market tabs">
          <Tab label="Estratégias" value="/cross-market" />
          <Tab label="Execução" value="/cross-market/execution" />
          <Tab label="Histórico" value="/cross-market/trades" />
        </Tabs>
      </Box>
      <Outlet />
    </Box>
  );
}
