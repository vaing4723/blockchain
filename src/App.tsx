import React, { useState } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";
import {
  ThemeProvider, createTheme, CssBaseline, Container, Typography, Box, TextField, Button,
  Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, IconButton, Popover, MenuItem, Select, FormControl, InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import { themes } from './theme';

/** Address of the SPL Token program */
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

interface TokenInfo {
  mint: string;
  amount: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
  value?: number;
  marketCap?: number;
  isPump: boolean;
  dexScreenerUrl?: string;
}

interface AccountInfo {
  balance: number;
  tokens: TokenInfo[];
}

const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`;
const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/tokens/";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#83A6ED", "#8DD1E1", "#82CA9D", "#A4DE6C", "#D0ED57"];
const DEFAULT_WALLET = "";
const PUMP = "/pump.png";

class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;

  enqueue(request: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push(() => request().then(resolve).catch(reject));
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        await request();
        await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay between requests
      }
    }
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

const getTokenInfo = async (mintAddress: string) => {
  return requestQueue.enqueue(async () => {
    try {
      const response = await axios.get(`${DEXSCREENER_API}${mintAddress}`);
      if (response.data && response.data.pairs && response.data.pairs.length > 0) {
        const tokenData = response.data.pairs[0];
        return {
          symbol: tokenData.baseToken.symbol,
          name: tokenData.baseToken.name,
          logoURI: tokenData.info?.imageUrl,
          price: parseFloat(tokenData.priceUsd),
          marketCap: tokenData.marketCap,
          dexScreenerUrl: tokenData.url
        };
      }
    } catch (error) {
      console.error("Error fetching token info from DEXScreener:", error);
    }
    return null;
  });
};

function isPumpToken(mintAddress: string): boolean {
  return mintAddress.toLowerCase().endsWith("pump");
}

function formatMarketCap(marketCap: number | undefined): string {
  if (!marketCap) return 'N/A';
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
  return `$${marketCap.toFixed(2)}`;
}

function App() {
  const [address, setAddress] = useState(DEFAULT_WALLET);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "pump" | "non-pump">("all");
  const [marketCapFilter, setMarketCapFilter] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [currentTheme, setCurrentTheme] = useState(themes.luxuryMetalTheme);

  const handleChangeTheme = (event: SelectChangeEvent) => {
    const selectedTheme = themes[event.target.value as keyof typeof themes];
    setCurrentTheme(selectedTheme);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;


  const fetchAccountInfo = async () => {
    setLoading(true);
    setError(null);
    setAccountInfo(null);
    try {
      const connection = new Connection(HELIUS_RPC);
      const pubKey = new PublicKey(address);

      const solBalance = await connection.getBalance(pubKey);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        pubKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const tokenPromises = tokenAccounts.value.map(async (account) => {
        const tokenData = account.account.data.parsed.info;
        if (tokenData.tokenAmount.uiAmount === 0) return null;

        const isPump = isPumpToken(tokenData.mint);
        const dexScreenerInfo = await getTokenInfo(tokenData.mint);

        if (!dexScreenerInfo) return null;

        const tokenInfo: TokenInfo = {
          mint: tokenData.mint,
          amount: tokenData.tokenAmount.uiAmount,
          symbol: dexScreenerInfo.symbol,
          name: dexScreenerInfo.name,
          logoURI: dexScreenerInfo.logoURI,
          value: tokenData.tokenAmount.uiAmount * dexScreenerInfo.price,
          marketCap: dexScreenerInfo.marketCap,
          isPump,
          dexScreenerUrl: dexScreenerInfo.dexScreenerUrl
        };

        setAccountInfo((prevInfo) => ({
          balance: solBalance / LAMPORTS_PER_SOL,
          tokens: [...(prevInfo?.tokens || []), tokenInfo],
        }));

        return tokenInfo;
      });

      await Promise.all(tokenPromises);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const sortedTokens = React.useMemo(() => {
    let sortableTokens = [...(accountInfo?.tokens || [])];
    if (sortConfig !== null) {
      sortableTokens.sort((a, b) => {
        if (a[sortConfig.key as keyof TokenInfo]! < b[sortConfig.key as keyof TokenInfo]!) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof TokenInfo]! > b[sortConfig.key as keyof TokenInfo]!) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTokens;
  }, [accountInfo, sortConfig]);
  
  const filteredAndSortedTokens = React.useMemo(() => {
    return (accountInfo?.tokens || [])
      .filter(token => 
        (token.symbol?.toLowerCase().includes(filterText.toLowerCase()) ||
        token.mint.toLowerCase().includes(filterText.toLowerCase())) &&
        (filterMode === 'all' || (filterMode === 'pump' && token.isPump) || (filterMode === 'non-pump' && !token.isPump)) &&
        (!marketCapFilter.min || (token.marketCap || 0) >= marketCapFilter.min) &&
        (!marketCapFilter.max || (token.marketCap || 0) <= marketCapFilter.max)
      )
      .sort((a, b) => {
        if (!sortConfig) return 0;
        if ((a[sortConfig.key as keyof TokenInfo]??0) < (b[sortConfig.key as keyof TokenInfo]??0)) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if ((a[sortConfig.key as keyof TokenInfo]??0) > (b[sortConfig.key as keyof TokenInfo]??0)) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
  }, [accountInfo, filterText, filterMode, marketCapFilter, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom align="center" sx={{
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          
          </Typography>
          <FormControl variant="outlined" style={{ margin: 16 }}>
        <InputLabel id="theme-select-label">选择主题</InputLabel>
        <Select
          labelId="theme-select-label"
          onChange={handleChangeTheme}
          defaultValue="luxuryMetalTheme"
        >
          {Object.keys(themes).map((themeKey) => (
            <MenuItem key={themeKey} value={themeKey}>
              {themeKey}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Smart Money
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Solana address"
                disabled={loading}
              />
              <Button
                variant="contained"
                onClick={fetchAccountInfo}
                disabled={loading}
                sx={{ minWidth: '120px' }}
              >
                {loading ? <CircularProgress size={24} /> : "Analyze"}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            )}

            {accountInfo && (
              <>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                      <Typography variant="h6">SOL Balance</Typography>
                      <Typography variant="h4">{accountInfo.balance.toFixed(4)} SOL</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                      <Typography variant="h6">Token Distribution</Typography>
                      <Box sx={{ height: 200 }}>
                        <PieChart
                          series={[
                            {
                              data: accountInfo.tokens.map((token, index) => ({
                                id: index,
                                value: token.value || 0,
                                label: token.symbol
                              })).sort((a, b) => b.value - a.value) // 按值降序排序
                              .slice(0, 5),
                              highlightScope: { faded: 'global', highlighted: 'item' },
                              faded: { innerRadius: 30, additionalRadius: -30 },
                            },
                          ]}
                          height={200}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Filter tokens"
                    sx={{ flexGrow: 1, mr: 2 }}
                  />
                  <IconButton onClick={handleClick}>
                    <FilterListIcon />
                  </IconButton>
                  <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="filter-mode-label">Filter Mode</InputLabel>
                        <Select
                          labelId="filter-mode-label"
                          value={filterMode}
                          onChange={(e) => setFilterMode(e.target.value as "all" | "pump" | "non-pump")}
                        >
                          <MenuItem value="all">All Tokens</MenuItem>
                          <MenuItem value="pump">Pump Tokens Only</MenuItem>
                          <MenuItem value="non-pump">Non-Pump Tokens Only</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Min Market Cap"
                        type="number"
                        value={marketCapFilter.min || ''}
                        onChange={(e) => setMarketCapFilter(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : null }))}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Max Market Cap"
                        type="number"
                        value={marketCapFilter.max || ''}
                        onChange={(e) => setMarketCapFilter(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : null }))}
                      />
                    </Box>
                                </Popover>
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Symbol</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell onClick={() => requestSort('value')} style={{ cursor: 'pointer' }}>
                          Value (USD) {sortConfig?.key === 'value' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                        </TableCell>
                        <TableCell onClick={() => requestSort('marketCap')} style={{ cursor: 'pointer' }}>
                          Market Cap {sortConfig?.key === 'marketCap' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                          {filteredAndSortedTokens.map((token) => (
                        <TableRow key={token.mint} onClick={() => token.dexScreenerUrl && window.open(token.dexScreenerUrl, '_blank')} sx={{ cursor: 'pointer' }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {token.logoURI && (
                                <img src={token.logoURI} alt={token.symbol} style={{ width: 24, height: 24, marginRight: 8, borderRadius: '50%' }} />
                                )}
                                {token.symbol}
                                {token.isPump && (
                                <img src={PUMP} alt={token.symbol} style={{ width: 24, height: 24, marginLeft: 8, borderRadius: '50%' }} />
                                )}
                            </Box>
                          </TableCell>
                          <TableCell>{token.amount.toFixed(4)}</TableCell>
                          <TableCell>${token.value ? token.value.toFixed(2) : 'N/A'}</TableCell>
                          <TableCell>{formatMarketCap(token.marketCap)}</TableCell>
                        </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
