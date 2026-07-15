import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider, AuthContext } from './AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Exchanges from './pages/Exchanges';
import ArbitrageLayout from './pages/ArbitrageLayout';
import ArbitrageDashboard from './pages/ArbitrageDashboard';
import ArbitrageConfig from './pages/ArbitrageConfig';
import ArbitrageExecution from './pages/ArbitrageExecution';
import ArbitrageTrades from './pages/ArbitrageTrades';

import CrossMarketLayout from './pages/CrossMarketLayout';
import CrossMarketDashboard from './pages/CrossMarketDashboard';
import CrossMarketExecution from './pages/CrossMarketExecution';
import CrossMarketTrades from './pages/CrossMarketTrades';

import MarketMakingLayout from './pages/MarketMakingLayout';
import MarketMakingDashboard from './pages/MarketMakingDashboard';
import MarketMakingExecution from './pages/MarketMakingExecution';
import MarketMakingTrades from './pages/MarketMakingTrades';
import GridBotLayout from './pages/GridBotLayout';
import GridBotDashboard from './pages/GridBotDashboard';
import GridBotConfig from './pages/GridBotConfig';
import Balances from './pages/Balances';
import Transfers from './pages/Transfers';
import PortfolioDashboard from './pages/PortfolioDashboard';
import FlashLoanDashboard from './pages/FlashLoanDashboard';

import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="exchanges" element={<Exchanges />} />
              <Route path="balances" element={<Balances />} />
              <Route path="transfers" element={<Transfers />} />
              <Route path="portfolio" element={<PortfolioDashboard />} />
              
              <Route path="arbitrage" element={<ArbitrageLayout />}>
                <Route index element={<ArbitrageDashboard />} />
                <Route path="config" element={<ArbitrageConfig />} />
                <Route path="execution" element={<ArbitrageExecution />} />
                <Route path="trades" element={<ArbitrageTrades />} />
              </Route>
              
              <Route path="cross-market" element={<CrossMarketLayout />}>
                <Route index element={<CrossMarketDashboard />} />
                <Route path="execution" element={<CrossMarketExecution />} />
                <Route path="trades" element={<CrossMarketTrades />} />
              </Route>
              
              <Route path="market-making" element={<MarketMakingLayout />}>
                <Route index element={<MarketMakingDashboard />} />
                <Route path="execution" element={<MarketMakingExecution />} />
                <Route path="trades" element={<MarketMakingTrades />} />
              </Route>
              
              <Route path="grid-bot" element={<GridBotLayout />}>
                <Route index element={<GridBotDashboard />} />
                <Route path="config" element={<GridBotConfig />} />
              </Route>
              
              <Route path="flash-loan" element={<FlashLoanDashboard />} />

              {/* Other routes will be added here */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
