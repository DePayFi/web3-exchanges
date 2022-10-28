import pancakeswap from './exchanges/pancakeswap'
import quickswap from './exchanges/quickswap'
import raydium from './exchanges/raydium'
import uniswap_v2 from './exchanges/uniswap_v2'
import wagyuswap from './exchanges/wagyuswap'

let all = {
  ethereum: [uniswap_v2],
  bsc: [pancakeswap],
  polygon: [quickswap],
  solana: [raydium],
  velas: [wagyuswap],
}

export default all
