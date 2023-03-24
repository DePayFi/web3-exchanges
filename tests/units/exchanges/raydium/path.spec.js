import Blockchains from '@depay/web3-blockchains'
import { find } from 'src'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockPair } from 'tests/mocks/solana/raydium'
import { getProvider, resetCache } from '@depay/web3-client'

describe('raydium', () => {
  
  const blockchain = 'solana'
  const exchange = find(blockchain, 'raydium')
  const accounts = ['2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1']
  
  let provider
  beforeEach(async ()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ provider, blockchain, accounts: { return: accounts } })
  })

  describe('find path', ()=>{

    it('does route direct pairs', async()=>{
      let tokenIn = Blockchains[blockchain].wrapped.address
      let tokenOut = Blockchains[blockchain].stables.usd[0]

      mockPair({ tokenIn, tokenOut, pair: 'BcjFnHHzJ6Y1XzLcm3nfr6tP7TGHGh15bLZazP5dAy9p' })

      let { path } = await exchange.findPath({ tokenIn, tokenOut })
      expect(path).toEqual[tokenIn, tokenOut]
    })

    it('does route SOL via WSOL', async()=>{
      let tokenIn = Blockchains[blockchain].currency.address
      let tokenOut = Blockchains[blockchain].stables.usd[0]

      mockPair({ tokenIn: Blockchains[blockchain].wrapped.address, tokenOut, pair: 'BcjFnHHzJ6Y1XzLcm3nfr6tP7TGHGh15bLZazP5dAy9p' })

      let { path } = await exchange.findPath({ tokenIn, tokenOut })
      expect(path).toEqual[tokenIn, Blockchains[blockchain].wrapped.address, tokenOut]
    })

    it('does route 2 tokens via WSOL', async()=>{
      let RAY = "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"
      let tokenIn = RAY
      let tokenOut = Blockchains[blockchain].stables.usd[0]

      mockPair({ tokenIn: Blockchains[blockchain].stables.usd[0], tokenOut: RAY })
      mockPair({ tokenIn: Blockchains[blockchain].wrapped.address, tokenOut: RAY, pair: 'AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA' })
      mockPair({ tokenIn: Blockchains[blockchain].wrapped.address, tokenOut: Blockchains[blockchain].stables.usd[0], pair: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2' })

      let { path } = await exchange.findPath({ tokenIn, tokenOut })
      expect(path).toEqual[tokenIn, Blockchains[blockchain].wrapped.address, tokenOut]
    })

    it('does route 2 tokens via USD', async()=>{
      let RAY = "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"
      let USDT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
      let tokenIn = RAY
      let tokenOut = USDT

      mockPair({ tokenIn: USDT, tokenOut: RAY })
      mockPair({ tokenIn: Blockchains[blockchain].wrapped.address, tokenOut: RAY })
      mockPair({ tokenIn: Blockchains[blockchain].wrapped.address, tokenOut: USDT })
      mockPair({ tokenIn: Blockchains[blockchain].stables.usd[0], tokenOut: RAY, pair: 'AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA' })
      mockPair({ tokenIn: Blockchains[blockchain].stables.usd[0], tokenOut: USDT, pair: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2' })

      let { path } = await exchange.findPath({ tokenIn, tokenOut })
      expect(path).toEqual[tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut]
    })
  })
})
