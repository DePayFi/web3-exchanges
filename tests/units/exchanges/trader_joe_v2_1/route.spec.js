import Blockchains from '@depay/web3-blockchains'
import { ethers } from 'ethers'
import Exchanges from 'src'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPath } from 'tests/mocks/evm/trader_joe_v2_1'
import { resetCache, getProvider } from '@depay/web3-client'

describe('trader_joe_v2_1', () => {
  
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  const exchange = Exchanges.trader_joe_v2_1
  const pair = '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d'
  const pair2 = '0x08B277154218CCF3380CAE48d630DA13462E3950'
  const fromAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  const toAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'

  exchange.blockchains.forEach((blockchain)=>{

    describe(blockchain, ()=>{
  
      let provider
      beforeEach(async ()=>{
        resetMocks()
        resetCache()
        provider = await getProvider(blockchain)
        mock({ blockchain, accounts: { return: accounts } })
      })

      describe('basic routing', ()=>{

        it('does not try to find a route from and to the same token, as that doesnt make any sense', async ()=> {
          mock(blockchain)
          let amountOut = 5
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), 18)
          let amountIn = 5

          let route = await exchange.route({
            blockchain,
            tokenIn: '0xa0bed124a09ac2bd941b10349d8d224fe3c955eb',
            tokenOut: '0xa0bed124a09ac2bd941b10349d8d224fe3c955eb',
            amountInMax: amountIn,
            fromAddress,
            toAddress
          })

          expect(route).toEqual(undefined)
        })

        it('returns undefined and does not fail or reject in case an error happens during the routing', async ()=> {

          mock(blockchain)

          let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
          let decimalsIn = 18
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let tokenOut = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
          let decimalsOut = 6
          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let path = [tokenIn, tokenOut]

          mockDecimals({ provider, blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ provider, blockchain, address: tokenOut, value: decimalsOut })

          mock({
            provider,
            blockchain,
            request: {
              to: exchange[blockchain].quoter.address,
              api: exchange[blockchain].quoter.api,
              method: 'findBestPathFromAmountIn',
              return: Error('Routing Error')
            }
          })

          let route = await exchange.route({
            blockchain,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountInMax: fetchedAmountIn,
            fromAddress,
            toAddress
          })

          expect(route).toEqual(undefined)
        })
      })

      describe('route token to token (1 pool)', ()=>{

        let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
        let decimalsIn = 18
        let tokenOut = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
        let decimalsOut = 6
        let path = [tokenIn, tokenOut]
        let fee = 3000

        it('routes a token to token swap for a given amountOut', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [tokenIn, tokenOut],
            amounts: [fetchedAmountInBN, amountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountOut,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, tokenOut])
          expect(route.amountOutMin).toEqual(undefined)
          expect(route.amountOut).toEqual(amountOutBN.toString())
          expect(route.amountIn).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.amountInMax).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForTokens')
          expect(transaction.params.amountIn.toString()).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(transaction.params.amountOutMin.toString()).toEqual(amountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountOutMin', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [tokenIn, tokenOut],
            amounts: [fetchedAmountInBN, amountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountOutMin: amountOut,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, tokenOut])
          expect(route.amountOutMin).toEqual(amountOutBN.toString())
          expect(route.amountOut).toEqual(undefined)
          expect(route.amountIn).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.amountInMax).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForTokens')
          expect(transaction.params.amountIn.toString()).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(transaction.params.amountOutMin.toString()).toEqual(amountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountIn', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, tokenOut],
            amounts: [amountInBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountIn,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, tokenOut])
          expect(route.amountOutMin).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountOut).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountIn).toEqual(amountInBN.toString())
          expect(route.amountInMax).toEqual(undefined)
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForTokens')
          expect(transaction.params.amountIn.toString()).toEqual(amountInBN.toString())
          expect(transaction.params.amountOutMin.toString()).toEqual(fetchedAmountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountInMax', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, tokenOut],
            amounts: [amountInBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountInMax: amountIn,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, tokenOut])
          expect(route.amountOutMin).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountOut).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountIn).toEqual(undefined)
          expect(route.amountInMax).toEqual(amountInBN.toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapTokensForExactTokens')
          expect(transaction.params.amountInMax.toString()).toEqual(amountInBN.toString())
          expect(transaction.params.amountOut.toString()).toEqual(fetchedAmountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })
      })

      describe('routes token to native (1 pool)', ()=>{

        let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
        let decimalsIn = 18
        let tokenOut = Blockchains[blockchain].currency.address
        let decimalsOut = Blockchains[blockchain].currency.decimals
        let path = [tokenIn, tokenOut]
        let fee = 3000

        it('routes a token to token swap for a given amountOut', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address],
            amounts: [fetchedAmountInBN, amountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountOut,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(undefined)
          expect(route.amountOut).toEqual(amountOutBN.toString())
          expect(route.amountIn).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.amountInMax).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForNATIVE')
          expect(transaction.params.amountIn.toString()).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(transaction.params.amountOutMinNATIVE.toString()).toEqual(amountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].wrapped.address]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountOutMin', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address],
            amounts: [fetchedAmountInBN, amountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountOutMin: amountOut,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(amountOutBN.toString())
          expect(route.amountOut).toEqual(undefined)
          expect(route.amountIn).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.amountInMax).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForNATIVE')
          expect(transaction.params.amountIn.toString()).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(transaction.params.amountOutMinNATIVE.toString()).toEqual(amountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].wrapped.address]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountIn', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address],
            amounts: [amountInBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountIn,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountOut).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountIn).toEqual(amountInBN.toString())
          expect(route.amountInMax).toEqual(undefined)
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForNATIVE')
          expect(transaction.params.amountIn.toString()).toEqual(amountInBN.toString())
          expect(transaction.params.amountOutMinNATIVE.toString()).toEqual(fetchedAmountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].wrapped.address]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountInMax', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address],
            amounts: [amountInBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountInMax: amountIn,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountOut).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountIn).toEqual(undefined)
          expect(route.amountInMax).toEqual(amountInBN.toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapTokensForExactNATIVE')
          expect(transaction.params.amountInMax.toString()).toEqual(amountInBN.toString())
          expect(transaction.params.amountNATIVEOut.toString()).toEqual(fetchedAmountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].wrapped.address]) // route
          expect(transaction.value).toEqual(undefined)
        })
      })

      describe('routes native to token (1 pool)', ()=>{

        let tokenIn = Blockchains[blockchain].currency.address
        let decimalsIn = Blockchains[blockchain].currency.decimals
        let tokenOut = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
        let decimalsOut = 18
        let path = [tokenIn, tokenOut]
        let fee = 3000

        it('routes a token to token swap for a given amountOut', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [fetchedAmountInBN, amountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountOut,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(undefined)
          expect(route.amountOut).toEqual(amountOutBN.toString())
          expect(route.amountIn).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.amountInMax).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactNATIVEForTokens')
          expect(transaction.params.amountOutMin.toString()).toEqual(amountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([Blockchains[blockchain].wrapped.address, tokenOut]) // route
          expect(transaction.value).toEqual(fetchedAmountInBN.add(slippage))
        })

        it('routes a token to token swap for given amountOutMin', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [fetchedAmountInBN, amountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountOutMin: amountOut,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(amountOutBN.toString())
          expect(route.amountOut).toEqual(undefined)
          expect(route.amountIn).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.amountInMax).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactNATIVEForTokens')
          expect(transaction.params.amountOutMin.toString()).toEqual(amountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([Blockchains[blockchain].wrapped.address, tokenOut]) // route
          expect(transaction.value).toEqual(fetchedAmountInBN.add(slippage))
        })

        it('routes a token to token swap for given amountIn', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [amountInBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountIn,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountOut).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountIn).toEqual(amountInBN.toString())
          expect(route.amountInMax).toEqual(undefined)
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactNATIVEForTokens')
          expect(transaction.params.amountOutMin.toString()).toEqual(fetchedAmountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([Blockchains[blockchain].wrapped.address, tokenOut]) // route
          expect(transaction.value).toEqual(amountInBN)
        })

        it('routes a token to token swap for given amountInMax', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [amountInBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountInMax: amountIn,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountOut).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountIn).toEqual(undefined)
          expect(route.amountInMax).toEqual(amountInBN.toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapNATIVEForExactTokens')
          expect(transaction.params.amountOut.toString()).toEqual(fetchedAmountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([Blockchains[blockchain].wrapped.address, tokenOut]) // route
          expect(transaction.value).toEqual(amountInBN)
        })
      })
      
      describe('route token to token (2 pools) via WRAPPED', ()=>{

        let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
        let decimalsIn = 18
        let tokenOut = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
        let decimalsOut = 6
        let path = [tokenIn, Blockchains[blockchain].wrapped.address, tokenOut]
        let fee = 3000

        it('routes a token to token swap for a given amountOut', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let middleAmountBN = ethers.utils.parseUnits("10", Blockchains[blockchain].currency.decimals)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [middleAmountBN, amountOut],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: middleAmountBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address],
            amounts: [fetchedAmountInBN, middleAmountBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })
          
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [fetchedAmountInBN, middleAmountBN, amountOut],
            steps: [ethers.BigNumber.from(10), ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000), ethers.BigNumber.from(1000)],
            pairs: [pair, pair2],
            versions: [2, 2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountOut,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(undefined)
          expect(route.amountOut).toEqual(amountOutBN.toString())
          expect(route.amountIn).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.amountInMax).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForTokens')
          expect(transaction.params.amountIn.toString()).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(transaction.params.amountOutMin.toString()).toEqual(amountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountOutMin', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let middleAmountBN = ethers.utils.parseUnits("10", Blockchains[blockchain].currency.decimals)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [middleAmountBN, amountOut],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: middleAmountBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address],
            amounts: [fetchedAmountInBN, middleAmountBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })
          
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [fetchedAmountInBN, middleAmountBN, amountOut],
            steps: [ethers.BigNumber.from(10), ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000), ethers.BigNumber.from(1000)],
            pairs: [pair, pair2],
            versions: [2, 2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountOutMin: amountOut,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(amountOutBN.toString())
          expect(route.amountOut).toEqual(undefined)
          expect(route.amountIn).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.amountInMax).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForTokens')
          expect(transaction.params.amountIn.toString()).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(transaction.params.amountOutMin.toString()).toEqual(amountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountIn', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let middleAmountBN = ethers.utils.parseUnits("10", Blockchains[blockchain].currency.decimals)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address],
            amounts: [amountInBN, middleAmountBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: middleAmountBN,
            path: [Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [middleAmountBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })
          
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [amountInBN, middleAmountBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10), ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000), ethers.BigNumber.from(1000)],
            pairs: [pair, pair2],
            versions: [2, 2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountIn,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountOut).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountIn).toEqual(amountInBN.toString())
          expect(route.amountInMax).toEqual(undefined)
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForTokens')
          expect(transaction.params.amountIn.toString()).toEqual(amountInBN.toString())
          expect(transaction.params.amountOutMin.toString()).toEqual(fetchedAmountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountInMax', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let middleAmountBN = ethers.utils.parseUnits("10", Blockchains[blockchain].currency.decimals)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address],
            amounts: [amountInBN, middleAmountBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: middleAmountBN,
            path: [Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [middleAmountBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })
          
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, Blockchains[blockchain].wrapped.address, tokenOut],
            amounts: [amountInBN, middleAmountBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10), ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000), ethers.BigNumber.from(1000)],
            pairs: [pair, pair2],
            versions: [2, 2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountInMax: amountIn,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.amountOutMin).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountOut).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountIn).toEqual(undefined)
          expect(route.amountInMax).toEqual(amountInBN.toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapTokensForExactTokens')
          expect(transaction.params.amountInMax.toString()).toEqual(amountInBN.toString())
          expect(transaction.params.amountOut.toString()).toEqual(fetchedAmountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })
      })

      describe('route token to token (2 pools) via STABLE', ()=>{

        let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
        let decimalsIn = 18
        let tokenOut = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
        let decimalsOut = 6
        let path = [tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut]
        let fee = 3000

        it('routes a token to token swap for a given amountOut', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let middleAmountBN = ethers.utils.parseUnits("10", Blockchains[blockchain].currency.decimals)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [Blockchains[blockchain].stables.usd[0], tokenOut],
            amounts: [middleAmountBN, amountOut],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: middleAmountBN,
            path: [tokenIn, Blockchains[blockchain].stables.usd[0]],
            amounts: [fetchedAmountInBN, middleAmountBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })
          
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut],
            amounts: [fetchedAmountInBN, middleAmountBN, amountOut],
            steps: [ethers.BigNumber.from(10), ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000), ethers.BigNumber.from(1000)],
            pairs: [pair, pair2],
            versions: [2, 2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountOut,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut])
          expect(route.amountOutMin).toEqual(undefined)
          expect(route.amountOut).toEqual(amountOutBN.toString())
          expect(route.amountIn).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.amountInMax).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForTokens')
          expect(transaction.params.amountIn.toString()).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(transaction.params.amountOutMin.toString()).toEqual(amountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountOutMin', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let middleAmountBN = ethers.utils.parseUnits("10", Blockchains[blockchain].currency.decimals)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [Blockchains[blockchain].stables.usd[0], tokenOut],
            amounts: [middleAmountBN, amountOut],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: middleAmountBN,
            path: [tokenIn, Blockchains[blockchain].stables.usd[0]],
            amounts: [fetchedAmountInBN, middleAmountBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })
          
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountOut: amountOutBN,
            path: [tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut],
            amounts: [fetchedAmountInBN, middleAmountBN, amountOut],
            steps: [ethers.BigNumber.from(10), ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000), ethers.BigNumber.from(1000)],
            pairs: [pair, pair2],
            versions: [2, 2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountOutMin: amountOut,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut])
          expect(route.amountOutMin).toEqual(amountOutBN.toString())
          expect(route.amountOut).toEqual(undefined)
          expect(route.amountIn).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.amountInMax).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForTokens')
          expect(transaction.params.amountIn.toString()).toEqual(fetchedAmountInBN.add(slippage).toString())
          expect(transaction.params.amountOutMin.toString()).toEqual(amountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountIn', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let middleAmountBN = ethers.utils.parseUnits("10", Blockchains[blockchain].currency.decimals)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, Blockchains[blockchain].stables.usd[0]],
            amounts: [amountInBN, middleAmountBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: middleAmountBN,
            path: [Blockchains[blockchain].stables.usd[0], tokenOut],
            amounts: [middleAmountBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })
          
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut],
            amounts: [amountInBN, middleAmountBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10), ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000), ethers.BigNumber.from(1000)],
            pairs: [pair, pair2],
            versions: [2, 2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountIn,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut])
          expect(route.amountOutMin).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountOut).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountIn).toEqual(amountInBN.toString())
          expect(route.amountInMax).toEqual(undefined)
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapExactTokensForTokens')
          expect(transaction.params.amountIn.toString()).toEqual(amountInBN.toString())
          expect(transaction.params.amountOutMin.toString()).toEqual(fetchedAmountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })

        it('routes a token to token swap for given amountInMax', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let middleAmountBN = ethers.utils.parseUnits("10", Blockchains[blockchain].currency.decimals)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, Blockchains[blockchain].stables.usd[0]],
            amounts: [amountInBN, middleAmountBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })

          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: middleAmountBN,
            path: [Blockchains[blockchain].stables.usd[0], tokenOut],
            amounts: [middleAmountBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000)],
            pairs: [pair],
            versions: [2],
          })
          
          mockPath({ 
            blockchain,
            exchange,
            provider,
            amountIn: amountInBN,
            path: [tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut],
            amounts: [amountInBN, middleAmountBN, fetchedAmountOutBN],
            steps: [ethers.BigNumber.from(10), ethers.BigNumber.from(10)],
            fees: [ethers.BigNumber.from(1000), ethers.BigNumber.from(1000)],
            pairs: [pair, pair2],
            versions: [2, 2],
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountInMax: amountIn,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut])
          expect(route.amountOutMin).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountOut).toEqual(fetchedAmountOutBN.toString())
          expect(route.amountIn).toEqual(undefined)
          expect(route.amountInMax).toEqual(amountInBN.toString())
          expect(route.exchange).toBeDefined()

          const transaction = await route.getTransaction({ from: fromAddress })
          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('swapTokensForExactTokens')
          expect(transaction.params.amountInMax.toString()).toEqual(amountInBN.toString())
          expect(transaction.params.amountOut.toString()).toEqual(fetchedAmountOutBN.toString())
          expect(transaction.params.deadline != undefined).toEqual(true)
          expect(transaction.params.path[0][0].toString()).toEqual("10") // binSteps
          expect(transaction.params.path[1][0].toString()).toEqual("2") // versions
          expect(transaction.params.path[2]).toEqual([tokenIn, Blockchains[blockchain].stables.usd[0], tokenOut]) // route
          expect(transaction.value).toEqual(undefined)
        })

      })
    })
  })
})
