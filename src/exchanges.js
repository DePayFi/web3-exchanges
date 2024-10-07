/*#if _EVM

import honeyswap from './exchanges/honeyswap'
import pancakeswap from './exchanges/pancakeswap'
import pancakeswap_v3 from './exchanges/pancakeswap_v3'
import quickswap from './exchanges/quickswap'
import spookyswap from './exchanges/spookyswap'
import trader_joe_v2_1 from './exchanges/trader_joe_v2_1'
import uniswap_v2 from './exchanges/uniswap_v2'
import uniswap_v3 from './exchanges/uniswap_v3'
import wavax from './exchanges/wavax'
import wbnb from './exchanges/wbnb'
import weth from './exchanges/weth'
import weth_arbitrum from './exchanges/weth_arbitrum'
import weth_base from './exchanges/weth_base'
import weth_optimism from './exchanges/weth_optimism'
import wftm from './exchanges/wftm'
import wmatic from './exchanges/wmatic'
import wxdai from './exchanges/wxdai'

const exchanges = [
  uniswap_v3(),
  pancakeswap_v3(),
  uniswap_v2(),
  pancakeswap(),
  quickswap(),
  trader_joe_v2_1(),
  spookyswap(),
  honeyswap(),
  weth(),
  weth_optimism(),
  weth_base(),
  weth_arbitrum(),
  wbnb(),
  wmatic(),
  wftm(),
  wavax(),
  wxdai(),
]

exchanges.forEach((exchange)=>{
  exchanges[exchange.name] = exchange
})

exchanges.ethereum = [
  uniswap_v3('ethereum'),
  uniswap_v2('ethereum'),
  weth('ethereum'),
]
exchanges.ethereum.forEach((exchange)=>{ exchanges.ethereum[exchange.name] = exchange })

exchanges.bsc = [
  pancakeswap_v3('bsc'),
  uniswap_v3('bsc'),
  pancakeswap('bsc'),
  wbnb('bsc'),
]
exchanges.bsc.forEach((exchange)=>{ exchanges.bsc[exchange.name] = exchange })

exchanges.polygon = [
  uniswap_v3('polygon'),
  quickswap('polygon'),
  wmatic('polygon'),
]
exchanges.polygon.forEach((exchange)=>{ exchanges.polygon[exchange.name] = exchange })

exchanges.optimism = [
  uniswap_v3('optimism'),
  weth_optimism('optimism'),
]
exchanges.optimism.forEach((exchange)=>{ exchanges.optimism[exchange.name] = exchange })

exchanges.base = [
  uniswap_v3('base'),
  weth_optimism('base'),
]
exchanges.base.forEach((exchange)=>{ exchanges.base[exchange.name] = exchange })

exchanges.arbitrum = [
  uniswap_v3('arbitrum'),
  weth_arbitrum('arbitrum'),
]
exchanges.arbitrum.forEach((exchange)=>{ exchanges.arbitrum[exchange.name] = exchange })

exchanges.fantom = [
  spookyswap('fantom'),
  wftm('wftm'),
]
exchanges.fantom.forEach((exchange)=>{ exchanges.fantom[exchange.name] = exchange })

exchanges.avalanche = [
  uniswap_v3('avalanche'),
  trader_joe_v2_1('avalanche'),
  wavax('avalanche'),
]
exchanges.avalanche.forEach((exchange)=>{ exchanges.avalanche[exchange.name] = exchange })

exchanges.gnosis = [
  honeyswap('gnosis'),
  wxdai('gnosis'),
]
exchanges.gnosis.forEach((exchange)=>{ exchanges.gnosis[exchange.name] = exchange })

exchanges.worldchain = [
  uniswap_v3('worldchain'),
]
exchanges.worldchain.forEach((exchange)=>{ exchanges.worldchain[exchange.name] = exchange })


/*#elif _SOLANA

import orca from './exchanges/orca'

const exchanges = [
  orca(),
]
exchanges.forEach((exchange)=>{
  exchanges[exchange.name] = exchange
})

exchanges.solana = [
  orca('solana'),
]
exchanges.solana.forEach((exchange)=>{ exchanges.solana[exchange.name] = exchange })

//#else */

