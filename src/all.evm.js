import pancakeswap from './exchanges/pancakeswap/index.evm'
import quickswap from './exchanges/quickswap/index.evm'
import uniswap_v2 from './exchanges/uniswap_v2/index.evm'
import wagyuswap from './exchanges/wagyuswap/index.evm'
import wbnb from './exchanges/wbnb'
import weth from './exchanges/weth'
import wmatic from './exchanges/wmatic'
import wvlx from './exchanges/wvlx'

let all = {
  ethereum: [uniswap_v2, weth],
  bsc: [pancakeswap, wbnb],
  polygon: [quickswap, wmatic],
  solana: [],
  velas: [wagyuswap, wvlx],
}

export default all
