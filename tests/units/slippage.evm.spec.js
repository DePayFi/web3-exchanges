import { ethers } from 'ethers'
import Exchanges from 'dist/esm/index.evm'
import { mock, resetMocks, increaseBlock } from '@depay/web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/evm/uniswap_v2'
import { resetCache, getProvider } from '@depay/web3-client-evm'

describe('slippage', () => {

  const blockchain = 'ethereum'
  const exchange = Exchanges.uniswap_v2
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  const tokenOut = '0x6b175474e89094c44da98b954eedeac495271d0f'
  const pair = '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852'
  const amountOut = 1
  const amountIn = 5
  const amountOutBN = ethers.utils.parseUnits(amountOut.toString())
  const currentBlock = 11
  
  let provider, tokenIn, amountInBN, path
  beforeEach(async()=>{
    resetMocks()
    resetCache()
    tokenIn = '0xa0bed124a09ac2bd941b10349d8d224fe3c955eb'
    amountInBN = ethers.utils.parseUnits(amountIn.toString())
    path = [tokenIn, tokenOut]
    provider = await getProvider(blockchain)
    increaseBlock(currentBlock-1)
    mock({ blockchain, provider, accounts: { return: accounts } })
    mockDecimals({ provider, blockchain, address: tokenOut, value: 18 })
    mockDecimals({ provider, blockchain, address: tokenIn, value: 18 })
  })

  describe('default slippage', ()=>{

    beforeEach(()=>{
      mockDecimals({ provider, blockchain, address: tokenIn, value: 18 })
      mockPair({ blockchain, exchange, provider, tokenIn, tokenOut, pair })
      mockAmounts({ blockchain, exchange, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN, amountOutBN] })
      mockAmounts({ blockchain, exchange, block: currentBlock, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN, amountOutBN] })
      mockAmounts({ blockchain, exchange, block: currentBlock-1, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN, amountOutBN] })
      mockAmounts({ blockchain, exchange, block: currentBlock-2, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN, amountOutBN] })
    })

    it('uses default slippage of 0.5%', async ()=> {
      const route = await exchange.route({ amountOutMin: 1, tokenIn, tokenOut })
      const transaction = await route.getTransaction({ account: accounts[0] })
      expect(transaction.params.amountIn).toEqual(amountInBN.add('25000000000000000').toString())
    })
  })

  describe('extreme directional price change', ()=>{

    beforeEach(()=>{
      mockDecimals({ provider, blockchain, address: tokenIn, value: 18 })
      mockPair({ blockchain, exchange, provider, tokenIn, tokenOut, pair })
      mockAmounts({ blockchain, exchange, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN, amountOutBN] })
      mockAmounts({ blockchain, exchange, block: currentBlock, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN.add('50000000000000000'), amountOutBN] })
      mockAmounts({ blockchain, exchange, block: currentBlock-1, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN.add('40000000000000000'), amountOutBN] })
      mockAmounts({ blockchain, exchange, block: currentBlock-2, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN.add('30000000000000000'), amountOutBN] })
    })

    it('projects price change to cover slippage', async ()=>{
      let route = await exchange.route({ amountOutMin: 1, tokenIn, tokenOut })
      const transaction = await route.getTransaction({ account: accounts[0] })
      expect(transaction.params.amountIn).toEqual('5060000000000000000')
    })
  })

  describe('extreme base volatilities', ()=>{

    beforeEach(()=>{
      mockDecimals({ provider, blockchain, address: tokenIn, value: 18 })
      mockPair({ blockchain, exchange, provider, tokenIn, tokenOut, pair })
      mockAmounts({ blockchain, exchange, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN, amountOutBN] })
      mockAmounts({ blockchain, exchange, block: currentBlock, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN, amountOutBN] })
      mockAmounts({ blockchain, exchange, block: currentBlock-1, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN.add('40000000000000000'), amountOutBN] })
      mockAmounts({ blockchain, exchange, block: currentBlock-2, provider, method: 'getAmountsIn', params: [amountOutBN, path], amounts: [amountInBN.sub('40000000000000000'), amountOutBN] })
    })

    it('projects extreme volatility to cover slippage', async ()=>{
      let route = await exchange.route({ amountOutMin: 1, tokenIn, tokenOut })
      const transaction = await route.getTransaction({ account: accounts[0] })
      expect(transaction.params.amountIn).toEqual('5080000000000000000')
    })
  })
})
