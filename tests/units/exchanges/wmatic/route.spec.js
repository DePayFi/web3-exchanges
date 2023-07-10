import Route from 'src/classes/Route'
import Blockchains from '@depay/web3-blockchains'
import { ethers } from 'ethers'
import Exchanges from 'src'
import { getWallets } from '@depay/web3-wallets'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { resetCache, getProvider } from '@depay/web3-client'
import { testRouting } from 'tests/helpers/testRouting'

describe('wmatic', () => {
  
  const blockchain = 'polygon'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  const exchange = Exchanges.wmatic
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
        tokenIn: Blockchains[blockchain].currency.address,
        tokenOut: Blockchains[blockchain].wrapped.address,
        amountInMax: amountIn,
        fromAddress,
        toAddress
      })

      expect(route.tokenIn).toEqual(Blockchains[blockchain].currency.address)
      expect(route.tokenOut).toEqual(Blockchains[blockchain].wrapped.address)
      expect(route.path).toEqual([Blockchains[blockchain].currency.address, Blockchains[blockchain].wrapped.address])
      expect(route.amountIn).toEqual(amountIn)
      expect(route.amountInMax).toEqual(amountIn)
      expect(route.amountOut).toEqual(amountOut)
      expect(route.exchange.name).toEqual('wmatic')

      let routeTransaction = await route.getTransaction({ from: fromAddress })

      let transactionMock = mock({ blockchain, transaction: {
        to: exchange[blockchain].router.address,
        api: exchange[blockchain].router.api,
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
        tokenIn: Blockchains[blockchain].wrapped.address,
        tokenOut: Blockchains[blockchain].currency.address,
        amountInMax: amountIn,
        fromAddress,
        toAddress
      })

      expect(route.tokenIn).toEqual(Blockchains[blockchain].wrapped.address)
      expect(route.tokenOut).toEqual(Blockchains[blockchain].currency.address)
      expect(route.path).toEqual([Blockchains[blockchain].wrapped.address, Blockchains[blockchain].currency.address])
      expect(route.amountIn).toEqual(amountIn)
      expect(route.amountInMax).toEqual(amountIn)
      expect(route.amountOut).toEqual(amountOut)
      expect(route.exchange.name).toEqual('wmatic')

      let routeTransaction = await route.getTransaction({ from: fromAddress })

      let transactionMock = mock({ blockchain, transaction: {
        to: exchange[blockchain].router.address,
        api: exchange[blockchain].router.api,
        method: 'withdraw',
        params: { wad: amountIn }
      }})
      let wallet = (await getWallets())[0]
      await wallet.sendTransaction(routeTransaction)
      expect(transactionMock).toHaveBeenCalled()
    })
  })
})
