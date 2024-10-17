import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="value" fill="#8884d8" name="Value (USD)" />
        <Bar yAxisId="right" dataKey="marketCap" fill="#82ca9d" name="Market Cap" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TokenValueChart;