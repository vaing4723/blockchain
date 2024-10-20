import React, { useState, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, IconButton, Checkbox, FormControlLabel, Box, InputAdornment, 
  Typography, Popover, Divider
} from "@mui/material";
import { FilterList, Search, ArrowUpward, ArrowDownward, Close } from "@mui/icons-material";
import { formatMarketCap, formatToFirstNonZeroDecimal } from "./utils";

const TokenHoldingTable = ({ tokens }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [marketCapFilter, setMarketCapFilter] = useState({ min: "", max: "" });
  const [pairAgeFilter, setPairAgeFilter] = useState({ min: "", max: "" });
  const [volume24hFilter, setVolume24hFilter] = useState({ min: "", max: "" });
  const [hidePumpTokens, setHidePumpTokens] = useState(false);
  const [hideLowValueTokens, setHideLowValueTokens] = useState(false);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilter = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const calculatePairAge = (createdAtTimestamp) => {
    const now = Date.now();
    const createdDate = new Date(createdAtTimestamp);
    const differenceInHours = (now - createdDate.getTime()) / (1000 * 3600);

    if (differenceInHours < 24) {
      return `${Math.floor(differenceInHours)} 小时`;
    } else {
      return `${Math.floor(differenceInHours / 24)} 天`;
    }
  };

  const filteredAndSortedTokens = useMemo(() => {
    return tokens
      .filter((token) => {
        const pairAge = Math.floor((Date.now() - new Date(token.pairCreatedAt).getTime()) / (1000 * 3600 * 24));
        return (
          (token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            token.mint.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (!hidePumpTokens || !token.isPump) &&
          (!hideLowValueTokens || token.value >= 1) &&
          (marketCapFilter.min === "" || token.marketCap >= Number(marketCapFilter.min)) &&
          (marketCapFilter.max === "" || token.marketCap <= Number(marketCapFilter.max)) &&
          (pairAgeFilter.min === "" || pairAge >= Number(pairAgeFilter.min)) &&
          (pairAgeFilter.max === "" || pairAge <= Number(pairAgeFilter.max)) &&
          (volume24hFilter.min === "" || token.volume24h >= Number(volume24hFilter.min)) &&
          (volume24hFilter.max === "" || token.volume24h <= Number(volume24hFilter.max))
        );
      })
      .sort((a, b) => {
        if (sortConfig.key) {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
        }
        return 0;
      });
  }, [
    tokens,
    searchTerm,
    sortConfig,
    hidePumpTokens,
    hideLowValueTokens,
    marketCapFilter,
    pairAgeFilter,
    volume24hFilter,
  ]);

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, mr: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="请输入名称或地址"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      </Box>
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={hidePumpTokens}
              onChange={(e) => setHidePumpTokens(e.target.checked)}
            />
          }
          label="隐藏 Pump"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={hideLowValueTokens}
              onChange={(e) => setHideLowValueTokens(e.target.checked)}
            />
          }
          label="隐藏小额资产"
        />
      </Box>
      <Popover
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleCloseFilter}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 3, width: 300 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">筛选选项</Typography>
            <IconButton onClick={handleCloseFilter} size="small">
              <Close />
            </IconButton>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>市值</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="最小"
              type="number"
              value={marketCapFilter.min}
              onChange={(e) => setMarketCapFilter(prev => ({ ...prev, min: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="最大"
              type="number"
              value={marketCapFilter.max}
              onChange={(e) => setMarketCapFilter(prev => ({ ...prev, max: e.target.value }))}
              size="small"
              fullWidth
            />
          </Box>

          <Typography variant="subtitle1" gutterBottom>交易对年龄（天）</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="最小"
              type="number"
              value={pairAgeFilter.min}
              onChange={(e) => setPairAgeFilter(prev => ({ ...prev, min: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="最大"
              type="number"
              value={pairAgeFilter.max}
              onChange={(e) => setPairAgeFilter(prev => ({ ...prev, max: e.target.value }))}
              size="small"
              fullWidth
            />
          </Box>

          <Typography variant="subtitle1" gutterBottom>24小时交易量</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="最小"
              type="number"
              value={volume24hFilter.min}
              onChange={(e) => setVolume24hFilter(prev => ({ ...prev, min: e.target.value }))}
              size="small"
              fullWidth
            />
            <TextField
              label="最大"
              type="number"
              value={volume24hFilter.max}
              onChange={(e) => setVolume24hFilter(prev => ({ ...prev, max: e.target.value }))}
              size="small"
              fullWidth
            />
          </Box>
        </Box>
      </Popover>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ whiteSpace: "nowrap" }}>代币符号</TableCell>
              <TableCell style={{ whiteSpace: "nowrap" }}>余额</TableCell>
              <TableCell style={{ whiteSpace: "nowrap" }}>价格</TableCell>
              <TableCell
                style={{ whiteSpace: "nowrap" }}
                onClick={() => handleSort("priceChange24h")}
              >
                24小时涨跌 {sortConfig.key === "priceChange24h" &&
                  (sortConfig.direction === "asc" ? <ArrowUpward /> : <ArrowDownward />)}
              </TableCell>
              <TableCell
                style={{ whiteSpace: "nowrap" }}
                onClick={() => handleSort("value")}
              >
                价值 {sortConfig.key === "value" &&
                  (sortConfig.direction === "asc" ? <ArrowUpward /> : <ArrowDownward />)}
              </TableCell>
              <TableCell
                style={{ whiteSpace: "nowrap" }}
                onClick={() => handleSort("marketCap")}
              >
                市值 {sortConfig.key === "marketCap" &&
                  (sortConfig.direction === "asc" ? <ArrowUpward /> : <ArrowDownward />)}
              </TableCell>
              <TableCell
                style={{ whiteSpace: "nowrap" }}
                onClick={() => handleSort("volume24h")}
              >
                24小时交易量 {sortConfig.key === "volume24h" &&
                  (sortConfig.direction === "asc" ? <ArrowUpward /> : <ArrowDownward />)}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedTokens.map((token) => (
              <TableRow
                key={token.mint}
                onClick={() => window.open(`${token.url}`, "_blank")}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        marginRight: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {token.logoURI ? (
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#e0e0e0",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2">{token.symbol}</Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        {calculatePairAge(token.pairCreatedAt)}
                        {token.isPump && (
                          <img
                            src="/pump.png"
                            alt="Pump"
                            style={{
                              width: 16,
                              height: 16,
                              marginLeft: 8,
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{formatToFirstNonZeroDecimal(token.balance)}</TableCell>
                <TableCell>${formatToFirstNonZeroDecimal(token.price)}</TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'white',
                      backgroundColor: token.priceChange24h >= 0 ? 'green' : 'red',
                    }}
                  >
                    {token.priceChange24h >= 0 ? '+' : ''}
                    {token.priceChange24h.toFixed(2).padStart(6, ' ')}%
                  </Typography>
                </TableCell>
                <TableCell>${formatToFirstNonZeroDecimal(token.value)}</TableCell>
                <TableCell>{token.marketCap ? `${formatMarketCap(token.marketCap)}` : "-"}</TableCell>
                <TableCell>{token.volume24h ? `${formatMarketCap(token.volume24h)}` : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TokenHoldingTable;