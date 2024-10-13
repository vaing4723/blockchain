import { useState, } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSpring, animated } from "react-spring";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface TokenInfo {
  mint: string;
  amount: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
  value?: number;
  isPump: boolean;
}

interface AccountInfo {
  balance: number;
  tokens: TokenInfo[];
}

const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${
  import.meta.env.VITE_HELIUS_API_KEY
}`;
const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/tokens/";
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#83A6ED",
  "#8DD1E1",
  "#82CA9D",
  "#A4DE6C",
  "#D0ED57",
];
const DEFAULT_WALLET = "";

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
      if (
        response.data &&
        response.data.pairs &&
        response.data.pairs.length > 0
      ) {
        const tokenData = response.data.pairs[0];
        return {
          symbol: tokenData.baseToken.symbol,
          name: tokenData.baseToken.name,
          logoURI: tokenData.info.imageUrl,
          price: parseFloat(tokenData.priceUsd),
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

function App() {
  const [address, setAddress] = useState(DEFAULT_WALLET);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [sortByValue, setSortByValue] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "pump" | "non-pump">(
    "all"
  );

  const fadeIn = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 300 },
  });

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
          isPump,
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

  // useEffect(() => {
  //   fetchAccountInfo();
  // }, []);

  // const AnimatedNumber = ({ n }: { n: number }) => {
  //   const { number } = useSpring({
  //     from: { number: 0 },
  //     number: n,
  //     delay: 200,
  //     config: { mass: 1, tension: 20, friction: 10 },
  //   })
  //   return <animated.span>{number.to((n) => n.toFixed(4))}</animated.span>
  // }

  const filteredAndSortedTokens =
    accountInfo?.tokens
      .filter(
        (token) =>
          (token.name?.toLowerCase().includes(filterText.toLowerCase()) ||
            token.mint.toLowerCase().includes(filterText.toLowerCase())) &&
          (filterMode === "all" ||
            (filterMode === "pump" && token.isPump) ||
            (filterMode === "non-pump" && !token.isPump))
      )
      .sort((a, b) => (sortByValue ? (b.value || 0) - (a.value || 0) : 0)) ||
    [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-600 text-white p-8 relative overflow-hidden">
      <div className="watermark"></div>
      <div className="container mx-auto max-w-4xl relative z-10">
        <animated.h1
          style={fadeIn}
          className="text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-red-900"
        >
          JingouLa
        </animated.h1>
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">Smart Money</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Solana address"
                className="flex-grow bg-gray-700 border-gray-600 text-white"
                disabled={loading}
              />
              <Button
                onClick={fetchAccountInfo}
                disabled={loading}
                className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-200"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="mb-6 bg-red-900 border-red-800"
              >
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {accountInfo && (
              <>
                <animated.div style={fadeIn}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-xl">SOL Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-4xl font-bold">
                          {accountInfo.balance.toFixed(4)} SOL
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          Token Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={accountInfo.tokens}
                              dataKey="value"
                              nameKey="symbol"
                              cx="50%"
                              cy="50%"
                              outerRadius={70}
                              fill="#8884d8"
                            >
                              {accountInfo.tokens.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </animated.div>

                <Separator className="my-6 bg-gray-700" />

                <div className="mb-4 flex flex-wrap gap-2">
                  <Input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Filter tokens"
                    className="flex-grow bg-gray-700 border-gray-600 text-white"
                    disabled={loading}
                  />
                  <select
                    value={filterMode}
                    onChange={(e) =>
                      setFilterMode(
                        e.target.value as "all" | "pump" | "non-pump"
                      )
                    }
                    className="bg-gray-700 border-gray-600 text-white p-2 rounded"
                    disabled={loading}
                  >
                    <option value="all">All Tokens</option>
                    <option value="pump">Pump Tokens Only</option>
                    <option value="non-pump">Non-Pump Tokens Only</option>
                  </select>
                  <Button
                    onClick={() => setSortByValue(!sortByValue)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {sortByValue ? "Sort by Name" : "Sort by Value"}
                  </Button>
                </div>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl">Token Holdings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left">
                            <th className="pb-2">Symbol</th>
                            <th className="pb-2">Balance</th>
                            <th className="pb-2">Value (USD)</th>
                            <th className="pb-2">Contract</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAndSortedTokens.map((token) => (
                            <tr
                              key={token.mint}
                              className="border-t border-gray-700"
                            >
                              <td className="py-2 flex items-center">
                                {token.logoURI && (
                                  <img
                                    src={token.logoURI}
                                    alt={token.symbol}
                                    className="w-6 h-6 mr-2 rounded-full"
                                  />
                                )}
                                {token.symbol}
                                {token.isPump && (
                                  <span className="ml-2 px-2 py-1 bg-purple-500 text-white rounded-full text-xs">
                                    PUMP
                                  </span>
                                )}
                              </td>
                              <td className="py-2">
                                {token.amount.toFixed(4)}
                              </td>
                              <td className="py-2">
                                ${token.value ? token.value.toFixed(2) : "N/A"}
                              </td>
                              <td className="py-2 text-xs">{token.mint}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
