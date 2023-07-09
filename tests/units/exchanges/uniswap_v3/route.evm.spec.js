import Blockchains from '@depay/web3-blockchains'
import { ethers } from 'ethers'
import Exchanges from 'dist/esm/index.evm'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/evm/uniswap_v3'
import { resetCache, getProvider } from '@depay/web3-client-evm'

describe('uniswap_v3', () => {
  
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  const exchange = Exchanges.uniswap_v3
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

        it('throws an error if no blockchain has been provided to route', async ()=> {

          await expect(
            exchange.route({
              tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
              tokenOut: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
              amountInMax: 10,
              fromAddress,
              toAddress
            })
          ).rejects.toEqual("You need to provide a blockchain when calling route on an exchange that supports multiple blockchains!")
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
              to: exchange[blockchain].factory.address,
              api: exchange[blockchain].factory.api,
              method: 'getPool',
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
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, tokenIn]), amountOutBN],
            amount: fetchedAmountInBN
          })
          ;[0,1].forEach((block)=>{
            mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
              params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, tokenIn]), amountOutBN],
              amount: fetchedAmountInBN,
              block
            })
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual(tokenOut)
          expect(route.pools[0].token1).toEqual(tokenIn)
          expect(route.pools[0].amountIn).toEqual(fetchedAmountInBN)
          expect(route.pools[0].amountOut).toEqual(amountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x01'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                amountOutBN.toString(),
                fetchedAmountInBN.add(slippage).toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [tokenIn, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
        })

        it('routes a token to token swap for given amountOutMin', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, tokenIn]), amountOutBN],
            amount: fetchedAmountInBN
          })
          ;[0,1].forEach((block)=>{
            mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
              params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, tokenIn]), amountOutBN],
              amount: fetchedAmountInBN,
              block
            })
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual(tokenOut)
          expect(route.pools[0].token1).toEqual(tokenIn)
          expect(route.pools[0].amountIn).toEqual(fetchedAmountInBN)
          expect(route.pools[0].amountOut).toEqual(amountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x00'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                fetchedAmountInBN.add(slippage).toString(),
                amountOutBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [tokenIn, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
        })

        it('routes a token to token swap for given amountIn', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, tokenOut]), amountInBN],
            amount: fetchedAmountOutBN
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual(tokenOut)
          expect(route.pools[0].token1).toEqual(tokenIn)
          expect(route.pools[0].amountIn).toEqual(amountInBN)
          expect(route.pools[0].amountOut).toEqual(fetchedAmountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x00'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                amountInBN.toString(),
                fetchedAmountOutBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [tokenIn, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
        })

        it('routes a token to token swap for given amountInMax', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, tokenOut]), amountInBN],
            amount: fetchedAmountOutBN
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual(tokenOut)
          expect(route.pools[0].token1).toEqual(tokenIn)
          expect(route.pools[0].amountIn).toEqual(amountInBN)
          expect(route.pools[0].amountOut).toEqual(fetchedAmountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x01'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                fetchedAmountOutBN.toString(),
                amountInBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [tokenIn, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
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
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), amountOutBN],
            amount: fetchedAmountInBN
          })
          ;[0,1].forEach((block)=>{
            mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
              params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), amountOutBN],
              amount: fetchedAmountInBN,
              block
            })
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[1])
          expect(route.pools[0].amountIn).toEqual(fetchedAmountInBN)
          expect(route.pools[0].amountOut).toEqual(amountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x01', '0x0c'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                amountOutBN.toString(),
                fetchedAmountInBN.add(slippage).toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [tokenIn, fee, Blockchains[blockchain].wrapped.address]),
                true
              ]
            ),
            ethers.utils.solidityPack(["address", "uint256"],
              [
                fromAddress,
                amountOutBN.toString(),
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
        })

        it('routes a token to token swap for given amountOutMin', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), amountOutBN],
            amount: fetchedAmountInBN
          })
          ;[0,1].forEach((block)=>{
            mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
              params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), amountOutBN],
              amount: fetchedAmountInBN,
              block
            })
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[1])
          expect(route.pools[0].amountIn).toEqual(fetchedAmountInBN)
          expect(route.pools[0].amountOut).toEqual(amountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x00', '0x0c'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                fetchedAmountInBN.add(slippage).toString(),
                amountOutBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [tokenIn, fee, Blockchains[blockchain].wrapped.address]),
                true
              ]
            ),
            ethers.utils.solidityPack(["address", "uint256"],
              [
                fromAddress,
                amountOutBN.toString(),
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
        })

        it('routes a token to token swap for given amountIn', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, Blockchains[blockchain].wrapped.address]), amountInBN],
            amount: fetchedAmountOutBN
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[1])
          expect(route.pools[0].amountIn).toEqual(amountInBN)
          expect(route.pools[0].amountOut).toEqual(fetchedAmountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x00', '0x0c'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                amountInBN.toString(),
                fetchedAmountOutBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [tokenIn, fee, Blockchains[blockchain].wrapped.address]),
                true
              ]
            ),
            ethers.utils.solidityPack(["address", "uint256"],
              [
                fromAddress,
                fetchedAmountOutBN.toString(),
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
        })

        it('routes a token to token swap for given amountInMax', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, Blockchains[blockchain].wrapped.address]), amountInBN],
            amount: fetchedAmountOutBN
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[1])
          expect(route.pools[0].amountIn).toEqual(amountInBN)
          expect(route.pools[0].amountOut).toEqual(fetchedAmountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x01', '0x0c'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                fetchedAmountOutBN.toString(),
                amountInBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [tokenIn, fee, Blockchains[blockchain].wrapped.address]),
                true
              ]
            ),
            ethers.utils.solidityPack(["address", "uint256"],
              [
                fromAddress,
                fetchedAmountOutBN.toString(),
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
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

          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn: Blockchains[blockchain].wrapped.address, tokenOut, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, Blockchains[blockchain].wrapped.address]), amountOutBN],
            amount: fetchedAmountInBN
          })
          ;[0,1].forEach((block)=>{
            mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
              params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, Blockchains[blockchain].wrapped.address]), amountOutBN],
              amount: fetchedAmountInBN,
              block
            })
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[1])
          expect(route.pools[0].amountIn).toEqual(fetchedAmountInBN)
          expect(route.pools[0].amountOut).toEqual(amountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x0b', '0x01'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256"],
              [
                fromAddress,
                fetchedAmountInBN.add(slippage).toString(),
              ]
            ),
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                amountOutBN.toString(),
                fetchedAmountInBN.add(slippage).toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [Blockchains[blockchain].wrapped.address, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual(fetchedAmountInBN.add(slippage).toString())
        })

        it('routes a token to token swap for given amountOutMin', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn: Blockchains[blockchain].wrapped.address, tokenOut, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, Blockchains[blockchain].wrapped.address]), amountOutBN],
            amount: fetchedAmountInBN
          })
          ;[0,1].forEach((block)=>{
            mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
              params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, Blockchains[blockchain].wrapped.address]), amountOutBN],
              amount: fetchedAmountInBN,
              block
            })
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[1])
          expect(route.pools[0].amountIn).toEqual(fetchedAmountInBN)
          expect(route.pools[0].amountOut).toEqual(amountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x0b', '0x00'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256"],
              [
                fromAddress,
                fetchedAmountInBN.add(slippage).toString(),
              ]
            ),
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                fetchedAmountInBN.add(slippage).toString(),
                amountOutBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [Blockchains[blockchain].wrapped.address, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual(fetchedAmountInBN.add(slippage).toString())
        })

        it('routes a token to token swap for given amountIn', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn: Blockchains[blockchain].wrapped.address, tokenOut, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenOut]), amountInBN],
            amount: fetchedAmountOutBN
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[1])
          expect(route.pools[0].amountIn).toEqual(amountInBN)
          expect(route.pools[0].amountOut).toEqual(fetchedAmountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x0b', '0x00'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256"],
              [
                fromAddress,
                amountInBN.toString(),
              ]
            ),
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                amountInBN.toString(),
                fetchedAmountOutBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [Blockchains[blockchain].wrapped.address, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual(amountInBN.toString())
        })

        it('routes a token to token swap for given amountInMax', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn: Blockchains[blockchain].wrapped.address, tokenOut, fee, pair })
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenOut]), amountInBN],
            amount: fetchedAmountOutBN
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[1])
          expect(route.pools[0].amountIn).toEqual(amountInBN)
          expect(route.pools[0].amountOut).toEqual(fetchedAmountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x0b', '0x01'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256"],
              [
                fromAddress,
                amountInBN.toString(),
              ]
            ),
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                fetchedAmountOutBN.toString(),
                amountInBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address"], [Blockchains[blockchain].wrapped.address, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual(amountInBN.toString())
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
          let middleAmount = 2
          let middleAmountBN = ethers.utils.parseUnits(middleAmount.toString(), Blockchains[blockchain].currency.decimals)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair })
          mockPair({ blockchain, exchange, provider, tokenIn: tokenOut, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair: pair2 })
          
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, Blockchains[blockchain].wrapped.address]), amountOutBN],
            amount: middleAmountBN
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), middleAmountBN],
            amount: fetchedAmountInBN
          })

          ;[0,1].forEach((block)=>{
            mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
              params: [ethers.utils.solidityPack(["address","uint24","address","uint24","address",],[tokenOut, fee, Blockchains[blockchain].wrapped.address, fee, tokenIn]), amountOutBN],
              amount: fetchedAmountInBN,
              block
            })

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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[1])
          expect(route.pools[0].amountIn).toEqual(fetchedAmountInBN)
          expect(route.pools[0].amountOut).toEqual(middleAmountBN)
          expect(route.pools[1].blockchain).toEqual(blockchain)
          expect(route.pools[1].address).toEqual(pair2)
          expect(route.pools[1].fee).toEqual(fee)
          expect(route.pools[1].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[0])
          expect(route.pools[1].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[1])
          expect(route.pools[1].amountIn).toEqual(middleAmountBN)
          expect(route.pools[1].amountOut).toEqual(amountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x01'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                amountOutBN.toString(),
                fetchedAmountInBN.add(slippage).toString(),
                ethers.utils.solidityPack(["address","uint24","address","uint24","address"], [tokenIn, fee, Blockchains[blockchain].wrapped.address, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
        })

        it('routes a token to token swap for given amountOutMin', async ()=> {

          let amountOut = 1
          let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
          let middleAmount = 2
          let middleAmountBN = ethers.utils.parseUnits(amountOut.toString(), Blockchains[blockchain].currency.decimals)
          let fetchedAmountIn = 43
          let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
          let slippage = ethers.BigNumber.from('215000000000000000')

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair })
          mockPair({ blockchain, exchange, provider, tokenIn: tokenOut, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair: pair2 })
          
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, Blockchains[blockchain].wrapped.address]), amountOutBN],
            amount: middleAmountBN
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), middleAmountBN],
            amount: fetchedAmountInBN
          })

          ;[0,1].forEach((block)=>{
            mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
              params: [ethers.utils.solidityPack(["address","uint24","address","uint24","address",],[tokenOut, fee, Blockchains[blockchain].wrapped.address, fee, tokenIn]), amountOutBN],
              amount: fetchedAmountInBN,
              block
            })

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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[1])
          expect(route.pools[0].amountIn).toEqual(fetchedAmountInBN)
          expect(route.pools[0].amountOut).toEqual(middleAmountBN)
          expect(route.pools[1].blockchain).toEqual(blockchain)
          expect(route.pools[1].address).toEqual(pair2)
          expect(route.pools[1].fee).toEqual(fee)
          expect(route.pools[1].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[0])
          expect(route.pools[1].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[1])
          expect(route.pools[1].amountIn).toEqual(middleAmountBN)
          expect(route.pools[1].amountOut).toEqual(amountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x00'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                fetchedAmountInBN.add(slippage).toString(),
                amountOutBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address","uint24","address"], [tokenIn, fee, Blockchains[blockchain].wrapped.address, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
        })

        it('routes a token to token swap for given amountIn', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let middleAmount = 2
          let middleAmountBN = ethers.utils.parseUnits(middleAmount.toString(), Blockchains[blockchain].currency.decimals)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair })
          mockPair({ blockchain, exchange, provider, tokenIn: tokenOut, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair: pair2 })
          
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, Blockchains[blockchain].wrapped.address]), amountInBN],
            amount: middleAmountBN
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenOut]), middleAmountBN],
            amount: fetchedAmountOutBN
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
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[1])
          expect(route.pools[0].amountIn).toEqual(amountInBN)
          expect(route.pools[0].amountOut).toEqual(middleAmountBN)
          expect(route.pools[1].blockchain).toEqual(blockchain)
          expect(route.pools[1].address).toEqual(pair2)
          expect(route.pools[1].fee).toEqual(fee)
          expect(route.pools[1].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[0])
          expect(route.pools[1].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[1])
          expect(route.pools[1].amountIn).toEqual(middleAmountBN)
          expect(route.pools[1].amountOut).toEqual(fetchedAmountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x00'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                amountInBN.toString(),
                fetchedAmountOutBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address","uint24","address"], [tokenIn, fee, Blockchains[blockchain].wrapped.address, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
        })

        it('routes a token to token swap for given amountInMax', async ()=> {

          let amountIn = 1
          let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
          let middleAmount = 2
          let middleAmountBN = ethers.utils.parseUnits(middleAmount.toString(), Blockchains[blockchain].currency.decimals)
          let fetchedAmountOut = 43
          let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)

          mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
          mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
          mockPair({ blockchain, exchange, provider, tokenIn, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair })
          mockPair({ blockchain, exchange, provider, tokenIn: tokenOut, tokenOut: Blockchains[blockchain].wrapped.address, fee, pair: pair2 })
          
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, Blockchains[blockchain].wrapped.address]), amountInBN],
            amount: middleAmountBN
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenOut]), middleAmountBN],
            amount: fetchedAmountOutBN
          })

          const route = await exchange.route({
            blockchain,
            fromAddress,
            amountInMax: amountInBN,
            tokenIn,
            tokenOut
          })

          expect(route.tokenIn).toEqual(tokenIn)
          expect(route.tokenOut).toEqual(tokenOut)
          expect(route.path).toEqual([tokenIn, Blockchains[blockchain].wrapped.address, tokenOut])
          expect(route.pools[0].blockchain).toEqual(blockchain)
          expect(route.pools[0].address).toEqual(pair)
          expect(route.pools[0].fee).toEqual(fee)
          expect(route.pools[0].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[0])
          expect(route.pools[0].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenIn].sort()[1])
          expect(route.pools[0].amountIn).toEqual(amountInBN)
          expect(route.pools[0].amountOut).toEqual(middleAmountBN)
          expect(route.pools[1].blockchain).toEqual(blockchain)
          expect(route.pools[1].address).toEqual(pair2)
          expect(route.pools[1].fee).toEqual(fee)
          expect(route.pools[1].token0).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[0])
          expect(route.pools[1].token1).toEqual([Blockchains[blockchain].wrapped.address, tokenOut].sort()[1])
          expect(route.pools[1].amountIn).toEqual(middleAmountBN)
          expect(route.pools[1].amountOut).toEqual(fetchedAmountOutBN)
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
          expect(transaction.method).toEqual('execute')
          expect(transaction.params.commands).toEqual(['0x01'])
          expect(transaction.params.inputs).toEqual([
            ethers.utils.solidityPack(["address", "uint256", "uint256", "bytes", "bool"],
              [
                fromAddress,
                fetchedAmountOutBN.toString(),
                amountInBN.toString(),
                ethers.utils.solidityPack(["address","uint24","address","uint24","address"], [tokenIn, fee, Blockchains[blockchain].wrapped.address, fee, tokenOut]),
                true
              ]
            )
          ])
          expect(transaction.value).toEqual('0')
        })
      })
    })
  })
})
