import React from 'react';
import { Paper, Typography, Box, LinearProgress } from '@mui/material';
import { GlassCard, isPumpToken } from './utils';

// 风险评估算法
const calculateRiskScore = (tokens, totalValue) => {
  let lowRiskValue = 0;
  let mediumRiskValue = 0;
  let highMediumRiskValue = 0;
  let highRiskValue = 0;

  tokens.forEach(token => {
    const tokenValue = token.amount * token.price;
    if (token.isLowRisk) {
      lowRiskValue += tokenValue;
    }
    else if (token.marketCap >= 100000000) { // 1亿
      mediumRiskValue += tokenValue;
    }
    else if (token.marketCap >= 20000000) { // 2000万
      highMediumRiskValue += tokenValue;
    }
    else if (isPumpToken(token.mint)) {
      highRiskValue += tokenValue;
    } 
    else {
        highRiskValue += tokenValue;
    }
  });

  const lowRiskRatio = lowRiskValue / totalValue;
  const mediumRiskRatio = mediumRiskValue / totalValue;
  const highMediumRiskRatio = highMediumRiskValue / totalValue;
  const highRiskRatio = highRiskValue / totalValue;

  // 计算风险得分，这里我们给予不同风险级别不同的权重
  const riskScore = (
    (1 - lowRiskRatio) * 0 +
    mediumRiskRatio * 33 +
    highMediumRiskRatio * 66 +
    highRiskRatio * 100
  );

  return Math.min(100, Math.max(0, riskScore));
};

const RiskFactor = ({ name, value, color }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2">{name}</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={value} sx={{ height: 10, borderRadius: 5 }} color={color} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${value.toFixed(2)}%`}</Typography>
      </Box>
    </Box>
  </Box>
);

const RiskAssessmentDashboard = ({ tokens, totalValue }) => {
  const riskScore = calculateRiskScore(tokens, totalValue);

  const lowRiskValue = tokens.filter(t => t.symbol === 'SOL').reduce((sum, t) => sum + t.amount * t.price, 0);
  const mediumRiskValue = tokens.filter(t => t.marketCap >= 100000000).reduce((sum, t) => sum + t.amount * t.price, 0);
  const highMediumRiskValue = tokens.filter(t => t.marketCap >= 20000000).reduce((sum, t) => sum + t.amount * t.price, 0);
  const highRiskValue = tokens.filter(t => isPumpToken(t.mint)).reduce((sum, t) => sum + t.amount * t.price, 0);

  const riskFactors = [
    { name: '低风险', value: (lowRiskValue / totalValue) * 100, color: 'success' },
    { name: '中风险', value: (mediumRiskValue / totalValue) * 100, color: 'info' },
    { name: '中高风险', value: (highMediumRiskValue / totalValue) * 100, color: 'warning' },
    { name: '高风险', value: (highRiskValue / totalValue) * 100, color: 'error' },
  ];

  // 计算风险得分对应的颜色
  const getRiskColor = (score) => {
    const r = Math.round(255 * (score / 100));
    const g = Math.round(255 * (1 - score / 100));
    return `rgb(${r}, ${g}, 0)`;
  };

  return (
    <GlassCard elevation={3} sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>风险评估</Typography>
      {riskFactors.map((factor) => (
        <RiskFactor key={factor.name} name={factor.name} value={factor.value} color={factor.color} />
      ))}
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" gutterBottom>风险系数</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={riskScore}
              sx={{
                height: 20,
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getRiskColor(riskScore),
                },
              }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${riskScore.toFixed(2)}%`}</Typography>
          </Box>
        </Box>
      </Box>
    </GlassCard>
  );
};

export default RiskAssessmentDashboard;