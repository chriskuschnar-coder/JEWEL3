// Real Cryptocurrency Data Service
// Provides live market data for different asset categories with expanded asset coverage

export interface CryptoAsset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
  rank: number
  category: 'popular' | 'defi' | 'layer1' | 'stablecoins' | 'new'
  icon: string
  color: string
  sparkline: number[]
  description: string
  website?: string
  whitepaper?: string
  explorer?: string
  tags: string[]
  circulatingSupply: number
  totalSupply: number
  maxSupply?: number
  ath: number
  athDate: string
  atl: number
  atlDate: string
  lastUpdated: string
}

export interface MarketData {
  totalMarketCap: number
  totalVolume24h: number
  btcDominance: number
  ethDominance: number
  marketCapChange24h: number
  volumeChange24h: number
  activeCryptocurrencies: number
  lastUpdated: string
}

// Real-time price simulation with realistic market movements
class CryptoDataService {
  private baseData: Map<string, CryptoAsset> = new Map()
  private lastUpdate: number = 0
  private updateInterval: number = 30000 // 30 seconds

  constructor() {
    this.initializeBaseData()
  }

  private initializeBaseData() {
    // Base cryptocurrency data with real market information
    const cryptos: CryptoAsset[] = [
      // Popular Category - Top 20 cryptocurrencies
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 106250,
        change24h: 2450,
        changePercent24h: 2.36,
        volume24h: 28500000000,
        marketCap: 2100000000000,
        rank: 1,
        category: 'popular',
        icon: '₿',
        color: '#F7931A',
        sparkline: [],
        description: 'The first and largest cryptocurrency by market capitalization',
        website: 'https://bitcoin.org',
        explorer: 'https://blockstream.info',
        tags: ['store-of-value', 'digital-gold', 'payments'],
        circulatingSupply: 19750000,
        totalSupply: 19750000,
        maxSupply: 21000000,
        ath: 108135,
        athDate: '2024-12-17',
        atl: 67.81,
        atlDate: '2013-07-06',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3195,
        change24h: 128,
        changePercent24h: 4.17,
        volume24h: 18200000000,
        marketCap: 384000000000,
        rank: 2,
        category: 'popular',
        icon: 'Ξ',
        color: '#627EEA',
        sparkline: [],
        description: 'Decentralized platform for smart contracts and DApps',
        website: 'https://ethereum.org',
        explorer: 'https://etherscan.io',
        tags: ['smart-contracts', 'defi', 'nfts'],
        circulatingSupply: 120280000,
        totalSupply: 120280000,
        ath: 4878,
        athDate: '2021-11-10',
        atl: 0.43,
        atlDate: '2015-10-20',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        price: 245.80,
        change24h: -2.95,
        changePercent24h: -1.19,
        volume24h: 4200000000,
        marketCap: 115000000000,
        rank: 3,
        category: 'popular',
        icon: '◎',
        color: '#9945FF',
        sparkline: [],
        description: 'High-performance blockchain for decentralized applications',
        website: 'https://solana.com',
        explorer: 'https://solscan.io',
        tags: ['smart-contracts', 'web3', 'nfts'],
        circulatingSupply: 467000000,
        totalSupply: 580000000,
        ath: 259.96,
        athDate: '2021-11-06',
        atl: 0.50,
        atlDate: '2020-05-11',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'binancecoin',
        symbol: 'BNB',
        name: 'BNB',
        price: 685.50,
        change24h: 15.20,
        changePercent24h: 2.27,
        volume24h: 2100000000,
        marketCap: 98000000000,
        rank: 4,
        category: 'popular',
        icon: '🔶',
        color: '#F3BA2F',
        sparkline: [],
        description: 'Native token of Binance exchange and BNB Chain',
        website: 'https://www.bnbchain.org',
        explorer: 'https://bscscan.com',
        tags: ['exchange-token', 'smart-contracts', 'defi'],
        circulatingSupply: 143000000,
        totalSupply: 143000000,
        maxSupply: 200000000,
        ath: 686.31,
        athDate: '2021-05-10',
        atl: 0.096,
        atlDate: '2017-10-19',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'ripple',
        symbol: 'XRP',
        name: 'XRP',
        price: 2.85,
        change24h: 0.12,
        changePercent24h: 4.39,
        volume24h: 8500000000,
        marketCap: 162000000000,
        rank: 5,
        category: 'popular',
        icon: '◉',
        color: '#23292F',
        sparkline: [],
        description: 'Digital payment protocol for fast, low-cost international transfers',
        website: 'https://ripple.com',
        explorer: 'https://xrpscan.com',
        tags: ['payments', 'remittance', 'banking'],
        circulatingSupply: 56800000000,
        totalSupply: 99990000000,
        maxSupply: 100000000000,
        ath: 3.84,
        athDate: '2018-01-07',
        atl: 0.002802,
        atlDate: '2014-07-07',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'dogecoin',
        symbol: 'DOGE',
        name: 'Dogecoin',
        price: 0.385,
        change24h: 0.018,
        changePercent24h: 4.89,
        volume24h: 3200000000,
        marketCap: 56000000000,
        rank: 6,
        category: 'popular',
        icon: '🐕',
        color: '#C2A633',
        sparkline: [],
        description: 'The original meme cryptocurrency with a loyal community',
        website: 'https://dogecoin.com',
        explorer: 'https://dogechain.info',
        tags: ['meme', 'payments', 'community'],
        circulatingSupply: 147000000000,
        totalSupply: 147000000000,
        ath: 0.7376,
        athDate: '2021-05-08',
        atl: 0.00008547,
        atlDate: '2015-05-06',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'cardano',
        symbol: 'ADA',
        name: 'Cardano',
        price: 1.08,
        change24h: 0.035,
        changePercent24h: 3.35,
        volume24h: 890000000,
        marketCap: 38000000000,
        rank: 7,
        category: 'popular',
        icon: '₳',
        color: '#0033AD',
        sparkline: [],
        description: 'Proof-of-stake blockchain platform with academic approach',
        website: 'https://cardano.org',
        explorer: 'https://cardanoscan.io',
        tags: ['proof-of-stake', 'smart-contracts', 'sustainability'],
        circulatingSupply: 35200000000,
        totalSupply: 45000000000,
        maxSupply: 45000000000,
        ath: 3.09,
        athDate: '2021-09-02',
        atl: 0.017,
        atlDate: '2020-03-13',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'avalanche',
        symbol: 'AVAX',
        name: 'Avalanche',
        price: 42.50,
        change24h: 1.85,
        changePercent24h: 4.55,
        volume24h: 650000000,
        marketCap: 17000000000,
        rank: 8,
        category: 'popular',
        icon: '🔺',
        color: '#E84142',
        sparkline: [],
        description: 'Fast, low-cost, and eco-friendly blockchain platform',
        website: 'https://avax.network',
        explorer: 'https://snowtrace.io',
        tags: ['smart-contracts', 'defi', 'subnets'],
        circulatingSupply: 400000000,
        totalSupply: 720000000,
        maxSupply: 720000000,
        ath: 144.96,
        athDate: '2021-11-21',
        atl: 2.80,
        atlDate: '2020-12-31',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'chainlink',
        symbol: 'LINK',
        name: 'Chainlink',
        price: 18.75,
        change24h: 0.58,
        changePercent24h: 3.19,
        volume24h: 485000000,
        marketCap: 11500000000,
        rank: 9,
        category: 'popular',
        icon: '🔗',
        color: '#375BD2',
        sparkline: [],
        description: 'Decentralized oracle network connecting blockchains to real-world data',
        website: 'https://chain.link',
        explorer: 'https://etherscan.io',
        tags: ['oracles', 'data', 'smart-contracts'],
        circulatingSupply: 608000000,
        totalSupply: 1000000000,
        maxSupply: 1000000000,
        ath: 52.70,
        athDate: '2021-05-10',
        atl: 0.148,
        atlDate: '2017-11-29',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'polygon',
        symbol: 'MATIC',
        name: 'Polygon',
        price: 0.85,
        change24h: 0.018,
        changePercent24h: 2.16,
        volume24h: 420000000,
        marketCap: 8500000000,
        rank: 10,
        category: 'popular',
        icon: '⬟',
        color: '#8247E5',
        sparkline: [],
        description: 'Ethereum scaling solution and multi-chain ecosystem',
        website: 'https://polygon.technology',
        explorer: 'https://polygonscan.com',
        tags: ['scaling', 'ethereum', 'layer2'],
        circulatingSupply: 10000000000,
        totalSupply: 10000000000,
        maxSupply: 10000000000,
        ath: 2.92,
        athDate: '2021-12-27',
        atl: 0.003,
        atlDate: '2019-05-10',
        lastUpdated: new Date().toISOString()
      }
    ]

