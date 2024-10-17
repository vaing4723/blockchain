import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { GlassCard } from './utils';

// 模拟数据，实际应用中应该从API获取
const generateMockPriceData = (days) => {
  const data:any[] = [];
  let price = 100;
  for (let i = days; i > 0; i--) {
    price = price * (1 + (Math.random() - 0.5) * 0.1);
    data.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: price.toFixed(10)
    });
  }
  return data;
};

const TokenPriceChart = ({ tokens }) => {
  const [selectedToken, setSelectedToken] = useState(tokens[0]?.symbol || '');
  const priceData = generateMockPriceData(30); // 30天的数据

  return (
    <GlassCard elevation={3} sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>Token Price Trend</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Token</InputLabel>
        <Select
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
          label="Select Token"
        >
          {tokens.map((token) => (
            <MenuItem key={token.symbol} value={token.symbol}>{token.symbol}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={priceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
};

export default TokenPriceChart;