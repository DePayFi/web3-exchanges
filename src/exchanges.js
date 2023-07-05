/*#if _EVM

import pancakeswap from './exchanges/pancakeswap'
import quickswap from './exchanges/quickswap'
import spookyswap from './exchanges/spookyswap'
import uniswap_v2 from './exchanges/uniswap_v2'
import uniswap_v3 from './exchanges/uniswap_v3'
import wavax from './exchanges/wavax'
import wbnb from './exchanges/wbnb'
import weth from './exchanges/weth'
import weth_arbitrum from './exchanges/weth_arbitrum'
import weth_optimism from './exchanges/weth_optimism'
import wftm from './exchanges/wftm'
import wmatic from './exchanges/wmatic'
import wxdai from './exchanges/wxdai'

const exchanges = [
  uniswap_v3,
  uniswap_v2,
  pancakeswap,
  quickswap,
  spookyswap,
  weth,
  weth_optimism,
  weth_arbitrum,
  wbnb,
  wmatic,
  wftm,
  wavax,
  wxdai,
]

exchanges.uniswap_v3 = uniswap_v3
exchanges.uniswap_v2 = uniswap_v2
exchanges.pancakeswap = pancakeswap
exchanges.quickswap = quickswap
exchanges.spookyswap = spookyswap
exchanges.weth = weth
exchanges.weth_optimism = weth_optimism
exchanges.weth_arbitrum = weth_arbitrum
exchanges.wbnb = wbnb
exchanges.wmatic = wmatic
exchanges.wftm = wftm
exchanges.wavax = wavax
exchanges.wxdai = wxdai

exchanges.ethereum = [
  uniswap_v3,
  uniswap_v2,
  weth,
]
exchanges.ethereum.forEach((exchange)=>{ exchanges.ethereum[exchange.name] = exchange })

exchanges.bsc = [
  uniswap_v3,
  pancakeswap,
  wbnb,
]
exchanges.bsc.forEach((exchange)=>{ exchanges.bsc[exchange.name] = exchange })

exchanges.polygon = [
  uniswap_v3,
  quickswap,
  wmatic,
]
exchanges.polygon.forEach((exchange)=>{ exchanges.polygon[exchange.name] = exchange })

exchanges.optimism = [
  uniswap_v3,
  weth_optimism,
]
exchanges.optimism.forEach((exchange)=>{ exchanges.optimism[exchange.name] = exchange })

exchanges.arbitrum = [
  uniswap_v3,
  weth_arbitrum,
]
exchanges.arbitrum.forEach((exchange)=>{ exchanges.arbitrum[exchange.name] = exchange })

exchanges.fantom = [
  spookyswap,
  wftm,
]
exchanges.fantom.forEach((exchange)=>{ exchanges.fantom[exchange.name] = exchange })

exchanges.avalanche = [
  wavax,
]
exchanges.avalanche.forEach((exchange)=>{ exchanges.avalanche[exchange.name] = exchange })

exchanges.gnosis = [
  wxdai,
]
exchanges.gnosis.forEach((exchange)=>{ exchanges.gnosis[exchange.name] = exchange })


/*#elif _SOLANA

import orca from './exchanges/orca'

const exchanges = [
  orca,
]

exchanges.orca = orca

exchanges.solana = [
  orca
]
exchanges.solana.forEach((exchange)=>{ exchanges.solana[exchange.name] = exchange })

//#else */

import orca from './exchanges/orca'
import pancakeswap from './exchanges/pancakeswap'
import quickswap from './exchanges/quickswap'
import spookyswap from './exchanges/spookyswap'
import uniswap_v2 from './exchanges/uniswap_v2'
import uniswap_v3 from './exchanges/uniswap_v3'
import wavax from './exchanges/wavax'
import wbnb from './exchanges/wbnb'
import weth from './exchanges/weth'
import weth_arbitrum from './exchanges/weth_arbitrum'
import weth_optimism from './exchanges/weth_optimism'
import wftm from './exchanges/wftm'
import wmatic from './exchanges/wmatic'
import wxdai from './exchanges/wxdai'

const exchanges = [
  orca,
  uniswap_v3,
  uniswap_v2,
  pancakeswap,
  quickswap,
  spookyswap,
  weth,
  weth_optimism,
  weth_arbitrum,
  wbnb,
  wmatic,
  wftm,
  wavax,
  wxdai,
]

exchanges.orca = orca
exchanges.uniswap_v3 = uniswap_v3
exchanges.uniswap_v2 = uniswap_v2
exchanges.pancakeswap = pancakeswap
exchanges.quickswap = quickswap
exchanges.spookyswap = spookyswap
exchanges.weth = weth
exchanges.weth_optimism = weth_optimism
exchanges.weth_arbitrum = weth_arbitrum
exchanges.wbnb = wbnb
exchanges.wmatic = wmatic
exchanges.wftm = wftm
exchanges.wavax = wavax
exchanges.wxdai = wxdai

exchanges.ethereum = [
  uniswap_v3,
  uniswap_v2,
  weth,
]
exchanges.ethereum.forEach((exchange)=>{ exchanges.ethereum[exchange.name] = exchange })

exchanges.bsc = [
  uniswap_v3,
  pancakeswap,
  wbnb,
]
exchanges.bsc.forEach((exchange)=>{ exchanges.bsc[exchange.name] = exchange })

exchanges.polygon = [
  uniswap_v3,
  quickswap,
  wmatic,
]
exchanges.polygon.forEach((exchange)=>{ exchanges.polygon[exchange.name] = exchange })

exchanges.solana = [
  orca
]
exchanges.solana.forEach((exchange)=>{ exchanges.solana[exchange.name] = exchange })

exchanges.optimism = [
  uniswap_v3,
  weth_optimism,
]
exchanges.optimism.forEach((exchange)=>{ exchanges.optimism[exchange.name] = exchange })

exchanges.arbitrum = [
  uniswap_v3,
  weth_arbitrum,
]
exchanges.arbitrum.forEach((exchange)=>{ exchanges.arbitrum[exchange.name] = exchange })

exchanges.fantom = [
  spookyswap,
  wftm
]
exchanges.fantom.forEach((exchange)=>{ exchanges.fantom[exchange.name] = exchange })

exchanges.avalanche = [
  wavax,
]
exchanges.avalanche.forEach((exchange)=>{ exchanges.avalanche[exchange.name] = exchange })

exchanges.gnosis = [
  wxdai,
]
exchanges.gnosis.forEach((exchange)=>{ exchanges.gnosis[exchange.name] = exchange })

//#endif

export default exchanges
