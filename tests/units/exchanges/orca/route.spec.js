import Blockchains from '@depay/web3-blockchains'
import Route from 'src/classes/Route'
import { ethers } from 'ethers'
import Exchanges from 'src'
import { getTickArrays } from 'src/platforms/svm/orca/price/ticks'
import { mock, anything, resetMocks } from '@depay/web3-mock'
import { mockPool, mockPools, mockTransactionKeys, getMockedPool } from 'tests/mocks/solana/orca'
import { resetCache, getProvider } from '@depay/web3-client'
import { struct, u128, u64, u32, u8, publicKey, bool, BN, SystemProgram, PublicKey } from '@depay/solana-web3.js'
import { SWAP_INSTRUCTION, TWO_HOP_SWAP_INSTRUCTION, getSwapInstructionKeys, getTwoHopSwapInstructionKeys } from 'src/platforms/svm/orca/transaction'
import { testRouting } from 'tests/helpers/testRouting'
import Token from '@depay/web3-tokens'

describe('orca', () => {
  
  const blockchain = 'solana'
  const fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  const accounts = [fromAddress]
  const exchange = Exchanges.orca
  const decimalsIn = 6
  const decimalsOut = 6
  const aToB = false // current tick mocking only supports aToB false
  let provider
  let freshWhirlpoolData

  beforeEach(async ()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ provider, blockchain, accounts: { return: accounts } })
  })

  describe('basics', ()=>{

    it('does not try to find a route from and to the same token, as that doesnt make any sense', async ()=> {

      let route = await exchange.route({
        tokenIn: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        tokenOut: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        amountOut: 5
      })

      expect(route).toEqual(undefined)
    })

    it('returns undefined and does not fail or reject in case an error happens during the routing', async ()=> {

      let tokenIn = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
      let tokenOut = Blockchains[blockchain].wrapped.address
      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), Blockchains[blockchain].currency.decimals)
      let path = [tokenIn, tokenOut]

      let route = await exchange.route({
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        amountOut
      })

      expect(route).toEqual(undefined)
    })
  })

  describe('no route found', ()=>{

    it('resolves and returns no route', async()=>{

      const tokenIn = 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'
      const tokenAccountB = '9XW6nQe2k65YYdkhMk5JCe24aDC4y1wdpWm2VbKuKsY5'
      const tokenVaultB = '9RfZwn2Prux6QesG1Noo4HzMEBv3rPndJ2bN2Wwd6a7p'
      const tokenOut = 'HxhWkVpk5NS4Ltg5nij2G671CKXFRKPK8vy271Ub4uEK'
      const tokenAccountA = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
      const tokenVaultA = 'BVNo8ftg2LkkssnWT4ZWdtoFaevnfD6ExYeramwM27pe'
      const path = [tokenIn, tokenOut]
      const pool = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
      const amount = 1
      const amountBN = ethers.utils.parseUnits(amount.toString(), decimalsIn)
      const tokenAccountOut = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'

      await mockPool({
        provider,
        tokenA: tokenOut,
        tokenVaultA,
        tokenB: tokenIn,
        tokenVaultB,
        aToB,
        pool,
      })

      mock({
        blockchain,
        provider,
        request: {
          method: 'getProgramAccounts',
          to: exchange[blockchain].router.address,
          params: { filters: [
            { dataSize: exchange[blockchain].router.api.span },
            { memcmp: { offset: 101, bytes: tokenOut }},
            { memcmp: { offset: 181, bytes: tokenIn }},
          ]},
          return: []
        }
      })

      let route = await exchange.route({
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        amountOut: amount
      })

      expect(route).toEqual(undefined)
    })
  })

  describe('route token to token via 1 pool', ()=>{

    const tokenIn = 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'
    const tokenAccountB = '9XW6nQe2k65YYdkhMk5JCe24aDC4y1wdpWm2VbKuKsY5'
    const tokenVaultB = '9RfZwn2Prux6QesG1Noo4HzMEBv3rPndJ2bN2Wwd6a7p'
    const tokenOut = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    const tokenAccountA = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
    const tokenVaultA = 'BVNo8ftg2LkkssnWT4ZWdtoFaevnfD6ExYeramwM27pe'
    const path = [tokenIn, tokenOut]
    const pool = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
    const amount = 1
    const amountBN = ethers.utils.parseUnits(amount.toString(), decimalsIn)
    const tokenAccountOut = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
    let tickArrays

    beforeEach(async()=>{
      
      await mockPool({
        provider,
        tokenA: tokenOut,
        tokenVaultA,
        tokenB: tokenIn,
        tokenVaultB,
        aToB,
        pool,
      })

      freshWhirlpoolData = await getMockedPool(pool)
      tickArrays = await getTickArrays({ pool, freshWhirlpoolData, aToB })

      mock({ blockchain, provider, request: { method: 'getAccountInfo', to: tokenAccountOut, api: Token.solana.TOKEN_LAYOUT, return: { mint: tokenOut, owner: fromAddress, amount: '2511210038936013080', delegateOption: 70962703, delegate: 'BSFGxQ38xesdoUd3qsvNhjRu2FLPq9CwCBiGE42fc9hR', state: 0, isNativeOption: 0, isNative: '0', delegatedAmount: '0', closeAuthorityOption: 0, closeAuthority: '11111111111111111111111111111111' }}})
    })

    it('for given amountOut', async ()=> {

      await testRouting({
        provider,
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOut: amount,
        fromAddress,
        transaction: {
          blockchain,
          instructions: [
            { // SWAP
              to: exchange[blockchain].router.address,
              api: struct([u64("anchorDiscriminator"), u64("amount"), u64("otherAmountThreshold"), u128("sqrtPriceLimit"), bool("amountSpecifiedIsInput"), bool("aToB")]),
              params: {
                anchorDiscriminator: SWAP_INSTRUCTION.toString(),
                amount: amountBN.toString(),
                amountSpecifiedIsInput: false,
                otherAmountThreshold: '25175',
                sqrtPriceLimit: '79226673515401279992447579055',
                aToB,
              },
              keys: await getSwapInstructionKeys({ account: fromAddress, pool, tokenAccountA, tokenVaultA , tokenAccountB, tokenVaultB, tickArrays })
            }
          ]
        }
      })
    })
    
    it('for given amountOutMin', async ()=> {

      await testRouting({
        provider,
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOutMin: amount,
        fromAddress,
        transaction: {
          blockchain,
          instructions: [
            { // SWAP
              to: exchange[blockchain].router.address,
              api: struct([u64("anchorDiscriminator"), u64("amount"), u64("otherAmountThreshold"), u128("sqrtPriceLimit"), bool("amountSpecifiedIsInput"), bool("aToB")]),
              params: {
                anchorDiscriminator: SWAP_INSTRUCTION.toString(),
                amount: '25175',
                amountSpecifiedIsInput: true,
                otherAmountThreshold: amountBN.toString(),
                sqrtPriceLimit: '79226673515401279992447579055',
                aToB,
              },
              keys: await getSwapInstructionKeys({ account: fromAddress, pool, tokenAccountA, tokenVaultA , tokenAccountB, tokenVaultB, tickArrays })
            }
          ]
        }
      })
    })

    it('for given amountIn', async ()=> {

      await testRouting({
        provider,
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountIn: amount,
        fromAddress,
        transaction: {
          blockchain,
          instructions: [
            { // SWAP
              to: exchange[blockchain].router.address,
              api: struct([u64("anchorDiscriminator"), u64("amount"), u64("otherAmountThreshold"), u128("sqrtPriceLimit"), bool("amountSpecifiedIsInput"), bool("aToB")]),
              params: {
                anchorDiscriminator: SWAP_INSTRUCTION.toString(),
                amount: amountBN.toString(),
                amountSpecifiedIsInput: true,
                otherAmountThreshold: '39721938',
                sqrtPriceLimit: '79226673515401279992447579055',
                aToB,
              },
              keys: await getSwapInstructionKeys({ account: fromAddress, pool, tokenAccountA, tokenVaultA , tokenAccountB, tokenVaultB, tickArrays })
            }
          ]
        }
      })
    })

    it('for given amountInMax', async ()=> {

      await testRouting({
        provider,
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountInMax: amount,
        fromAddress,
        transaction: {
          blockchain,
          instructions: [
            { // SWAP
              to: exchange[blockchain].router.address,
              api: struct([u64("anchorDiscriminator"), u64("amount"), u64("otherAmountThreshold"), u128("sqrtPriceLimit"), bool("amountSpecifiedIsInput"), bool("aToB")]),
              params: {
                anchorDiscriminator: SWAP_INSTRUCTION.toString(),
                amount: '39721938',
                amountSpecifiedIsInput: false,
                otherAmountThreshold: amountBN.toString(),
                sqrtPriceLimit: '79226673515401279992447579055',
                aToB,
              },
              keys: await getSwapInstructionKeys({ account: fromAddress, pool, tokenAccountA, tokenVaultA , tokenAccountB, tokenVaultB, tickArrays })
            }
          ]
        }
      })
    })

    describe('without existing tokenOut account', ()=>{

      beforeEach(async()=>{
        mock({ blockchain, provider, request: { method: 'getAccountInfo', to: tokenAccountOut, api: Token.solana.TOKEN_LAYOUT, return: null }})
      })

      it('routes and creates tokenOut account', async ()=> {

        await testRouting({
          provider,
          blockchain,
          exchange,
          tokenIn,
          decimalsIn,
          tokenOut,
          decimalsOut,
          path,
          amountOut: amount,
          fromAddress,
          transaction: {
            blockchain,
            instructions: [
              { // CREATE TOKEN OUT ACCOUNT
                to: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                api: struct([]),
                keys: [
                  { pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true },
                  { pubkey: new PublicKey(tokenAccountOut), isSigner: false, isWritable: true },
                  { pubkey: new PublicKey(fromAddress), isSigner: false, isWritable: false },
                  { pubkey: new PublicKey(tokenOut), isSigner: false, isWritable: false },
                  { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                  { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
                ]
              },
              { // SWAP
                to: exchange[blockchain].router.address,
                api: struct([u64("anchorDiscriminator"), u64("amount"), u64("otherAmountThreshold"), u128("sqrtPriceLimit"), bool("amountSpecifiedIsInput"), bool("aToB")]),
                params: {
                  anchorDiscriminator: SWAP_INSTRUCTION.toString(),
                  amount: amountBN.toString(),
                  amountSpecifiedIsInput: false,
                  otherAmountThreshold: '25175',
                  sqrtPriceLimit: '79226673515401279992447579055',
                  aToB,
                },
                keys: await getSwapInstructionKeys({ account: fromAddress, pool, tokenAccountA, tokenVaultA , tokenAccountB, tokenVaultB, tickArrays })
              }
            ]
          }
        })
      })
    })
  })

  // describe('route NATIVE to token', ()=>{

  //   const tokenIn = '11111111111111111111111111111111'
  //   const tokenAccountA = 'FeRWtXU91EFnT5PGFfHcD5hBXRXsgBw8YutdjgwboRrK'
  //   const tokenVaultA = 'BVNo8ftg2LkkssnWT4ZWdtoFaevnfD6ExYeramwM27pe'
  //   const tokenOut = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  //   const tokenAccountB = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
  //   const tokenVaultB = '9RfZwn2Prux6QesG1Noo4HzMEBv3rPndJ2bN2Wwd6a7p'
  //   const path = [tokenIn, tokenOut]
  //   const pool = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
  //   const amount = 1
  //   const amountBN = ethers.utils.parseUnits(amount.toString(), decimalsIn)
  //   const tokenAccountOut = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
  //   let tickArrays

  //   beforeEach(async()=>{
      
  //     await mockPool({
  //       provider,
  //       tokenA: 'So11111111111111111111111111111111111111112',
  //       tokenVaultA,
  //       tokenB: tokenOut,
  //       tokenVaultB,
  //       aToB,
  //       pool,
  //     })

  //     freshWhirlpoolData = await getMockedPool(pool)
  //     tickArrays = await getTickArrays({ pool, freshWhirlpoolData, aToB })

  //     mock({ blockchain, provider, request: { method: 'getAccountInfo', to: tokenAccountOut, api: Token.solana.TOKEN_LAYOUT, return: { mint: tokenOut, owner: fromAddress, amount: '2511210038936013080', delegateOption: 70962703, delegate: 'BSFGxQ38xesdoUd3qsvNhjRu2FLPq9CwCBiGE42fc9hR', state: 0, isNativeOption: 0, isNative: '0', delegatedAmount: '0', closeAuthorityOption: 0, closeAuthority: '11111111111111111111111111111111' }}})
  //     mock({ blockchain, provider, request: { method: 'getMinimumBalanceForRentExemption', return: 320 } })
  //   })
    
  //   it('WRAPS SOL <> WSOL and creates WSOL temp throw away account to route NATIVE to token', async ()=> {

  //     let keys = await getSwapInstructionKeys({ account: fromAddress, pool, tokenAccountA, tokenVaultA , tokenAccountB, tokenVaultB, tickArrays })
  //     keys[5] = anything // tokenAccountB
      
  //     await testRouting({
  //       provider,
  //       blockchain,
  //       exchange,
  //       tokenIn,
  //       decimalsIn,
  //       tokenOut,
  //       decimalsOut,
  //       path,
  //       amountOut: amount,
  //       fromAddress,
  //       transaction: {
  //         blockchain,
  //         instructions: [
  //           { // CREATE WSOL ACCOUNT
  //             to: '11111111111111111111111111111111',
  //             api: struct([u32('instruction'), u64('lamports'), u64('space'), publicKey('owner')]),
  //             params: {
  //               instruction: 0,
  //               lamports: '25495',
  //               space: Token.solana.TOKEN_LAYOUT.span,
  //               owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  //             },
  //             keys: [
  //               { pubkey: new PublicKey(fromAddress) },
  //               anything,
  //             ]
  //           },
  //           { // INITIALIZE WSOL TOKEN ACCOUNT
  //             to: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  //             api: struct([u8('instruction'), u8('option'), publicKey('mintAuthority')]),
  //             params: {
  //               instruction: 18,
  //               option: 21,
  //               mintAuthority: '14hdjb3hkqjncyp3j1yar2vmee7mwhyg4kjl27mj7mkm',
  //             }
  //           },
  //           { // SWAP
  //             to: exchange[blockchain].router.address,
  //             api: struct([u64("anchorDiscriminator"), u64("amount"), u64("otherAmountThreshold"), u128("sqrtPriceLimit"), bool("amountSpecifiedIsInput"), bool("aToB")]),
  //             params: {
  //               anchorDiscriminator: SWAP_INSTRUCTION.toString(),
  //               amount: amountBN.toString(),
  //               amountSpecifiedIsInput: false,
  //               otherAmountThreshold: '25175',
  //               sqrtPriceLimit: '79226673515401279992447579055',
  //               aToB,
  //             },
  //             keys
  //           },
  //           { // CLOSE WSOL TOKEN ACCOUNT (unwrap)
  //             to: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  //             api: struct([u8('instruction')]),
  //             params: {
  //               instruction: 9
  //             }
  //           }
  //         ]
  //       }
  //     })
  //   })
  // })

  describe('route token to NATIVE', ()=>{

    const tokenIn = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    const tokenAccountA = '3RChDYvf21oJej9pZQcg9A3K42FmCmDFLQM4QqeMg5eF'
    const tokenVaultA = '9RfZwn2Prux6QesG1Noo4HzMEBv3rPndJ2bN2Wwd6a7p'
    const tokenOut = '11111111111111111111111111111111'
    const tokenAccountB = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
    const tokenVaultB = 'BVNo8ftg2LkkssnWT4ZWdtoFaevnfD6ExYeramwM27pe'
    const path = [tokenIn, tokenOut]
    const pool = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
    const amount = 1
    const amountBN = ethers.utils.parseUnits(amount.toString(), decimalsIn)
    const tokenAccountOut = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
    let tickArrays

    beforeEach(async()=>{

      await mockPool({
        provider,
        tokenA: 'So11111111111111111111111111111111111111112',
        tokenVaultA,
        tokenB: tokenIn,
        tokenVaultB,
        aToB,
        pool,
      })

      freshWhirlpoolData = await getMockedPool(pool)
      tickArrays = await getTickArrays({ pool, freshWhirlpoolData, aToB })

      mock({ blockchain, provider, request: { method: 'getAccountInfo', to: tokenAccountOut, api: Token.solana.TOKEN_LAYOUT, return: { mint: 'So11111111111111111111111111111111111111112', owner: fromAddress, amount: '2511210038936013080', delegateOption: 70962703, delegate: 'BSFGxQ38xesdoUd3qsvNhjRu2FLPq9CwCBiGE42fc9hR', state: 0, isNativeOption: 0, isNative: '0', delegatedAmount: '0', closeAuthorityOption: 0, closeAuthority: '11111111111111111111111111111111' }}})
      mock({ blockchain, provider, request: { method: 'getMinimumBalanceForRentExemption', return: 320 } })
    })
    
    it('unwraps WSOL after routing', async ()=> {

      let keys = await getSwapInstructionKeys({ account: fromAddress, pool, tokenAccountA, tokenVaultA , tokenAccountB, tokenVaultB, tickArrays })
      keys[3] = anything // tokenAccountA

      await testRouting({
        provider,
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut: 9,
        path,
        amountOut: amount,
        fromAddress,
        transaction: {
          blockchain,
          instructions: [
            { // CREATE WSOL ACCOUNT
              to: '11111111111111111111111111111111',
              api: struct([u32('instruction'), u64('lamports'), u64('space'), publicKey('owner')]),
              params: {
                instruction: 0,
                lamports: '320',
                space: Token.solana.TOKEN_LAYOUT.span,
                owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
              },
              keys: [
                { pubkey: new PublicKey(fromAddress) },
                anything,
              ]
            },
            { // INITIALIZE WSOL TOKEN ACCOUNT
              to: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
              api: struct([u8('instruction'), u8('option'), publicKey('mintAuthority')]),
              params: {
                instruction: 18,
                option: 21,
                mintAuthority: '14hdjb3hkqjncyp3j1yar2vmee7mwhyg4kjl27mj7mkm',
              }
            },
            { // SWAP
              to: exchange[blockchain].router.address,
              api: struct([u64("anchorDiscriminator"), u64("amount"), u64("otherAmountThreshold"), u128("sqrtPriceLimit"), bool("amountSpecifiedIsInput"), bool("aToB")]),
              params: {
                anchorDiscriminator: SWAP_INSTRUCTION.toString(),
                amount: ethers.utils.parseUnits(amount.toString(), 9).toString(),
                amountSpecifiedIsInput: false,
                otherAmountThreshold: '25174404',
                sqrtPriceLimit: '79226673515401279992447579055',
                aToB,
              },
              keys
            },
            { // CLOSE WSOL TOKEN ACCOUNT (unwrap)
              to: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
              api: struct([u8('instruction')]),
              params: {
                instruction: 9
              }
            }
          ]
        }
      })
    })
  })

  describe('route token to token via 2 pools', ()=>{
      
    const tokenIn = 'HxhWkVpk5NS4Ltg5nij2G671CKXFRKPK8vy271Ub4uEK'
    const tokenAccountOneA = "F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9"
    const tokenAccountOneB = "7b8dJB8rVcJeSiuoU8vFTvMXRpQfpVVvFeEcVmBpARwA"
    const tokenAccountTwoA = "3VCor9E7BmH83jds6Nvwu2FNcjEZqgcocqAiyiB9dEG4"
    const tokenAccountTwoB = "F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9"
    const tokenVaultOneA = "B7zr34ZBzViYUj9TH4JhxrmhM7cRcKvRDzywDPnfvZ5g"
    const tokenVaultTwoA = "446TEqLqaxm66kCDDwaah2cZQDXa99jAWVXobAYPdFVh"
    const tokenMiddle = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    const tokenAccountMiddle = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
    const tokenOut = '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM'
    const tokenAccountOut = '3VCor9E7BmH83jds6Nvwu2FNcjEZqgcocqAiyiB9dEG4'
    const tokenAccountB = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
    const tokenVaultOneB = "531qdY5CSNjRqBd6oqDEqDuAxi6mEXMpaVhB3byLFw2P"
    const tokenVaultTwoB = "HbvV7HQbX8PwydvVhxbrqD74QZEurnzY18QzieWi7hUf"
    const path = [tokenIn, tokenOut]
    const poolOne = "AFCKH5AnW2inQdV3RgcLyk9PgLUhbN6Xy64pceJSwrfs"
    const poolTwo = "CZqbzVsVQQtBy1X15gHxipWFnC3Hkar62LJ49XuSK7ec"
    const amount = 1
    const amountBN = ethers.utils.parseUnits(amount.toString(), decimalsIn)
    let freshWhirlpoolDataOne, freshWhirlpoolDataTwo
    let tickArraysOne, tickArraysTwo

    beforeEach(async()=>{
      
      await mockPools({
        provider,
        poolOne,
        poolTwo,
        tokenA: tokenOut,
        tokenMiddle,
        tokenB: tokenIn,
        tokenVaultOneA,
        tokenVaultOneB,
        tokenVaultTwoA,
        tokenVaultTwoB,
        aToBOne: aToB,
        aToBTwo: aToB,
      })

      freshWhirlpoolDataOne = await getMockedPool(poolOne)
      freshWhirlpoolDataTwo = await getMockedPool(poolTwo)

      tickArraysOne = await getTickArrays({ pool: poolOne, freshWhirlpoolData: freshWhirlpoolDataOne, aToB })
      tickArraysTwo = await getTickArrays({ pool: poolTwo, freshWhirlpoolData: freshWhirlpoolDataTwo, aToB })

      mock({ blockchain, provider, request: { method: 'getAccountInfo', to: tokenAccountMiddle, api: Token.solana.TOKEN_LAYOUT, return: { mint: tokenMiddle, owner: fromAddress, amount: '2511210038936013080', delegateOption: 70962703, delegate: 'BSFGxQ38xesdoUd3qsvNhjRu2FLPq9CwCBiGE42fc9hR', state: 0, isNativeOption: 0, isNative: '0', delegatedAmount: '0', closeAuthorityOption: 0, closeAuthority: '11111111111111111111111111111111' }}})
      mock({ blockchain, provider, request: { method: 'getAccountInfo', to: tokenAccountOut, api: Token.solana.TOKEN_LAYOUT, return: { mint: tokenOut, owner: fromAddress, amount: '2511210038936013080', delegateOption: 70962703, delegate: 'BSFGxQ38xesdoUd3qsvNhjRu2FLPq9CwCBiGE42fc9hR', state: 0, isNativeOption: 0, isNative: '0', delegatedAmount: '0', closeAuthorityOption: 0, closeAuthority: '11111111111111111111111111111111' }}})
    })

    it('for given amountOut', async ()=> {

      await testRouting({
        provider,
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOut: amount,
        fromAddress,
        transaction: {
          blockchain,
          instructions: [
            { // SWAP
              to: exchange[blockchain].router.address,
              api: struct([
                u64("anchorDiscriminator"),
                u64("amount"),
                u64("otherAmountThreshold"),
                bool("amountSpecifiedIsInput"),
                bool("aToBOne"),
                bool("aToBTwo"),
                u128("sqrtPriceLimitOne"),
                u128("sqrtPriceLimitTwo")
              ]),
              params: {
                anchorDiscriminator: TWO_HOP_SWAP_INSTRUCTION.toString(),
                amount: amountBN.toString() ,
                otherAmountThreshold: '632',
                amountSpecifiedIsInput: false,
                aToBOne: false,
                aToBTwo: false,
                sqrtPriceLimitOne: '79226673515401279992447579055',
                sqrtPriceLimitTwo: '79226673515401279992447579055',
              },
              keys: await getTwoHopSwapInstructionKeys({ account: fromAddress, poolOne, tickArraysOne, tokenAccountOneA, tokenVaultOneA , tokenAccountOneB, tokenVaultOneB, poolTwo, tickArraysTwo, tokenAccountTwoA, tokenVaultTwoA, tokenAccountTwoB, tokenVaultTwoB })
            }
          ]
        }
      })
    })
    
    it('for given amountOutMin', async ()=> {

      await testRouting({
        provider,
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOutMin: amount,
        fromAddress,
        transaction: {
          blockchain,
          instructions: [
            { // SWAP
              to: exchange[blockchain].router.address,
              api: struct([
                u64("anchorDiscriminator"),
                u64("amount"),
                u64("otherAmountThreshold"),
                bool("amountSpecifiedIsInput"),
                bool("aToBOne"),
                bool("aToBTwo"),
                u128("sqrtPriceLimitOne"),
                u128("sqrtPriceLimitTwo")
              ]),
              params: {
                anchorDiscriminator: TWO_HOP_SWAP_INSTRUCTION.toString(),
                amount: '632',
                otherAmountThreshold: amountBN.toString(),
                amountSpecifiedIsInput: true,
                aToBOne: false,
                aToBTwo: false,
                sqrtPriceLimitOne: '79226673515401279992447579055',
                sqrtPriceLimitTwo: '79226673515401279992447579055',
              },
              keys: await getTwoHopSwapInstructionKeys({ account: fromAddress, poolOne, tickArraysOne, tokenAccountOneA, tokenVaultOneA , tokenAccountOneB, tokenVaultOneB, poolTwo, tickArraysTwo, tokenAccountTwoA, tokenVaultTwoA, tokenAccountTwoB, tokenVaultTwoB })
            }
          ]
        }
      })
    })

    it('for given amountIn', async ()=> {

      await testRouting({
        provider,
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountIn: amount,
        fromAddress,
        transaction: {
          blockchain,
          instructions: [
            { // SWAP
              to: exchange[blockchain].router.address,
              api: struct([
                u64("anchorDiscriminator"),
                u64("amount"),
                u64("otherAmountThreshold"),
                bool("amountSpecifiedIsInput"),
                bool("aToBOne"),
                bool("aToBTwo"),
                u128("sqrtPriceLimitOne"),
                u128("sqrtPriceLimitTwo")
              ]),
              params: {
                anchorDiscriminator: TWO_HOP_SWAP_INSTRUCTION.toString(),
                amount: amountBN.toString(),
                otherAmountThreshold: '1585758273',
                amountSpecifiedIsInput: true,
                aToBOne: false,
                aToBTwo: false,
                sqrtPriceLimitOne: '79226673515401279992447579055',
                sqrtPriceLimitTwo: '79226673515401279992447579055',
              },
              keys: await getTwoHopSwapInstructionKeys({ account: fromAddress, poolOne, tickArraysOne, tokenAccountOneA, tokenVaultOneA , tokenAccountOneB, tokenVaultOneB, poolTwo, tickArraysTwo, tokenAccountTwoA, tokenVaultTwoA, tokenAccountTwoB, tokenVaultTwoB })
            }
          ]
        }
      })
    })

    it('for given amountInMax', async ()=> {

      await testRouting({
        provider,
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountInMax: amount,
        fromAddress,
        transaction: {
          blockchain,
          instructions: [
            { // SWAP
              to: exchange[blockchain].router.address,
              api: struct([
                u64("anchorDiscriminator"),
                u64("amount"),
                u64("otherAmountThreshold"),
                bool("amountSpecifiedIsInput"),
                bool("aToBOne"),
                bool("aToBTwo"),
                u128("sqrtPriceLimitOne"),
                u128("sqrtPriceLimitTwo")
              ]),
              params: {
                anchorDiscriminator: TWO_HOP_SWAP_INSTRUCTION.toString(),
                amount: '1585758273',
                otherAmountThreshold: amountBN.toString(),
                amountSpecifiedIsInput: false,
                aToBOne: false,
                aToBTwo: false,
                sqrtPriceLimitOne: '79226673515401279992447579055',
                sqrtPriceLimitTwo: '79226673515401279992447579055',
              },
              keys: await getTwoHopSwapInstructionKeys({ account: fromAddress, poolOne, tickArraysOne, tokenAccountOneA, tokenVaultOneA , tokenAccountOneB, tokenVaultOneB, poolTwo, tickArraysTwo, tokenAccountTwoA, tokenVaultTwoA, tokenAccountTwoB, tokenVaultTwoB })
            }
          ]
        }
      })
    })

    describe('without existing tokenOut account', ()=>{

      beforeEach(async()=>{
        mock({ blockchain, provider, request: { method: 'getAccountInfo', to: tokenAccountOut, api: Token.solana.TOKEN_LAYOUT, return: null }})
      })

      it('routes and creates tokenOut account', async ()=> {

        await testRouting({
          provider,
          blockchain,
          exchange,
          tokenIn,
          decimalsIn,
          tokenOut,
          decimalsOut,
          path,
          amountInMax: amount,
          fromAddress,
          transaction: {
            blockchain,
            instructions: [
              { // CREATE TOKEN OUT ACCOUNT
                to: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                api: struct([]),
                keys: [
                  { pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true },
                  { pubkey: new PublicKey(tokenAccountOut), isSigner: false, isWritable: true },
                  { pubkey: new PublicKey(fromAddress), isSigner: false, isWritable: false },
                  { pubkey: new PublicKey(tokenOut), isSigner: false, isWritable: false },
                  { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                  { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
                ]
              },
              { // SWAP
                to: exchange[blockchain].router.address,
                api: struct([
                  u64("anchorDiscriminator"),
                  u64("amount"),
                  u64("otherAmountThreshold"),
                  bool("amountSpecifiedIsInput"),
                  bool("aToBOne"),
                  bool("aToBTwo"),
                  u128("sqrtPriceLimitOne"),
                  u128("sqrtPriceLimitTwo")
                ]),
                params: {
                  anchorDiscriminator: TWO_HOP_SWAP_INSTRUCTION.toString(),
                  amount: '1585758273',
                  otherAmountThreshold: amountBN.toString(),
                  amountSpecifiedIsInput: false,
                  aToBOne: false,
                  aToBTwo: false,
                  sqrtPriceLimitOne: '79226673515401279992447579055',
                  sqrtPriceLimitTwo: '79226673515401279992447579055',
                },
                keys: await getTwoHopSwapInstructionKeys({ account: fromAddress, poolOne, tickArraysOne, tokenAccountOneA, tokenVaultOneA , tokenAccountOneB, tokenVaultOneB, poolTwo, tickArraysTwo, tokenAccountTwoA, tokenVaultTwoA, tokenAccountTwoB, tokenVaultTwoB })
              }
            ]
          }
        })
      })
    })
  })
})
