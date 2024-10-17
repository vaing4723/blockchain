import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Button, IconButton, Menu, MenuItem, Checkbox, FormControlLabel,
  Typography, Box,
  InputAdornment
} from '@mui/material';

import { Search, FilterList, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { formatToFirstNonZeroDecimal, GlassCard, isPumpToken } from './utils';
  
const TokenHoldingsTable = ({ tokens }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [marketCapFilter, setMarketCapFilter] = useState({ min: '', max: '' });
  const [hidePumpTokens, setHidePumpTokens] = useState(false);
  const [hideLowValueTokens, setHideLowValueTokens] = useState(false);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilter = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilter = () => {
    handleCloseFilter();
    // Apply filter logic here if needed
  };

  const filteredAndSortedTokens = useMemo(() => {
    return tokens
      .filter(token => 
        (token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
         token.mint.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!hidePumpTokens || !isPumpToken(token.mint)) &&
        (!hideLowValueTokens || token.value >= 1) &&
        (marketCapFilter.min === '' || token.marketCap >= Number(marketCapFilter.min)) &&
        (marketCapFilter.max === '' || token.marketCap <= Number(marketCapFilter.max))
      )
      .sort((a, b) => {
        if (sortConfig.key) {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        }
        return 0;
      });
  }, [tokens, searchTerm, sortConfig, hidePumpTokens, hideLowValueTokens, marketCapFilter]);

  return (
    <GlassCard elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom></Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 2 }}>
    <TextField
      size="small"
      placeholder="请输入名称或地址"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{ minWidth: '300px', width: '100%' }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
    />
  </Box>
  <IconButton onClick={handleFilter}>
    <FilterList />
  </IconButton>
  <Menu
    anchorEl={filterAnchorEl}
    open={Boolean(filterAnchorEl)}
    onClose={handleCloseFilter}
  >
    <MenuItem>
      <TextField
        label="Min Market Cap"
        type="number"
        value={marketCapFilter.min}
        onChange={(e) => setMarketCapFilter(prev => ({ ...prev, min: e.target.value }))}
        size="small"
      />
    </MenuItem>
    <MenuItem>
      <TextField
        label="Max Market Cap"
        type="number"
        value={marketCapFilter.max}
        onChange={(e) => setMarketCapFilter(prev => ({ ...prev, max: e.target.value }))}
        size="small"
      />
    </MenuItem>
    <MenuItem>
      <Button onClick={handleApplyFilter}>应用</Button>
    </MenuItem>
  </Menu>
</Box>
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={<Checkbox checked={hidePumpTokens} onChange={(e) => setHidePumpTokens(e.target.checked)} />}
          label="隐藏 Pump"
        />
        <FormControlLabel
          control={<Checkbox checked={hideLowValueTokens} onChange={(e) => setHideLowValueTokens(e.target.checked)} />}
          label="隐藏小额资产"
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ whiteSpace: 'nowrap' }}>名称</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap' }}>余额</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap' }}>价格</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap' }} onClick={() => handleSort('value')}>
                价值 {sortConfig.key === 'value' && (sortConfig.direction === 'asc' ? <ArrowUpward /> : <ArrowDownward />)}
              </TableCell>
              <TableCell style={{ whiteSpace: 'nowrap' }} onClick={() => handleSort('marketCap')}>
                市值 {sortConfig.key === 'marketCap' && (sortConfig.direction === 'asc' ? <ArrowUpward /> : <ArrowDownward />)}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedTokens.map((token) => (
              <TableRow key={token.mintAddress} onClick={() => token.url && window.open(token.url, '_blank')} sx={{ cursor: 'pointer' }}>
                <TableCell style={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {token.logoURI && <img src={token.logoURI} alt={token.symbol} style={{ width: 24, height: 24, marginRight: 8 }} />}
                    {token.symbol}
                    {isPumpToken(token.mint) && <img src='/pump.png' alt={token.symbol} style={{ width: 24, height: 24, marginLeft: 5 }} />}
                  </Box>
                </TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>{token.amount.toFixed(2)}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>${formatToFirstNonZeroDecimal(token.price)}</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>${token.value.toFixed(2)}</TableCell>
                <TableCell>
                {token.marketCap && token.marketCap > 0 
                    ? `$${token.marketCap.toLocaleString()}`
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GlassCard>
  );
};

export default TokenHoldingsTable;