import React, { useEffect, useState } from 'react';
import { Typography, Grid, Card, CardContent, Box, CircularProgress, Alert } from '@mui/material';
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

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch portfolio history
        const historyRes = await api.get('/portfolio/history');
        
        setStats({ user: { username: 'Usuário' } });

        const history = historyRes.data;
        const chartDataMap = {};
        
        history.forEach(snapshot => {
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
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Principal
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Bem-vindo ao ArbTrade, {stats?.user?.username || 'Usuário'}!
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Evolução Patrimonial
          </Typography>
          <Box sx={{ width: '100%', height: '60vh', minHeight: 400 }}>
            {historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsdMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#666' }}
                    tickFormatter={(val) => {
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
                    fill="url(#colorUsdMain)" 
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
  );
}
