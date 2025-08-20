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

  exchange.blockchains.filter((blockchain)=>blockchain!='gnosis').forEach((blockchain)=>{

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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, tokenIn]), amountOutBN.mul(2)],
            amount: fetchedAmountInBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect(transaction.params.data).toEqual(["0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002b1f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000"])
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, tokenIn]), amountOutBN.mul(2)],
            amount: fetchedAmountInBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect(transaction.params.data).toEqual(["0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000"])
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, tokenOut]), amountInBN.mul(2)],
            amount: fetchedAmountOutBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect(transaction.params.data).toEqual(["0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000029020c0000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000"])
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, tokenOut]), amountInBN.mul(2)],
            amount: fetchedAmountOutBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect(transaction.params.data).toEqual(["0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002b1f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000"])
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), amountOutBN.mul(2)],
            amount: fetchedAmountInBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect([
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002b82af49447d8a07e3bd95bd0d56f35241523fbab1000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002b0d500b1d8e8ef31e21c99d1db9a6444d3adf1270000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002b4200000000000000000000000000000000000006000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002bb31f66aa3c1e785363f0875a1b74e27b85fd66c7000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002bbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002bc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[0])).toEqual(true)
          expect(transaction.params.data[1]).toEqual('0x496169970000000000000000000000000000000000000000000000000de0b6b3a7640000')
          expect(transaction.params.data[2]).toEqual('0x12210e8a')
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), amountOutBN.mul(2)],
            amount: fetchedAmountInBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect([
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000257ba8589808180000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000257ba8589808180000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000257ba8589808180000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb80d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000257ba8589808180000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb84200000000000000000000000000000000000006000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000257ba8589808180000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb882af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000257ba8589808180000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8b31f66aa3c1e785363f0875a1b74e27b85fd66c7000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[0])).toEqual(true)
          expect(transaction.params.data[1]).toEqual('0x496169970000000000000000000000000000000000000000000000000de0b6b3a7640000')
          expect(transaction.params.data[2]).toEqual('0x12210e8a')
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, Blockchains[blockchain].wrapped.address]), amountInBN.mul(2)],
            amount: fetchedAmountOutBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect([
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000',
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000000000000000000000000000000000000000000',
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb80d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000000000000000000000',
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb84200000000000000000000000000000000000006000000000000000000000000000000000000000000',
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb882af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000',
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8b31f66aa3c1e785363f0875a1b74e27b85fd66c7000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[0])).toEqual(true)
          expect(transaction.params.data[1]).toEqual('0x4961699700000000000000000000000000000000000000000000000254beb02d1dcc0000')
          expect(transaction.params.data[2]).toEqual('0x12210e8a')
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, Blockchains[blockchain].wrapped.address]), amountInBN.mul(2)],
            amount: fetchedAmountOutBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect([
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002bc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002bbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002b0d500b1d8e8ef31e21c99d1db9a6444d3adf1270000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002b4200000000000000000000000000000000000006000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002b82af49447d8a07e3bd95bd0d56f35241523fbab1000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002b4200000000000000000000000000000000000006000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002bb31f66aa3c1e785363f0875a1b74e27b85fd66c7000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[0])).toEqual(true)
          expect(transaction.params.data[1]).toEqual('0x4961699700000000000000000000000000000000000000000000000254beb02d1dcc0000')
          expect(transaction.params.data[2]).toEqual('0x12210e8a')
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, Blockchains[blockchain].wrapped.address]), amountOutBN.mul(2)],
            amount: fetchedAmountInBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect([
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000',
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000000000000000000000000000000000000000000',
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb80d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000000000000000000000',
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb84200000000000000000000000000000000000006000000000000000000000000000000000000000000',
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb882af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000',
            '0x09b813460000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000257ba858980818000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8b31f66aa3c1e785363f0875a1b74e27b85fd66c7000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[0])).toEqual(true)
          expect(transaction.params.data[1]).toEqual('0x12210e8a')
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, Blockchains[blockchain].wrapped.address]), amountOutBN.mul(2)],
            amount: fetchedAmountInBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect(transaction.params.data[0]).toEqual('0x1c58db4f00000000000000000000000000000000000000000000000257ba858980818000')
          expect([
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002bc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002bbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002b0d500b1d8e8ef31e21c99d1db9a6444d3adf1270000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002b4200000000000000000000000000000000000006000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002b82af49447d8a07e3bd95bd0d56f35241523fbab1000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002bb31f66aa3c1e785363f0875a1b74e27b85fd66c7000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[1])).toEqual(true)
          expect(transaction.params.data[2]).toEqual('0x12210e8a')
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenOut]), amountInBN.mul(2)],
            amount: fetchedAmountOutBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect(transaction.params.data[0]).toEqual('0x1c58db4f0000000000000000000000000000000000000000000000000de0b6b3a7640000')
          expect([
            '0xb858183f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002bc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0xb858183f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002bbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0xb858183f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002b0d500b1d8e8ef31e21c99d1db9a6444d3adf1270000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0xb858183f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002b4200000000000000000000000000000000000006000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0xb858183f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002b82af49447d8a07e3bd95bd0d56f35241523fbab1000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
            '0xb858183f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000254beb02d1dcc0000000000000000000000000000000000000000000000000000000000000000002bb31f66aa3c1e785363f0875a1b74e27b85fd66c7000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[1])).toEqual(true)
          expect(transaction.params.data[2]).toEqual('0x12210e8a')
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
          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenOut]), amountInBN.mul(2)],
            amount: fetchedAmountOutBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect([
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb80d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb84200000000000000000000000000000000000006000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb882af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000254beb02d1dcc00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000002ba0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8b31f66aa3c1e785363f0875a1b74e27b85fd66c7000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[0])).toEqual(true)
          expect(transaction.params.data[1]).toEqual('0x12210e8a')
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
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, Blockchains[blockchain].wrapped.address]), amountOutBN.mul(2)],
            amount: middleAmountBN.mul(2)
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), middleAmountBN],
            amount: fetchedAmountInBN
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), middleAmountBN.mul(2)],
            amount: fetchedAmountInBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect([
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb80d500b1d8e8ef31e21c99d1db9a6444d3adf1270000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb84200000000000000000000000000000000000006000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb882af49447d8a07e3bd95bd0d56f35241523fbab1000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8b31f66aa3c1e785363f0875a1b74e27b85fd66c7000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[0])).toEqual(true)
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
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, Blockchains[blockchain].wrapped.address]), amountOutBN.mul(2)],
            amount: middleAmountBN.mul(2)
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), middleAmountBN],
            amount: fetchedAmountInBN
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactOutput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenIn]), middleAmountBN.mul(2)],
            amount: fetchedAmountInBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect([
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb80d500b1d8e8ef31e21c99d1db9a6444d3adf1270000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb84200000000000000000000000000000000000006000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb882af49447d8a07e3bd95bd0d56f35241523fbab1000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
            '0xb858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000257ba85898081800000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8b31f66aa3c1e785363f0875a1b74e27b85fd66c7000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[0])).toEqual(true)
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
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, Blockchains[blockchain].wrapped.address]), amountInBN.mul(2)],
            amount: middleAmountBN.mul(2)
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenOut]), middleAmountBN],
            amount: fetchedAmountOutBN
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenOut]), middleAmountBN.mul(2)],
            amount: fetchedAmountOutBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect([
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb80d500b1d8e8ef31e21c99d1db9a6444d3adf1270000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb84200000000000000000000000000000000000006000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb882af49447d8a07e3bd95bd0d56f35241523fbab1000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
            '0xb858183f0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000000000000000042a0bed124a09ac2bd941b10349d8d224fe3c955eb000bb8b31f66aa3c1e785363f0875a1b74e27b85fd66c7000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[0])).toEqual(true)
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
            params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, Blockchains[blockchain].wrapped.address]), amountInBN.mul(2)],
            amount: middleAmountBN.mul(2)
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenOut]), middleAmountBN],
            amount: fetchedAmountOutBN
          })

          mockAmounts({ blockchain, exchange, provider, method: 'quoteExactInput',
            params: [ethers.utils.solidityPack(["address","uint24","address"],[Blockchains[blockchain].wrapped.address, fee, tokenOut]), middleAmountBN.mul(2)],
            amount: fetchedAmountOutBN.mul(2)
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

          const transaction = await route.getTransaction({ account: fromAddress })

          expect(transaction.blockchain).toEqual(blockchain)
          expect(transaction.from).toEqual(fromAddress)
          expect(transaction.to).toEqual(exchange[blockchain].router.address)
          expect(transaction.api).toEqual(exchange[blockchain].router.api)
          expect(transaction.method).toEqual('multicall')
          expect([
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb80d500b1d8e8ef31e21c99d1db9a6444d3adf1270000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb84200000000000000000000000000000000000006000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb882af49447d8a07e3bd95bd0d56f35241523fbab1000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
            '0x09b8134600000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000029020c00000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000421f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8b31f66aa3c1e785363f0875a1b74e27b85fd66c7000bb8a0bed124a09ac2bd941b10349d8d224fe3c955eb000000000000000000000000000000000000000000000000000000000000',
          ].includes(transaction.params.data[0])).toEqual(true)
          expect(transaction.value).toEqual('0')
        })
      })
    })
  })
})
