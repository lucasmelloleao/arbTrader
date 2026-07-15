import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Alert
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../api';

function PortfolioDashboard() {
  const [historyData, setHistoryData] = useState([]);
  const [currentBalances, setCurrentBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      const [historyRes, currentRes] = await Promise.all([
        api.get('/portfolio/history'),
        api.get('/portfolio/current')
      ]);

      const history = historyRes.data;
      const current = currentRes.data;

      // Process history data for chart
      // Group by timestamp (or round to nearest 15 mins) and sum totalUsdValue across exchanges
      const chartDataMap = {};
      
      history.forEach(snapshot => {
        // Round to nearest minute to group exchanges fetched in the same cron cycle
        const dateObj = new Date(snapshot.timestamp);
        dateObj.setSeconds(0, 0);
        const timeKey = dateObj.getTime();
        
        if (!chartDataMap[timeKey]) {
          chartDataMap[timeKey] = {
            time: timeKey,
            formattedTime: dateObj.toLocaleString(),
            totalUsdValue: 0
          };
        }
        
        chartDataMap[timeKey].totalUsdValue += snapshot.totalUsdValue;
      });

      const formattedChartData = Object.values(chartDataMap).sort((a, b) => a.time - b.time);
      
      setHistoryData(formattedChartData);
      setCurrentBalances(current);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const grandTotal = currentBalances.reduce((acc, curr) => acc + curr.totalUsdValue, 0);

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Evolução de Patrimônio
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Total Portfolio Value */}
        <Box>
          <Card sx={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" color="inherit" opacity={0.8}>
                Saldo Total (USDT)
              </Typography>
              <Typography variant="h3" component="div">
                $ {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Area Chart */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Histórico (Últimos Snapshots)
              </Typography>
              <Box sx={{ width: '100%', height: '60vh', minHeight: 400 }}>
                {historyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={historyData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="time" 
                        tick={{ fill: '#666' }}
                        tickFormatter={(val) => {
                          // Extract just HH:mm for better XAxis display if within same day
                          const d = new Date(val);
                          return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                        }}
                      />
                      <YAxis 
                        tickFormatter={(val) => `$${val}`}
                        domain={['auto', 'auto']}
                      />
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <Tooltip 
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Patrimônio (USD)']}
                        labelStyle={{ color: '#333' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="totalUsdValue" 
                        stroke="#8884d8" 
                        fillOpacity={1} 
                        fill="url(#colorUsd)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">Nenhum snapshot registrado ainda. Aguarde 15 minutos.</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Current Breakdown by Exchange (Tables) */}
        {currentBalances.map((exchangeData) => (
          <Box key={exchangeData._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {exchangeData.exchange} - $ {exchangeData.totalUsdValue.toFixed(2)}
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #444' }}>
                        <th style={{ padding: '8px' }}>Ativo</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Quantidade</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Valor USDT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exchangeData.balances
                        .sort((a, b) => b.usdValue - a.usdValue)
                        .map((asset) => (
                          <tr key={asset.asset} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ padding: '8px' }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                {asset.asset}
                              </Typography>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                              <Typography variant="body1">
                                {asset.total.toFixed(6)}
                              </Typography>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>
                              <Typography variant="body2" color="success.main">
                                ≈ $ {asset.usdValue.toFixed(2)}
                              </Typography>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default PortfolioDashboard;
