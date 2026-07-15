import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider
} from '@mui/material';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import api from '../api';

const GridBotConfig = () => {
  const [formData, setFormData] = useState({
    exchange: 'Binance',
    symbol: 'BTC/USDT',
    lowerPrice: '',
    upperPrice: '',
    gridLevels: 45,
    investment: '',
    profitCurrency: 'QUOTE',
    trailingUp: true,
    pumpProtection: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/grid-bot', {
        ...formData,
        lowerPrice: Number(formData.lowerPrice),
        upperPrice: Number(formData.upperPrice),
        gridLevels: Number(formData.gridLevels),
        investment: Number(formData.investment)
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao iniciar Grid Bot');
    } finally {
      setLoading(false);
    }
  };

  // Preview Grid Spacing
  const lower = Number(formData.lowerPrice);
  const upper = Number(formData.upperPrice);
  const levels = Number(formData.gridLevels);
  
  let gridSpacing = 0;
  let gridStepPercent = 0;

  if (upper > 0 && lower > 0 && levels > 0 && upper > lower) {
    gridSpacing = (upper - lower) / levels;
    // Step % is roughly (Spacing / LowerPrice) * 100 for visualization
    gridStepPercent = (gridSpacing / lower) * 100;
  }

  return (
    <Box sx={{ mx: -3, mt: -3 }}>
      <Grid container spacing={0}>
        {/* Parte Superior: Gráfico (Full Width) */}
        <Grid item xs={12} md={12}>
          <Card sx={{ height: '75vh', width: '100%', borderRadius: 0 }}>
            <div style={{ height: '100%', width: '100%' }}>
             <AdvancedRealTimeChart 
               theme="dark" 
               symbol={`${formData.exchange.toUpperCase()}:${formData.symbol.replace('/', '')}`}
               autosize
               allow_symbol_change={false}
               hide_side_toolbar={false}
             />
            </div>
          </Card>
        </Grid>

        {/* Parte Inferior: Formulário (Full Width) */}
        <Grid item xs={12} md={12} sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Criar Bot GRID
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Exchange"
                      name="exchange"
                      value={formData.exchange}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Par"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Investimento Total (USDT)"
                      name="investment"
                      value={formData.investment}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Preço Inferior"
                      name="lowerPrice"
                      value={formData.lowerPrice}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Preço Superior"
                      name="upperPrice"
                      value={formData.upperPrice}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Níveis de Grid"
                      name="gridLevels"
                      value={formData.gridLevels}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
                        <Typography variant="caption" color="text.secondary">Passo do Grid</Typography>
                        <Typography variant="body1">
                            {gridStepPercent > 0 ? `${gridStepPercent.toFixed(2)} %` : '-'}
                        </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Moeda de Lucro</InputLabel>
                      <Select
                        name="profitCurrency"
                        value={formData.profitCurrency}
                        label="Moeda de Lucro"
                        onChange={handleChange}
                      >
                        <MenuItem value="QUOTE">Moeda de Cotação ({formData.symbol.split('/')[1] || 'USDC'})</MenuItem>
                        <MenuItem value="BASE">Moeda Base ({formData.symbol.split('/')[0] || 'BTC'})</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch checked={formData.trailingUp} onChange={handleChange} name="trailingUp" />}
                      label="Trailing Up (Acompanhar Alta)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch checked={formData.pumpProtection} onChange={handleChange} name="pumpProtection" />}
                      label="Proteção contra Pump"
                    />
                  </Grid>

                  {success && (
                    <Grid item xs={12}>
                      <Alert severity="success">Grid Bot iniciado com sucesso!</Alert>
                    </Grid>
                  )}

                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error">{error}</Alert>
                    </Grid>
                  )}

                  <Grid item xs={12} mt={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      disabled={loading || gridSpacing <= 0}
                    >
                      {loading ? 'Iniciando...' : 'Iniciar Bot'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GridBotConfig;
