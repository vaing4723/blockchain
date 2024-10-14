import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSpring, animated } from "react-spring";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

/** Address of the SPL Token program */
const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

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
          symbol: tokenData?.baseToken.symbol,
          name: tokenData?.baseToken.name,
          logoURI: tokenData?.info.imageUrl,
          price: parseFloat(tokenData?.priceUsd),
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

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000000) {
    return `$${(marketCap / 1000000000).toFixed(2)}B`;
  } else if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(2)}M`;
  } else if (marketCap >= 1000) {
    return `$${(marketCap / 1000).toFixed(2)}K`;
  } else {
    return `$${marketCap.toFixed(2)}`;
  }
}

const columns: ColumnDef<TokenInfo>[] = [
  {
    accessorKey: "symbol",
    header: ({ column }) => (
      <div className="flex items-center">
        Symbol
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="ml-2 h-8 w-8 p-0">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showPumpOnly"
                checked={column.getFilterValue() as boolean}
                onCheckedChange={(value) => column.setFilterValue(value)}
              />
              <Label htmlFor="showPumpOnly">Show Pump Tokens Only</Label>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.original.logoURI && (
          <img
            src={row.original.logoURI}
            alt={row.original.symbol}
            className="w-6 h-6 mr-2 rounded-full"
          />
        )}
        <a
          href={row.original.dexScreenerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {row.original.symbol}
        </a>
        {row.original.isPump && (
          <span className="ml-2 px-2 py-1 bg-purple-500 text-white rounded-full text-xs">
            PUMP
          </span>
        )}
      </div>
    ),
    filterFn: (row, id, value) => {
      if (!value) return true;
      return row.original.isPump;
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => row.original.amount.toFixed(4),
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Value (USD)
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => `$${(row.original.value ?? 0).toFixed(2)}`,
  },
  {
    accessorKey: "marketCap",
    header: ({ column }) => (
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Market Cap
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="ml-2 h-8 w-8 p-0">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={(column.getFilterValue() as [number, number])?.[0] || ""}
                onChange={(e) => {
                  const val = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  column.setFilterValue((old: [number, number]) => [
                    val,
                    old?.[1],
                  ]);
                }}
                className="w-24"
              />
              <span>to</span>
              <Input
                type="number"
                placeholder="Max"
                value={(column.getFilterValue() as [number, number])?.[1] || ""}
                onChange={(e) => {
                  const val = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  column.setFilterValue((old: [number, number]) => [
                    old?.[0],
                    val,
                  ]);
                }}
                className="w-24"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
    cell: ({ row }) => formatMarketCap(row.original.marketCap??0),
  },
];

function App() {
  const [address, setAddress] = useState(DEFAULT_WALLET);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [showPumpOnly, setShowPumpOnly] = useState(false);
  const [marketCapRange, setMarketCapRange] = useState<{
    min: number | null;
    max: number | null;
  }>({ min: null, max: null });
  const [hideSmallAssets, setHideSmallAssets] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState("auto");

  useLayoutEffect(() => {
    if (tableRef.current) {
      setTableHeight(`${tableRef.current.offsetHeight}px`);
    }
  }, []);

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
          marketCap: dexScreenerInfo.marketCap,
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

  const sortedAndFilteredTokens = useMemo(() => {
    let filteredTokens =
      accountInfo?.tokens.filter(
        (token) =>
          (token.symbol?.toLowerCase().includes(filterText.toLowerCase()) ||
            token.mint.toLowerCase().includes(filterText.toLowerCase())) &&
          (!showPumpOnly || token.isPump) &&
          (marketCapRange.min === null ||
            (token.marketCap || 0) >= marketCapRange.min) &&
          (marketCapRange.max === null ||
            (token.marketCap || 0) <= marketCapRange.max) &&
          (!hideSmallAssets || (token.value || 0) > 1) // Adjust the threshold as needed
      ) || [];

    if (sortConfig !== null) {
      filteredTokens.sort((a, b) => {
        if (
          (a[sortConfig.key as keyof TokenInfo] ?? 0) <
          (b[sortConfig.key as keyof TokenInfo] ?? 0)
        ) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (
          (a[sortConfig.key as keyof TokenInfo] ?? 0) >
          (b[sortConfig.key as keyof TokenInfo] ?? 0)
        ) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredTokens;
  }, [
    accountInfo,
    filterText,
    sortConfig,
    showPumpOnly,
    marketCapRange,
    hideSmallAssets,
  ]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const openDexScreener = (url: string) => {
    window.open(url, "_blank");
  };

  const table = useReactTable({
    data: (accountInfo?.tokens || []).filter(
      (token) => !hideSmallAssets || (token.value??0 >= 10)
    ),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableFilters: true,
  });

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
                </div>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-xl">Token Holdings</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hideSmallAssets"
                        checked={hideSmallAssets}
                        onCheckedChange={(checked) =>
                          setHideSmallAssets(checked as boolean)
                        }
                      />
                      <Label htmlFor="hideSmallAssets">Hide Small Assets</Label>
                    </div>
                  </CardHeader>
                  <div
                    ref={tableRef}
                    style={{ height: loading ? tableHeight : "auto" }}
                  >
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                              <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                  <th
                                    key={header.id}
                                    className="px-4 py-2 text-left"
                                  >
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody>
                            {table.getRowModel().rows.map((row) => (
                              <tr
                                key={row.id}
                                className="border-t border-gray-700"
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <td key={cell.id} className="px-4 py-2">
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </div>
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
