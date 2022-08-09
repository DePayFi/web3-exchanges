import uniswap_v2 from './exchanges/uniswap_v2'
import pancakeswap from './exchanges/pancakeswap'
import quickswap from './exchanges/quickswap'

let all = {
  ethereum: [uniswap_v2],
  bsc: [pancakeswap],
  polygon: [quickswap],
  solana: [],
}

export default all
