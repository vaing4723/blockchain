import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { format, subDays } from 'date-fns';
import { GlassCard } from './utils';

// 模拟历史数据生成函数
const generateHistoricalData = (days, initialValue) => {
  const data:any[] = [];
  let currentValue = initialValue;

  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    // 模拟每日价值波动
    currentValue = currentValue * (1 + (Math.random() - 0.5) * 0.05);
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      value: parseFloat(currentValue.toFixed(2))
    });
  }

  return data;
};

const PortfolioValueChart = ({ currentValue }) => {
  const [timeRange, setTimeRange] = useState(30);
  const result : any[] = [];
  const [data, setData] = useState(result);

  useEffect(() => {
    // 生成历史数据
    const historicalData = generateHistoricalData(timeRange, currentValue);
    setData(historicalData);
  }, [timeRange, currentValue]);

  const handleRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <GlassCard elevation={3} sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>持仓价值趋势</Typography>
      <FormControl sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel>时间段</InputLabel>
        <Select value={timeRange} label="Time Range" onChange={handleRangeChange}>
          <MenuItem value={7}>近 7 天</MenuItem>
          <MenuItem value={30}>近 30 天</MenuItem>
          <MenuItem value={90}>近 90 天</MenuItem>
        </Select>
      </FormControl>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            domain={['dataMin', 'dataMax']} 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, "Portfolio Value"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
            name="Portfolio Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
};

export default PortfolioValueChart;