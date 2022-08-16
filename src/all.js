import pancakeswap from './exchanges/pancakeswap'
import quickswap from './exchanges/quickswap'
import raydium from './exchanges/raydium'
import uniswap_v2 from './exchanges/uniswap_v2'

let all = {
  ethereum: [uniswap_v2],
  bsc: [pancakeswap],
  polygon: [quickswap],
  solana: [raydium],
}

export default all
