import React from 'react';
import { Box, Container, Typography } from '@mui/material';

/**
 * BaseDashboard – layout wrapper used by all dashboard pages.
 * Provides a consistent page title, optional actions slot, and content area.
 * Designed with the same dark‑theme aesthetics as the rest of the app.
 */
function BaseDashboard({ title, children }) {
  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', bgGradient: 'linear(to-r, #00bfa5, #009688)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {title}
          </Typography>
        </Box>
        {children}
      </Container>
    </Box>
  );
}

export default BaseDashboard;