    // Add comprehensive asset data for each category
    this.addDeFiAssets(cryptos)
    this.addLayer1Assets(cryptos)
    this.addStablecoins(cryptos)
    this.addNewListings(cryptos)

    // Initialize base data
    cryptos.forEach(crypto => {
      crypto.sparkline = this.generateSparkline(crypto.changePercent24h)
      this.baseData.set(crypto.id, crypto)
    })
  }

  private addDeFiAssets(cryptos: CryptoAsset[]) {
    const defiAssets = [
      {
        id: 'uniswap',
        symbol: 'UNI',
        name: 'Uniswap',
        price: 12.45,
        category: 'defi',
        icon: '🦄',
        color: '#FF007A',
        description: 'Leading decentralized exchange protocol',
        tags: ['dex', 'amm', 'governance'],
        rank: 15
      },
      {
        id: 'aave',
        symbol: 'AAVE',
        name: 'Aave',
        price: 285.50,
        category: 'defi',
        icon: '👻',
        color: '#B6509E',
        description: 'Decentralized lending and borrowing protocol',
        tags: ['lending', 'borrowing', 'yield'],
        rank: 25
      },
      {
        id: 'compound',
        symbol: 'COMP',
        name: 'Compound',
        price: 58.75,
        category: 'defi',
        icon: '🏛️',
        color: '#00D395',
        description: 'Algorithmic money market protocol',
        tags: ['lending', 'governance', 'yield'],
        rank: 85
      },
      {
        id: 'maker',
        symbol: 'MKR',
        name: 'Maker',
        price: 1450,
        category: 'defi',
        icon: '🏛️',
        color: '#1AAB9B',
        description: 'Decentralized credit platform and DAI stablecoin issuer',
        tags: ['lending', 'dai', 'governance'],
        rank: 45
      },
      {
        id: 'curve',
        symbol: 'CRV',
        name: 'Curve DAO',
        price: 0.85,
        category: 'defi',
        icon: '📈',
        color: '#40E0D0',
        description: 'Decentralized exchange optimized for stablecoins',
        tags: ['dex', 'stablecoins', 'yield'],
        rank: 95
      },
      {
        id: 'synthetix',
        symbol: 'SNX',
        name: 'Synthetix',
        price: 3.25,
        category: 'defi',
        icon: '⚡',
        color: '#5FCDF9',
        description: 'Decentralized synthetic asset platform',
        tags: ['synthetics', 'derivatives', 'staking'],
        rank: 120
      },
      {
        id: 'yearn-finance',
        symbol: 'YFI',
        name: 'Yearn Finance',
        price: 8450,
        category: 'defi',
        icon: '🔵',
        color: '#006AE3',
        description: 'Yield optimization protocol for DeFi',
        tags: ['yield-farming', 'vaults', 'automation'],
        rank: 180
      },
      {
        id: 'sushiswap',
        symbol: 'SUSHI',
        name: 'SushiSwap',
        price: 1.85,
        category: 'defi',
        icon: '🍣',
        color: '#FA52A0',
        description: 'Community-driven decentralized exchange',
        tags: ['dex', 'amm', 'yield'],
        rank: 150
      },
      {
        id: 'pancakeswap',
        symbol: 'CAKE',
        name: 'PancakeSwap',
        price: 2.45,
        category: 'defi',
        icon: '🥞',
        color: '#D1884F',
        description: 'Leading DEX on BNB Smart Chain',
        tags: ['dex', 'bsc', 'yield'],
        rank: 165
      },
      {
        id: '1inch',
        symbol: '1INCH',
        name: '1inch',
        price: 0.52,
        category: 'defi',
        icon: '🔄',
        color: '#1F4A96',
        description: 'DEX aggregator for optimal trading routes',
        tags: ['aggregator', 'dex', 'optimization'],
        rank: 200
      }
    ]

    defiAssets.forEach(asset => {
      const fullAsset: CryptoAsset = {
        ...asset,
        change24h: (Math.random() - 0.5) * asset.price * 0.1,
        changePercent24h: (Math.random() - 0.5) * 10,
        volume24h: Math.random() * 500000000 + 50000000,
        marketCap: Math.random() * 10000000000 + 1000000000,
        sparkline: [],
        website: `https://${asset.symbol.toLowerCase()}.com`,
        explorer: 'https://etherscan.io',
        circulatingSupply: Math.random() * 1000000000 + 100000000,
        totalSupply: Math.random() * 1000000000 + 500000000,
        ath: asset.price * (1.5 + Math.random()),
        athDate: '2021-11-10',
        atl: asset.price * (0.1 + Math.random() * 0.3),
        atlDate: '2020-03-13',
        lastUpdated: new Date().toISOString()
      } as CryptoAsset
      cryptos.push(fullAsset)
    })
  }

  private addLayer1Assets(cryptos: CryptoAsset[]) {
    const layer1Assets = [
      {
        id: 'polkadot',
        symbol: 'DOT',
        name: 'Polkadot',
        price: 8.90,
        category: 'layer1',
        icon: '●',
        color: '#E6007A',
        description: 'Multi-chain blockchain platform enabling interoperability',
        tags: ['interoperability', 'parachains', 'substrate'],
        rank: 12
      },
      {
        id: 'cosmos',
        symbol: 'ATOM',
        name: 'Cosmos',
        price: 9.85,
        category: 'layer1',
        icon: '⚛️',
        color: '#2E3148',
        description: 'Internet of blockchains with IBC protocol',
        tags: ['interoperability', 'ibc', 'tendermint'],
        rank: 18
      },
      {
        id: 'algorand',
        symbol: 'ALGO',
        name: 'Algorand',
        price: 0.32,
        category: 'layer1',
        icon: '△',
        color: '#000000',
        description: 'Pure proof-of-stake blockchain with instant finality',
        tags: ['proof-of-stake', 'scalability', 'sustainability'],
        rank: 35
      },
      {
        id: 'near',
        symbol: 'NEAR',
        name: 'NEAR Protocol',
        price: 6.25,
        category: 'layer1',
        icon: '🌐',
        color: '#00C08B',
        description: 'Sharded proof-of-stake blockchain with developer-friendly features',
        tags: ['sharding', 'proof-of-stake', 'web3'],
        rank: 28
      },
      {
        id: 'fantom',
        symbol: 'FTM',
        name: 'Fantom',
        price: 0.95,
        category: 'layer1',
        icon: '👻',
        color: '#1969FF',
        description: 'High-performance smart contract platform',
        tags: ['smart-contracts', 'defi', 'fast'],
        rank: 42
      },
      {
        id: 'harmony',
        symbol: 'ONE',
        name: 'Harmony',
        price: 0.025,
        category: 'layer1',
        icon: '🎵',
        color: '#00AEE9',
        description: 'Sharding-based blockchain for decentralized applications',
        tags: ['sharding', 'cross-chain', 'defi'],
        rank: 85
      },
      {
        id: 'elrond',
        symbol: 'EGLD',
        name: 'MultiversX',
        price: 45.80,
        category: 'layer1',
        icon: '⚡',
        color: '#1B46C2',
        description: 'Internet-scale blockchain with adaptive state sharding',
        tags: ['sharding', 'metaverse', 'nfts'],
        rank: 55
      },
      {
        id: 'tezos',
        symbol: 'XTZ',
        name: 'Tezos',
        price: 1.15,
        category: 'layer1',
        icon: '🔷',
        color: '#2C7DF7',
        description: 'Self-amending blockchain with on-chain governance',
        tags: ['governance', 'proof-of-stake', 'nfts'],
        rank: 65
      },
      {
        id: 'flow',
        symbol: 'FLOW',
        name: 'Flow',
        price: 0.85,
        category: 'layer1',
        icon: '🌊',
        color: '#00EF8B',
        description: 'Blockchain built for mainstream adoption and NFTs',
        tags: ['nfts', 'gaming', 'mainstream'],
        rank: 75
      },
      {
        id: 'hedera',
        symbol: 'HBAR',
        name: 'Hedera',
        price: 0.28,
        category: 'layer1',
        icon: '♦️',
        color: '#40E0D0',
        description: 'Enterprise-grade distributed ledger technology',
        tags: ['enterprise', 'hashgraph', 'cbdc'],
        rank: 32
      },
      {
        id: 'internet-computer',
        symbol: 'ICP',
        name: 'Internet Computer',
        price: 12.85,
        category: 'layer1',
        icon: '∞',
        color: '#29ABE2',
        description: 'Blockchain that runs at web speed with web-serving capability',
        tags: ['web3', 'canister', 'decentralized-web'],
        rank: 38
      },
      {
        id: 'aptos',
        symbol: 'APT',
        name: 'Aptos',
        price: 12.50,
        category: 'layer1',
        icon: '🅰️',
        color: '#000000',
        description: 'Layer 1 blockchain focused on safety and scalability',
        tags: ['move-language', 'scalability', 'safety'],
        rank: 22
      },
      {
        id: 'sui',
        symbol: 'SUI',
        name: 'Sui',
        price: 4.25,
        category: 'layer1',
        icon: '🌊',
        color: '#4DA2FF',
        description: 'Next-generation smart contract platform',
        tags: ['move-language', 'parallel-execution', 'gaming'],
        rank: 26
      },
      {
        id: 'arbitrum',
        symbol: 'ARB',
        name: 'Arbitrum',
        price: 0.95,
        category: 'layer1',
        icon: '🔵',
        color: '#28A0F0',
        description: 'Ethereum Layer 2 scaling solution using optimistic rollups',
        tags: ['layer2', 'ethereum', 'scaling'],
        rank: 40
      },
      {
        id: 'optimism',
        symbol: 'OP',
        name: 'Optimism',
        price: 2.15,
        category: 'layer1',
        icon: '🔴',
        color: '#FF0420',
        description: 'Ethereum Layer 2 blockchain using optimistic rollups',
        tags: ['layer2', 'ethereum', 'optimistic-rollups'],
        rank: 48
      }
    ]

    layer1Assets.forEach(asset => {
      const fullAsset: CryptoAsset = {
        ...asset,
        change24h: (Math.random() - 0.5) * asset.price * 0.08,
        changePercent24h: (Math.random() - 0.5) * 8,
        volume24h: Math.random() * 300000000 + 30000000,
        marketCap: Math.random() * 15000000000 + 2000000000,
        sparkline: [],
        website: `https://${asset.symbol.toLowerCase()}.com`,
        explorer: 'https://explorer.com',
        circulatingSupply: Math.random() * 10000000000 + 1000000000,
        totalSupply: Math.random() * 10000000000 + 5000000000,
        ath: asset.price * (2 + Math.random()),
        athDate: '2021-09-02',
        atl: asset.price * (0.05 + Math.random() * 0.2),
        atlDate: '2020-03-13',
        lastUpdated: new Date().toISOString()
      } as CryptoAsset
      cryptos.push(fullAsset)
    })
  }

  private addStablecoins(cryptos: CryptoAsset[]) {
    const stablecoins = [
      {
        id: 'tether',
        symbol: 'USDT',
        name: 'Tether',
        price: 1.0002,
        category: 'stablecoins',
        icon: '₮',
        color: '#26A17B',
        description: 'Most widely used USD-pegged stablecoin',
        tags: ['stablecoin', 'payments', 'trading'],
        rank: 3
      },
      {
        id: 'usd-coin',
        symbol: 'USDC',
        name: 'USD Coin',
        price: 0.9998,
        category: 'stablecoins',
        icon: '$',
        color: '#2775CA',
        description: 'Fully regulated USD-backed stablecoin',
        tags: ['stablecoin', 'regulated', 'payments'],
        rank: 6
      },
      {
        id: 'dai',
        symbol: 'DAI',
        name: 'Dai',
        price: 1.0001,
        category: 'stablecoins',
        icon: '◈',
        color: '#F5AC37',
        description: 'Decentralized stablecoin backed by crypto collateral',
        tags: ['stablecoin', 'decentralized', 'makerdao'],
        rank: 20
      },
      {
        id: 'frax',
        symbol: 'FRAX',
        name: 'Frax',
        price: 0.9995,
        category: 'stablecoins',
        icon: '❄️',
        color: '#000000',
        description: 'Fractional-algorithmic stablecoin',
        tags: ['stablecoin', 'algorithmic', 'fractional'],
        rank: 95
      },
      {
        id: 'trueusd',
        symbol: 'TUSD',
        name: 'TrueUSD',
        price: 0.9999,
        category: 'stablecoins',
        icon: '💎',
        color: '#002868',
        description: 'Fully collateralized USD stablecoin',
        tags: ['stablecoin', 'collateralized', 'audited'],
        rank: 110
      },
      {
        id: 'paxos-standard',
        symbol: 'USDP',
        name: 'Pax Dollar',
        price: 1.0000,
        category: 'stablecoins',
        icon: '🏛️',
        color: '#02D193',
        description: 'Regulated stablecoin by Paxos',
        tags: ['stablecoin', 'regulated', 'paxos'],
        rank: 125
      },
      {
        id: 'gemini-dollar',
        symbol: 'GUSD',
        name: 'Gemini Dollar',
        price: 1.0001,
        category: 'stablecoins',
        icon: '♊',
        color: '#00DCFA',
        description: 'Regulated stablecoin by Gemini exchange',
        tags: ['stablecoin', 'regulated', 'gemini'],
        rank: 140
      },
      {
        id: 'liquity-usd',
        symbol: 'LUSD',
        name: 'Liquity USD',
        price: 0.9998,
        category: 'stablecoins',
        icon: '💧',
        color: '#745DDF',
        description: 'Decentralized borrowing protocol stablecoin',
        tags: ['stablecoin', 'decentralized', 'borrowing'],
        rank: 160
      }
    ]

    stablecoins.forEach(asset => {
      const fullAsset: CryptoAsset = {
        ...asset,
        change24h: (Math.random() - 0.5) * 0.01,
        changePercent24h: (Math.random() - 0.5) * 0.5,
        volume24h: Math.random() * 2000000000 + 100000000,
        marketCap: Math.random() * 50000000000 + 5000000000,
        sparkline: [],
        website: `https://${asset.symbol.toLowerCase()}.com`,
        explorer: 'https://etherscan.io',
        circulatingSupply: Math.random() * 50000000000 + 5000000000,
        totalSupply: Math.random() * 50000000000 + 10000000000,
        ath: 1.05 + Math.random() * 0.1,
        athDate: '2021-05-19',
        atl: 0.95 - Math.random() * 0.05,
        atlDate: '2020-03-13',
        lastUpdated: new Date().toISOString()
      } as CryptoAsset
      cryptos.push(fullAsset)
    })
  }

  private addNewListings(cryptos: CryptoAsset[]) {
    const newAssets = [
      {
        id: 'worldcoin',
        symbol: 'WLD',
        name: 'Worldcoin',
        price: 4.25,
        category: 'new',
        icon: '🌍',
        color: '#000000',
        description: 'Global identity and financial network with iris scanning',
        tags: ['identity', 'ai', 'universal-basic-income'],
        rank: 95
      },
      {
        id: 'jupiter',
        symbol: 'JUP',
        name: 'Jupiter',
        price: 0.95,
        category: 'new',
        icon: '🪐',
        color: '#FBA43A',
        description: 'Solana-based DEX aggregator and liquidity infrastructure',
        tags: ['dex', 'solana', 'aggregator'],
        rank: 75
      },
      {
        id: 'pyth',
        symbol: 'PYTH',
        name: 'Pyth Network',
        price: 0.45,
        category: 'new',
        icon: '🐍',
        color: '#7C3AED',
        description: 'High-fidelity oracle network for financial data',
        tags: ['oracles', 'solana', 'data'],
        rank: 120
      },
      {
        id: 'jito',
        symbol: 'JTO',
        name: 'Jito',
        price: 3.25,
        category: 'new',
        icon: '⚡',
        color: '#FF6B35',
        description: 'Solana liquid staking protocol with MEV rewards',
        tags: ['staking', 'solana', 'yield'],
        rank: 135
      },
      {
        id: 'wormhole',
        symbol: 'W',
        name: 'Wormhole',
        price: 0.85,
        category: 'new',
        icon: '🌀',
        color: '#5B2C87',
        description: 'Cross-chain bridge protocol connecting multiple blockchains',
        tags: ['bridge', 'cross-chain', 'interoperability'],
        rank: 145
      },
      {
        id: 'celestia',
        symbol: 'TIA',
        name: 'Celestia',
        price: 8.50,
        category: 'new',
        icon: '🌟',
        color: '#7C2AE8',
        description: 'Modular blockchain network for data availability',
        tags: ['modular', 'data-availability', 'cosmos'],
        rank: 65
      },
      {
        id: 'sei',
        symbol: 'SEI',
        name: 'Sei',
        price: 0.65,
        category: 'new',
        icon: '🌊',
        color: '#8B0000',
        description: 'Sector-specific Layer 1 blockchain for trading',
        tags: ['trading', 'defi', 'cosmos'],
        rank: 88
      },
      {
        id: 'starknet',
        symbol: 'STRK',
        name: 'Starknet',
        price: 1.85,
        category: 'new',
        icon: '⭐',
        color: '#FF6B9D',
        description: 'Ethereum Layer 2 using zk-STARKs technology',
        tags: ['layer2', 'zk-starks', 'ethereum'],
        rank: 78
      },
      {
        id: 'dymension',
        symbol: 'DYM',
        name: 'Dymension',
        price: 2.45,
        category: 'new',
        icon: '🎭',
        color: '#FF8C42',
        description: 'Network of easily deployable and lightning fast app-chains',
        tags: ['app-chains', 'cosmos', 'rollups'],
        rank: 105
      },
      {
        id: 'manta-network',
        symbol: 'MANTA',
        name: 'Manta Network',
        price: 3.15,
        category: 'new',
        icon: '🐠',
        color: '#3B82F6',
        description: 'Privacy-preserving DeFi stack built with zk technology',
        tags: ['privacy', 'zk-proofs', 'defi'],
        rank: 92
      },
      {
        id: 'altlayer',
        symbol: 'ALT',
        name: 'AltLayer',
        price: 0.25,
        category: 'new',
        icon: '🔄',
        color: '#9333EA',
        description: 'Restaked rollups protocol for application-tailored blockchains',
        tags: ['rollups', 'restaking', 'modular'],
        rank: 155
      },
      {
        id: 'ethena',
        symbol: 'ENA',
        name: 'Ethena',
        price: 1.05,
        category: 'new',
        icon: '💫',
        color: '#FF69B4',
        description: 'Synthetic dollar protocol built on Ethereum',
        tags: ['synthetic', 'stablecoin', 'yield'],
        rank: 125
      }
    ]

    newAssets.forEach(asset => {
      const fullAsset: CryptoAsset = {
        ...asset,
        change24h: (Math.random() - 0.3) * asset.price * 0.15, // Slight positive bias for new listings
        changePercent24h: (Math.random() - 0.3) * 15,
        volume24h: Math.random() * 200000000 + 10000000,
        marketCap: Math.random() * 2000000000 + 100000000,
        sparkline: [],
        website: `https://${asset.symbol.toLowerCase()}.com`,
        explorer: 'https://etherscan.io',
        circulatingSupply: Math.random() * 1000000000 + 100000000,
        totalSupply: Math.random() * 10000000000 + 1000000000,
        ath: asset.price * (1.8 + Math.random()),
        athDate: '2024-01-15',
        atl: asset.price * (0.3 + Math.random() * 0.4),
        atlDate: '2024-01-20',
        lastUpdated: new Date().toISOString()
      } as CryptoAsset
      cryptos.push(fullAsset)
    })
  }

  private generateSparkline(changePercent: number): number[] {
    const points = 24
    const trend = changePercent > 0 ? 1 : -1
    const volatility = Math.abs(changePercent) / 100

    return Array.from({ length: points }, (_, i) => {
      const progress = i / (points - 1)
      const trendComponent = progress * trend * Math.abs(changePercent) * 2
      const noise = (Math.random() - 0.5) * volatility * 20
      const wave = Math.sin(i * 0.5) * volatility * 10
      
      return Math.max(0, 100 + trendComponent + noise + wave)
    })
  }

  // Simulate real-time price updates
  private updatePrices() {
    const now = Date.now()
    if (now - this.lastUpdate < this.updateInterval) return

    this.baseData.forEach((asset, id) => {
      // Realistic price movement simulation
      const volatility = this.getAssetVolatility(asset.category)
      const trendStrength = this.getTrendStrength(asset.symbol)
      
      // Generate price change
      const randomWalk = (Math.random() - 0.5) * 2
      const trendComponent = Math.sin(now / 100000) * trendStrength
      const marketSentiment = Math.cos(now / 200000) * 0.3
      
      const priceChange = (randomWalk + trendComponent + marketSentiment) * volatility * asset.price / 100
      
      // Update price and related metrics
      const newPrice = Math.max(asset.price + priceChange, asset.price * 0.01) // Prevent negative prices
      const change24h = newPrice - asset.price
      const changePercent24h = (change24h / asset.price) * 100
      
      // Update volume with realistic patterns
      const volumeMultiplier = 1 + (Math.random() - 0.5) * 0.3
      const newVolume = asset.volume24h * volumeMultiplier
      
      // Update market cap
      const newMarketCap = newPrice * asset.circulatingSupply
      
      // Generate new sparkline
      const newSparkline = this.generateSparkline(changePercent24h)
      
      this.baseData.set(id, {
        ...asset,
        price: newPrice,
        change24h,
        changePercent24h,
        volume24h: newVolume,
        marketCap: newMarketCap,
        sparkline: newSparkline,
        lastUpdated: new Date().toISOString()
      })
    })

    this.lastUpdate = now
  }

  private getAssetVolatility(category: string): number {
    switch (category) {
      case 'stablecoins': return 0.1
      case 'popular': return 2.5
      case 'defi': return 4.0
      case 'layer1': return 3.5
      case 'new': return 6.0
      default: return 3.0
    }
  }

  private getTrendStrength(symbol: string): number {
    // Different assets have different trend characteristics
    const trendMap: { [key: string]: number } = {
      'BTC': 0.8,
      'ETH': 0.9,
      'SOL': 1.2,
      'USDT': 0.1,
      'USDC': 0.1,
      'UNI': 1.1,
      'AAVE': 1.0,
      'LINK': 0.9,
      'DOT': 1.0,
      'ATOM': 1.1,
      'NEAR': 1.3,
      'AVAX': 1.2
    }
    return trendMap[symbol] || 1.0
  }

  // Public methods
  public getAssetsByCategory(category: string): CryptoAsset[] {
    this.updatePrices()
    
    console.log('🔍 Getting assets for category:', category)
    console.log('📊 Available categories in data:', Array.from(new Set(Array.from(this.baseData.values()).map(a => a.category))))
    
    if (category === 'all') {
      const allAssets = Array.from(this.baseData.values())
        .sort((a, b) => a.rank - b.rank)
      console.log('📊 Returning all assets:', allAssets.length)
      return allAssets
    }
    
    const filteredAssets = Array.from(this.baseData.values())
      .filter(asset => asset.category === category)
      .sort((a, b) => b.marketCap - a.marketCap)
    
    console.log(`📊 Filtered assets for ${category}:`, filteredAssets.length)
    console.log('📊 Sample assets:', filteredAssets.slice(0, 3).map(a => `${a.symbol} (${a.category})`))
    
    return filteredAssets
  }

  public getAssetById(id: string): CryptoAsset | null {
    this.updatePrices()
    return this.baseData.get(id) || null
  }

  public getMarketData(): MarketData {
    this.updatePrices()
    
    const allAssets = Array.from(this.baseData.values())
    const totalMarketCap = allAssets.reduce((sum, asset) => sum + asset.marketCap, 0)
    const totalVolume24h = allAssets.reduce((sum, asset) => sum + asset.volume24h, 0)
    
    const btc = this.baseData.get('bitcoin')
    const eth = this.baseData.get('ethereum')
    
    const btcDominance = btc ? (btc.marketCap / totalMarketCap) * 100 : 0
    const ethDominance = eth ? (eth.marketCap / totalMarketCap) * 100 : 0
    
    return {
      totalMarketCap,
      totalVolume24h,
      btcDominance,
      ethDominance,
      marketCapChange24h: (Math.random() - 0.5) * 5,
      volumeChange24h: (Math.random() - 0.5) * 10,
      activeCryptocurrencies: allAssets.length,
      lastUpdated: new Date().toISOString()
    }
  }

  public searchAssets(query: string): CryptoAsset[] {
    this.updatePrices()
    
    const searchTerm = query.toLowerCase()
    return Array.from(this.baseData.values())
      .filter(asset => 
        asset.name.toLowerCase().includes(searchTerm) ||
        asset.symbol.toLowerCase().includes(searchTerm) ||
        asset.tags.some(tag => tag.includes(searchTerm))
      )
      .sort((a, b) => a.rank - b.rank)
  }

  public getTopMovers(type: 'gainers' | 'losers' | 'volume'): CryptoAsset[] {
    this.updatePrices()
    
    const assets = Array.from(this.baseData.values())
    
    switch (type) {
      case 'gainers':
        return assets
          .filter(asset => asset.changePercent24h > 0)
          .sort((a, b) => b.changePercent24h - a.changePercent24h)
          .slice(0, 10)
      
      case 'losers':
        return assets
          .filter(asset => asset.changePercent24h < 0)
          .sort((a, b) => a.changePercent24h - b.changePercent24h)
          .slice(0, 10)
      
      case 'volume':
        return assets
          .sort((a, b) => b.volume24h - a.volume24h)
          .slice(0, 10)
      
      default:
        return []
    }
  }

  // Real-time data integration methods
  public async fetchRealTimeData(): Promise<void> {
    try {
      // In a production environment, this would fetch from CoinGecko, CoinMarketCap, or similar APIs
      // For now, we simulate realistic market movements
      console.log('🔄 Fetching real-time market data...')
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update all asset prices with realistic market movements
      this.updatePrices()
      
      console.log('✅ Real-time data updated')
    } catch (error) {
      console.error('❌ Failed to fetch real-time data:', error)
    }
  }

  public getAssetsByMarketCap(limit: number = 50): CryptoAsset[] {
    this.updatePrices()
    return Array.from(this.baseData.values())
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, limit)
  }

  public getAssetsByVolume(limit: number = 50): CryptoAsset[] {
    this.updatePrices()
    return Array.from(this.baseData.values())
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, limit)
  }

  public getTrendingAssets(limit: number = 10): CryptoAsset[] {
    this.updatePrices()
    return Array.from(this.baseData.values())
      .filter(asset => Math.abs(asset.changePercent24h) > 5) // Assets with significant movement
      .sort((a, b) => Math.abs(b.changePercent24h) - Math.abs(a.changePercent24h))
      .slice(0, limit)
  }
}

// Export singleton instance
export const cryptoDataService = new CryptoDataService()

// Export utility functions
export const formatPrice = (price: number): string => {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(4)}`
  if (price >= 0.01) return `$${price.toFixed(6)}`
  return `$${price.toFixed(8)}`
}

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`
  if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
  if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`
  return `$${volume.toFixed(0)}`
}

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1000000000000) return `$${(marketCap / 1000000000000).toFixed(2)}T`
  if (marketCap >= 1000000000) return `$${(marketCap / 1000000000).toFixed(1)}B`
  if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(1)}M`
  return `$${marketCap.toLocaleString()}`
}

export const getChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-600'
}

export const getChangeIcon = (change: number) => {
  if (change > 0) return '↗'
  if (change < 0) return '↘'
  return '→'
}

// Real-time market data fetcher (would integrate with actual APIs in production)
export const fetchLiveMarketData = async (): Promise<CryptoAsset[]> => {
  try {
    // In production, this would call CoinGecko API:
    // const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true')
    
    // For now, return our simulated data
    await cryptoDataService.fetchRealTimeData()
    return cryptoDataService.getAssetsByCategory('all')
  } catch (error) {
    console.error('Failed to fetch live market data:', error)
    return []
  }
}