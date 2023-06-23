/*#if _EVM

import pancakeswap from './exchanges/pancakeswap'
import quickswap from './exchanges/quickswap'
import spookyswap from './exchanges/spookyswap'
import uniswap_v2 from './exchanges/uniswap_v2'
import uniswap_v3 from './exchanges/uniswap_v3'
import wbnb from './exchanges/wbnb'
import weth from './exchanges/weth'
import wftm from './exchanges/wftm'
import wmatic from './exchanges/wmatic'

const all = [
  uniswap_v3,
  uniswap_v2,
  pancakeswap,
  quickswap,
  spookyswap,
  weth,
  wbnb,
  wmatic,
  wftm,
]

all.ethereum = {
 uniswap_v3,
 uniswap_v2,
 weth, 
}

all.bsc = {
  uniswap_v3,
  pancakeswap,
  wbnb,
}

all.polygon = {
  quickswap,
  wmatic,
}

all.fantom = {
  spookyswap,
  wftm
}

/*#elif _SOLANA

import orca from './exchanges/orca'

const all = [
  orca,
]

all.solana = {
  orca
}

//#else */

import orca from './exchanges/orca'
import pancakeswap from './exchanges/pancakeswap'
import quickswap from './exchanges/quickswap'
import spookyswap from './exchanges/spookyswap'
import uniswap_v2 from './exchanges/uniswap_v2'
import uniswap_v3 from './exchanges/uniswap_v3'
import wbnb from './exchanges/wbnb'
import weth from './exchanges/weth'
import wftm from './exchanges/wftm'
import wmatic from './exchanges/wmatic'

const all = [
  uniswap_v3,
  uniswap_v2,
  pancakeswap,
  quickswap,
  orca,
  spookyswap,
  weth,
  wbnb,
  wmatic,
  wftm,
]

all.ethereum = {
 uniswap_v3,
 uniswap_v2,
 weth, 
}

all.bsc = {
  uniswap_v3,
  pancakeswap,
  wbnb,
}

all.polygon = {
  quickswap,
  wmatic,
}

all.solana = {
  orca
}

all.fantom = {
  spookyswap,
  wftm
}

//#endif

export default all
