import React from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TokenDistributionChart = ({ tokens }) => {
  const data = tokens.slice(0, 5).map(token => ({
    name: token.symbol,
    value: token.value || 0
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" label />
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default TokenDistributionChart;