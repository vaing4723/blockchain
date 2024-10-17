import styled from "@emotion/styled";
import { Card } from "@mui/material";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";

const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.VITE_HELIUS_API_KEY}`;
const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/tokens/";

export const fetchAccountInfo = async (address:any) => {
  const connection = new Connection(HELIUS_RPC);
  const pubKey = new PublicKey(address);

  const solBalance = await connection.getBalance(pubKey);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubKey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  });

  const solAccount:any = {
    pubkey: pubKey,
    account: {
      data: {
        parsed: {
          info: {
            mint: "So11111111111111111111111111111111111111112", 
            owner: pubKey.toString(),
            tokenAmount: {
              amount: solBalance.toString(),
              decimals: 9,
              uiAmount: solBalance / LAMPORTS_PER_SOL,
              uiAmountString: (solBalance / LAMPORTS_PER_SOL).toString()
            }
          },
          type: "account"
        },
        program: "spl-token",
        space: 165
      }
    }
  };

  tokenAccounts.value.unshift(solAccount);

  const tokens = await Promise.all(tokenAccounts.value.map(async (account) => {
    const tokenData = account.account.data.parsed.info;
    if (tokenData.tokenAmount.uiAmount === 0) return null;

    const dexScreenerInfo = await getTokenInfo(tokenData.mint);
    if (!dexScreenerInfo) return null;

    return {
      mint: tokenData.mint,
      amount: tokenData.tokenAmount.uiAmount,
      symbol: dexScreenerInfo.symbol,
      name: dexScreenerInfo.name,
      logoURI: dexScreenerInfo.logoURI,
      value: tokenData.tokenAmount.uiAmount * dexScreenerInfo.price,
      marketCap: dexScreenerInfo.marketCap,
      price: dexScreenerInfo.price,
      isLowRisk: dexScreenerInfo.isLowRisk,
      url: dexScreenerInfo.url
    };
  }));

  return {
    balance: solBalance / LAMPORTS_PER_SOL,
    tokens: tokens.filter(Boolean),
  };
};

const getTokenInfo = async (mintAddress:any) => {

  let isLowRisk = false;
  if (mintAddress === "So11111111111111111111111111111111111111112") {
    isLowRisk = true;
  }

  // USDT 处理
  if (mintAddress === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB") {
      isLowRisk = true;
  }

  // USDC 处理
  if (mintAddress === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") {
      isLowRisk = true;
  }

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
        isLowRisk: isLowRisk,
        url: tokenData.url
      };
    }
  } catch (error) {
    console.error("Error fetching token info from DEXScreener:", error);
  }
  return null;
};

export const formatMarketCap = (marketCap:any) => {
  if (!marketCap) return 'N/A';
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
  return `$${marketCap.toFixed(2)}`;
};

export const isPumpToken = (mintAddress:any) => {
  return mintAddress.toLowerCase().endsWith("pump");
};

export const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

export const formatToFirstNonZeroDecimal = (number) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '-';
  }

  // 对于整数，直接返回
  if (Number.isInteger(number)) {
    return number.toString();
  }

  // 对于小于 0.000001 的数
  if (number > 0 && number < 0.0001) {
    let str = number.toFixed(20);
    let match = str.match(/^0\.0*[1-9]/);
    if (match) {
      let zeros = match[0].length - 3;  // -3 是因为 "0." 和第一个非零数字
      let firstNonZero = match[0].slice(-1);
      return `0.{${zeros}}${firstNonZero}`;
    }
  }

  // 对于其他小数，显示到第一个非零小数位
  let str = number.toString();
  let match = str.match(/^-?\d+\.(\d*[1-9])/);
  
  if (match) {
    let [, decimals] = match;
    let significantDecimalIndex = decimals.search(/[1-9]/);
    return Number(number.toFixed(significantDecimalIndex + 1)).toString();
  }

  // 如果是 0，或者其他情况，返回原始数字的字符串表示
  return number.toString();
};