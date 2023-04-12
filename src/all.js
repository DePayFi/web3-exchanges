/*#if _EVM

import pancakeswap from './exchanges/pancakeswap'
import quickswap from './exchanges/quickswap'
import spookyswap from './exchanges/spookyswap'
import uniswap_v2 from './exchanges/uniswap_v2'
import wagyuswap from './exchanges/wagyuswap'
import wbnb from './exchanges/wbnb'
import weth from './exchanges/weth'
import wftm from './exchanges/wftm'
import wmatic from './exchanges/wmatic'
import wvlx from './exchanges/wvlx'

let all = {
  ethereum: [uniswap_v2, weth],
  bsc: [pancakeswap, wbnb],
  polygon: [quickswap, wmatic],
  solana: [],
  fantom: [spookyswap, wftm],
  velas: [wagyuswap, wvlx],
}

/*#elif _SOLANA

import orca from './exchanges/orca'

let all = {
  ethereum: [],
  bsc: [],
  polygon: [],
  solana: [orca],
  velas: [],
  fantom: [],
}

//#else */

import orca from './exchanges/orca'
import pancakeswap from './exchanges/pancakeswap'
import quickswap from './exchanges/quickswap'
import spookyswap from './exchanges/spookyswap'
import uniswap_v2 from './exchanges/uniswap_v2'
import wagyuswap from './exchanges/wagyuswap'
import wbnb from './exchanges/wbnb'
import weth from './exchanges/weth'
import wftm from './exchanges/wftm'
import wmatic from './exchanges/wmatic'
import wvlx from './exchanges/wvlx'

let all = {
  ethereum: [uniswap_v2, weth],
  bsc: [pancakeswap, wbnb],
  polygon: [quickswap, wmatic],
  solana: [orca],
  fantom: [spookyswap, wftm],
  velas: [wagyuswap, wvlx],
}

//#endif

export default all