import honeyswap from './exchanges/honeyswap'
import orca from './exchanges/orca'
import pancakeswap from './exchanges/pancakeswap'
import pancakeswap_v3 from './exchanges/pancakeswap_v3'
import quickswap from './exchanges/quickswap'
import spookyswap from './exchanges/spookyswap'
import trader_joe_v2_1 from './exchanges/trader_joe_v2_1'
import uniswap_v2 from './exchanges/uniswap_v2'
import uniswap_v3 from './exchanges/uniswap_v3'
import wavax from './exchanges/wavax'
import wbnb from './exchanges/wbnb'
import weth from './exchanges/weth'
import weth_arbitrum from './exchanges/weth_arbitrum'
import weth_optimism from './exchanges/weth_optimism'
import weth_base from './exchanges/weth_base'
import wftm from './exchanges/wftm'
import wmatic from './exchanges/wmatic'
import wxdai from './exchanges/wxdai'

const exchanges = [
  orca(),
  uniswap_v3(),
  pancakeswap_v3(),
  uniswap_v2(),
  pancakeswap(),
  trader_joe_v2_1(),
  quickswap(),
  spookyswap(),
  honeyswap(),
  weth(),
  weth_optimism(),
  weth_base(),
  weth_arbitrum(),
  wbnb(),
  wmatic(),
  wftm(),
  wavax(),
  wxdai(),
]
exchanges.forEach((exchange)=>{
  exchanges[exchange.name] = exchange
})

exchanges.ethereum = [
  uniswap_v3('ethereum'),
  uniswap_v2('ethereum'),
  weth('ethereum'),
]
exchanges.ethereum.forEach((exchange)=>{ exchanges.ethereum[exchange.name] = exchange })

exchanges.bsc = [
  pancakeswap_v3('bsc'),
  uniswap_v3('bsc'),
  pancakeswap('bsc'),
  wbnb('bsc'),
]
exchanges.bsc.forEach((exchange)=>{ exchanges.bsc[exchange.name] = exchange })

exchanges.polygon = [
  uniswap_v3('polygon'),
  quickswap('polygon'),
  wmatic('polygon'),
]
exchanges.polygon.forEach((exchange)=>{ exchanges.polygon[exchange.name] = exchange })

exchanges.solana = [
  orca('solana'),
]
exchanges.solana.forEach((exchange)=>{ exchanges.solana[exchange.name] = exchange })

exchanges.optimism = [
  uniswap_v3('optimism'),
  weth_optimism('optimism'),
]
exchanges.optimism.forEach((exchange)=>{ exchanges.optimism[exchange.name] = exchange })

exchanges.base = [
  uniswap_v3('base'),
  weth_base('base'),
]
exchanges.base.forEach((exchange)=>{ exchanges.base[exchange.name] = exchange })

exchanges.arbitrum = [
  uniswap_v3('arbitrum'),
  weth_arbitrum('arbitrum'),
]
exchanges.arbitrum.forEach((exchange)=>{ exchanges.arbitrum[exchange.name] = exchange })

exchanges.fantom = [
  spookyswap('fantom'),
  wftm('fantom'),
]
exchanges.fantom.forEach((exchange)=>{ exchanges.fantom[exchange.name] = exchange })

exchanges.avalanche = [
  uniswap_v3('avalanche'),
  trader_joe_v2_1('avalanche'),
  wavax('avalanche'),
]
exchanges.avalanche.forEach((exchange)=>{ exchanges.avalanche[exchange.name] = exchange })

exchanges.gnosis = [
  honeyswap('gnosis'),
  wxdai('gnosis'),
]
exchanges.gnosis.forEach((exchange)=>{ exchanges.gnosis[exchange.name] = exchange })

exchanges.worldchain = [
  uniswap_v3('worldchain'),
]
exchanges.worldchain.forEach((exchange)=>{ exchanges.worldchain[exchange.name] = exchange })

//#endif

export default exchanges
