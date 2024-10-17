import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, CssBaseline, Container, Typography, Box, TextField, Button,
  Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, IconButton, Tooltip, Card, CardContent, Chip, Fade
} from '@mui/material';
import { styled } from '@mui/system';
import { Search, Refresh, NightsStay, WbSunny, Wallet } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import CountUp from 'react-countup';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

import { fetchAccountInfo, formatMarketCap, isPumpToken } from './utils';
import { lightTheme, darkTheme } from './theme';
import {StarryNightParticles, NetworkParticles, BubbleParticles} from './Background';
import TokenHoldingsTable from './TokenHoldingTable';
import TokenPriceChart from './TokenPriceChart';
import RiskAssessmentDashboard from './RiskAssessmentDashboard';
import PortfolioValueChart from './PortfolioValueChart';

const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const AnimatedTypography = styled(motion.div)(({ theme }) => ({
  display: 'inline-block',
}));

const LoadingAnimation = () => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="200px">
    <motion.div
      animate={{
        scale: [1, 2, 2, 1, 1],
        rotate: [0, 0, 270, 270, 0],
        borderRadius: ["20%", "20%", "50%", "50%", "20%"],
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 1
      }}
    >
      <Wallet style={{ fontSize: 50, color: '#1976d2' }} />
    </motion.div>
    <Typography variant="h6" style={{ marginTop: '20px' }}>正在加载钱包数据...</Typography>
  </Box>
);

const TokenDistributionChart = ({ tokens }) => {
  const data = tokens.slice(0, 5).map(token => ({
    name: token.symbol,
    value: token.value || 0
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const TokenValueChart = ({ tokens }) => {
  const data = tokens.slice(0, 10).map(token => ({
    name: token.symbol,
    value: token.value || 0,
    marketCap: token.marketCap || 0
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <RechartsTooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="value" fill="#8884d8" name="Value (USD)" />
        <Bar yAxisId="right" dataKey="marketCap" fill="#82ca9d" name="Market Cap" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const App = () => {
  const [address, setAddress] = useState('');
  const result:any = null;
  const [accountInfo, setAccountInfo] = useState(result);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const theme = darkMode ? darkTheme : lightTheme;
  const currentPortfolioValue = (tokens) => {
    return tokens.reduce((sum, token) => sum + (token.value || 0), 0)
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await fetchAccountInfo(address);
      setAccountInfo(info);
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const particlesInit = async (main:any) => {
    await loadFull(main);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StarryNightParticles darkMode={darkMode} />
      <StyledContainer maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h2" component="h1" gutterBottom align="right" sx={{
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                <Grid item xs={12} md={1}>
                <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <WbSunny /> : <NightsStay />}
                  </IconButton>
                </Tooltip>
              </Grid>
              </Typography>
            </motion.div>
          </AnimatePresence>
          
          <GlassCard elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="输入大哥钱包"
                  InputProps={{
                    startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAnalyze}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
                >
                  {loading ? "正在分析大哥钱包..." : "分析"}
                </Button>
              </Grid>
              
            </Grid>
          </GlassCard>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}

          {loading && <LoadingAnimation />}

          <AnimatePresence>
            {accountInfo && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5 }}
              >
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <GlassCard>
                      <CardContent>
                        <Typography variant="h5" gutterBottom>SOL 余额</Typography>
                        <Typography variant="h3">
                          <CountUp
                            end={accountInfo.balance}
                            decimals={4}
                            duration={2}
                            separator=","
                          />
                          <span style={{ fontSize: '0.6em' }}> SOL</span>
                        </Typography>
                      </CardContent>
                    </GlassCard>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <GlassCard>
                      <CardContent>
                        <Typography variant="h5" gutterBottom>持仓总价值</Typography>
                        <Typography variant="h3">
                          $<CountUp
                            end={accountInfo.tokens.reduce((sum, token) => sum + (token.value || 0), 0)}
                            decimals={2}
                            duration={2}
                            separator=","
                          />
                        </Typography>
                      </CardContent>
                    </GlassCard>
                  </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <PortfolioValueChart currentValue={currentPortfolioValue(accountInfo.tokens)} ></PortfolioValueChart>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RiskAssessmentDashboard tokens={accountInfo.tokens} totalValue={currentPortfolioValue(accountInfo.tokens)} ></RiskAssessmentDashboard>
                  </Grid>
                </Grid>

                <TokenHoldingsTable tokens={accountInfo.tokens}></TokenHoldingsTable>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </StyledContainer>
    </ThemeProvider>
  );
};

export default App;