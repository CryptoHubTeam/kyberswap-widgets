const bttcTokens = [
  {
    chainId: 199,
    address: '0xCa424b845497f7204D9301bd13Ff87C0E2e86FCF',
    _scan: 'https://bttcscan.com/token/0xCa424b845497f7204D9301bd13Ff87C0E2e86FCF',
    symbol: 'USDC_b',
    name: 'USD Coin_BSC',
    decimals: 18,
    logoURI: 'https://coin.top/production/upload/logo/TEkxiTehnzSmSe2XqrBj4w32RUN966rdz81.png',
  },
  {
    chainId: 199,
    address: '0x9B5F27f6ea9bBD753ce3793a07CbA3C74644330d',
    _scan: 'https://bttcscan.com/token/0x9B5F27f6ea9bBD753ce3793a07CbA3C74644330d',
    symbol: 'USDT_b',
    name: 'Tether USD_BSC',
    decimals: 18,
    logoURI: 'https://coin.top/production/logo/usdtlogo.png',
  },
  {
    chainId: 199,
    address: '0xE887512ab8BC60BcC9224e1c3b5Be68E26048B8B',
    _scan: 'https://bttcscan.com/token/0xE887512ab8BC60BcC9224e1c3b5Be68E26048B8B',
    symbol: 'USDT_e',
    name: 'Tether USD_Ethereum',
    decimals: 6,
    logoURI: 'https://coin.top/production/logo/usdtlogo.png',
  },
  {
    chainId: 199,
    address: '0xe7dC549AE8DB61BDE71F22097BEcc8dB542cA100',
    _scan: 'https://bttcscan.com/token/0xe7dC549AE8DB61BDE71F22097BEcc8dB542cA100',
    symbol: 'DAI_e',
    name: 'Dai Stablecoin_Ethereum',
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3/logo.png',
  },
  {
    chainId: 199,
    address: '0xA20dfb01DCa223c0E52B0D4991D4aFA7E08e3a50',
    _scan: 'https://bttcscan.com/token/0xA20dfb01DCa223c0E52B0D4991D4aFA7E08e3a50',
    symbol: 'ETH_b',
    name: 'Ethereum Token_BSC',
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x2170Ed0880ac9A755fd29B2688956BD959F933F8/logo.png',
  },
  {
    chainId: 199,
    address: '0x185a4091027E2dB459a2433F85f894dC3013aeB5',
    _scan: 'https://bttcscan.com/token/0x185a4091027E2dB459a2433F85f894dC3013aeB5',
    symbol: 'BNB',
    decimals: 18,
    name: 'Binance Coin',
    logoURI: 'https://coin.top/production/upload/logo/TDgkC3ZZBgaDqkteSgx9F14rPfqRgktyzh.jpeg',
  },
  {
    chainId: 199,
    address: '0xEdf53026aeA60f8F75FcA25f8830b7e2d6200662',
    _scan: 'https://bttcscan.com/token/0xEdf53026aeA60f8F75FcA25f8830b7e2d6200662',
    symbol: 'TRX',
    decimals: 6,
    name: 'TRON',
    logoURI: 'https://coin.top/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png',
  },
  {
    chainId: 199,
    address: '0x5d9a3948a688aa40b5F2e1Ab58B80872FfF038A7',
    _scan: 'https://bttcscan.com/token/0x5d9a3948a688aa40b5F2e1Ab58B80872FfF038A7',
    symbol: 'XMN',
    name: 'Metronotes',
    decimals: 9,
    logoURI: 'http://images.bt.io/0x5d9a3948a688aa40b5f2e1ab58b80872fff038a7.png',
  },
  {
    chainId: 199,
    address: '0xA66Bb5755391C0202353dC1b708d13A97444e5B8',
    _scan: 'https://bttcscan.com/token/0xA66Bb5755391C0202353dC1b708d13A97444e5B8',
    symbol: 'TET',
    decimals: 18,
    name: 'Tetcoin',
    logoURI: 'http://images.bt.io/0xa66bb5755391c0202353dc1b708d13a97444e5b8.png',
  },
  {
    chainId: 199,
    address: '0xdB28719F7f938507dBfe4f0eAe55668903D34a15',
    _scan: 'https://bttcscan.com/token/0xdB28719F7f938507dBfe4f0eAe55668903D34a15',
    symbol: 'USDT_t',
    decimals: 6,
    name: 'Tether USD_TRON',
    logoURI: 'https://coin.top/production/logo/usdtlogo.png',
  },
  {
    chainId: 199,
    address: '0xcBb9EDF6775e39748Ea6483A7fa6a385Cd7E9a4E',
    _scan: 'https://bttcscan.com/token/0xcBb9EDF6775e39748Ea6483A7fa6a385Cd7E9a4E',
    symbol: 'BTT_b',
    name: 'BitTorrent_BSC',
    decimals: 18,
    logoURI: 'https://coin.top/production/logo/1002000.png',
  },
  {
    chainId: 199,
    address: '0x65676055E58b02E61272Cedec6E5C6D56BADfb86',
    _scan: 'https://bttcscan.com/token/0x65676055E58b02E61272Cedec6E5C6D56BADfb86',
    symbol: 'BTT_e',
    name: 'BitTorrent_Ethereum',
    decimals: 18,
    logoURI: 'https://coin.top/production/logo/1002000.png',
  },
  {
    chainId: 199,
    address: '0xb09349DDd39454d539EDC17Fc68eCC50E8e13377',
    _scan: 'https://bttcscan.com/token/0xb09349DDd39454d539EDC17Fc68eCC50E8e13377',
    symbol: 'HYBERBTT',
    name: 'HYBERBTT',
    decimals: 18,
    logoURI: 'https://coin.top/production/logo/1002000.png',
  },
  {
    chainId: 199,
    address: '0x935faA2FCec6Ab81265B301a30467Bbc804b43d3',
    _scan: 'https://bttcscan.com/token/0x935faA2FCec6Ab81265B301a30467Bbc804b43d3',
    symbol: 'USDC_t',
    name: 'USD Coin_TRON',
    decimals: 6,
    logoURI: 'https://bttcscan.com/token/images/usdcbttc_32.png',
  },
  {
    chainId: 199,
    address: '0x9888221fE6B5A2ad4cE7266c7826D2AD74D40CcF',
    _scan: 'https://bttcscan.com/token/0x9888221fE6B5A2ad4cE7266c7826D2AD74D40CcF',
    symbol: 'WBTC_e',
    name: 'Wrapped BTC_Ethereum',
    decimals: 8,
    logoURI: 'https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png',
  },
  {
    chainId: 199,
    address: '0xE467F79E9869757DD818DfB8535068120F6BcB97',
    _scan: 'https://bttcscan.com/token/0xE467F79E9869757DD818DfB8535068120F6BcB97',
    symbol: 'KNC_e',
    name: 'Kyber Network Crystal v2 - Ethereum',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/KyberNetwork/dmm-interface/main/src/assets/images/KNC.svg',
  },
  {
    chainId: 199,
    address: '0x18fA72e0EE4C580a129b0CE5bD0694d716C7443E',
    _scan: 'https://bttcscan.com/token/0x18fA72e0EE4C580a129b0CE5bD0694d716C7443E',
    symbol: 'KNC_b',
    name: 'Kyber Network Crystal v2 - BSC',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/KyberNetwork/dmm-interface/main/src/assets/images/KNC.svg',
  },
  {
    chainId: 199,
    address: '0x1249C65AfB11D179FFB3CE7D4eEDd1D9b98AD006',
    _scan: 'https://bttcscan.com/token/0x1249C65AfB11D179FFB3CE7D4eEDd1D9b98AD006',
    symbol: 'ETH',
    name: 'ETH',
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x2170Ed0880ac9A755fd29B2688956BD959F933F8/logo.png',
  },
  {
    chainId: 199,
    address: '0xAE17940943BA9440540940DB0F1877f101D39e8b',
    _scan: 'https://bttcscan.com/token/0xAE17940943BA9440540940DB0F1877f101D39e8b',
    symbol: 'USDC_e',
    name: 'USD Coin_Ethereum',
    decimals: 6,
    logoURI: 'https://coin.top/production/upload/logo/TEkxiTehnzSmSe2XqrBj4w32RUN966rdz81.png',
  },
  {
    chainId: 199,
    address: '0x17F235FD5974318E4E2a5e37919a209f7c37A6d1',
    _scan: 'https://bttcscan.com/token/0x17F235FD5974318E4E2a5e37919a209f7c37A6d1',
    symbol: 'USDD_t',
    name: 'Decentralized USD_TRON',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/img/token/USDD.svg',
  },
]

export default bttcTokens
