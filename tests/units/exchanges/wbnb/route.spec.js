import Route from 'src/classes/Route'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { find } from 'src'
import { getWallets } from '@depay/web3-wallets'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { resetCache, getProvider } from '@depay/web3-client'
import { testRouting } from 'tests/helpers/testRouting'

describe('wbnb', () => {
  
  const blockchain = 'bsc'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  const exchange = find('bsc', 'wbnb')
  const fromAddress = accounts[0]
  const toAddress = accounts[0]
  
  let provider
  beforeEach(async ()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ blockchain, accounts: { return: accounts } })
  })

  describe('routing', ()=>{

    it('does route ETH<>WETH', async ()=> {

      mock(blockchain)

      let amountIn = '100000000'
      let amountOut = '100000000'

      let route = await exchange.route({
        tokenIn: CONSTANTS[blockchain].NATIVE,
        tokenOut: CONSTANTS[blockchain].WRAPPED,
        amountInMax: amountIn,
        amountOut,
        fromAddress,
        toAddress
      })

      expect(route.tokenIn).toEqual(CONSTANTS[blockchain].NATIVE)
      expect(route.tokenOut).toEqual(CONSTANTS[blockchain].WRAPPED)
      expect(route.path).toEqual([CONSTANTS[blockchain].NATIVE, CONSTANTS[blockchain].WRAPPED])
      expect(route.amountIn).toEqual(amountIn)
      expect(route.amountInMax).toEqual(amountIn)
      expect(route.amountOut).toEqual(amountOut)
      expect(route.exchange.name).toEqual('wbnb')

      let routeTransaction = await route.getTransaction({ from: fromAddress })

      let transactionMock = mock({ blockchain, transaction: {
        to: exchange.wrapper.address,
        api: exchange.wrapper.api,
        method: 'deposit',
        value: amountIn
      }})
      let wallet = (await getWallets())[0]
      await wallet.sendTransaction(routeTransaction)
      expect(transactionMock).toHaveBeenCalled()
    })

    it('does route WETH<>ETH', async ()=> {

      mock(blockchain)

      let amountIn = '100000000'
      let amountOut = '100000000'

      let route = await exchange.route({
        tokenIn: CONSTANTS[blockchain].WRAPPED,
        tokenOut: CONSTANTS[blockchain].NATIVE,
        amountInMax: amountIn,
        amountOut,
        fromAddress,
        toAddress
      })

      expect(route.tokenIn).toEqual(CONSTANTS[blockchain].WRAPPED)
      expect(route.tokenOut).toEqual(CONSTANTS[blockchain].NATIVE)
      expect(route.path).toEqual([CONSTANTS[blockchain].WRAPPED, CONSTANTS[blockchain].NATIVE])
      expect(route.amountIn).toEqual(amountIn)
      expect(route.amountInMax).toEqual(amountIn)
      expect(route.amountOut).toEqual(amountOut)
      expect(route.exchange.name).toEqual('wbnb')

      let routeTransaction = await route.getTransaction({ from: fromAddress })

      let transactionMock = mock({ blockchain, transaction: {
        to: exchange.wrapper.address,
        api: exchange.wrapper.api,
        method: 'withdraw',
        params: { wad: amountIn }
      }})
      let wallet = (await getWallets())[0]
      await wallet.sendTransaction(routeTransaction)
      expect(transactionMock).toHaveBeenCalled()
    })
  })
})
