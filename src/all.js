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
  uniswap_v2,
  uniswap_v3,
  pancakeswap,
  quickswap,
  spookyswap,
  weth,
  wbnb,
]

all.ethereum = [uniswap_v2, uniswap_v3, weth]
all.bsc = [pancakeswap, wbnb]
all.polygon = [quickswap, wmatic]
all.fantom = [spookyswap, wftm]

/*#elif _SOLANA

import orca from './exchanges/orca'

const all = [
  orca,
]

all.solana = [orca]
all.ethereum = []
all.bsc = []
all.polygon = []
all.fantom = []

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
  uniswap_v2,
  uniswap_v3,
  pancakeswap,
  quickswap,
  orca,
  spookyswap,
  weth,
  wbnb,
]

all.ethereum = [uniswap_v2, uniswap_v3, weth]
all.bsc = [pancakeswap, wbnb]
all.polygon = [quickswap, wmatic]
all.solana = [orca]
all.fantom = [spookyswap, wftm]

//#endif

export default all
