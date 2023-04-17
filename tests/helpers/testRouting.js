import { ethers } from 'ethers'
import { getWallets } from '@depay/web3-wallets'
import { mock, normalize, anything } from '@depay/web3-mock'
import { mockDecimals } from '../mocks/token'
import { struct, u64, u8 } from '@depay/solana-web3.js'
import { supported } from 'src/blockchains'

function expectRoute({
  blockchain,
  route,
  tokenIn,
  tokenOut,
  path,
  amountOutBN,
  amountInBN,
  amountOutMinBN,
  amountInMaxBN,
  fromAddress,
  exchange,
  transaction,
  routeTransaction
}) {
  if(tokenIn.match('0x')) { expect(route.tokenIn).toEqual(ethers.utils.getAddress(tokenIn)) }
  if(tokenOut.match('0x')) { expect(route.tokenOut).toEqual(ethers.utils.getAddress(tokenOut)) }
  if(path && path.length && path[0].match('0x')) {
    expect(route.path).toEqual(path.map((address)=>ethers.utils.getAddress(address)))
  }
  if(typeof amountOutBN !== 'undefined') { expect(route.amountOut).toEqual(amountOutBN.toString()) }
  if(typeof amountInBN !== 'undefined') { expect(route.amountIn).toEqual(amountInBN.toString()) }
  if(typeof amountOutMinBN !== 'undefined') { expect(route.amountOutMin).toEqual(amountOutMinBN.toString()) }
  if(typeof amountInMaxBN !== 'undefined') { expect(route.amountInMax).toEqual(amountInMaxBN.toString()) }
  expect(route.exchange).toEqual(exchange)

  expect(routeTransaction.blockchain).toEqual(blockchain)
  expect(routeTransaction.to).toEqual(transaction.to)
  expect(routeTransaction.api).toEqual(transaction.api)
  expect(routeTransaction.method).toEqual(transaction.method)
  expect(routeTransaction.value).toEqual(transaction.value?.toString())

  if(routeTransaction.instructions) {
    expect(routeTransaction.blockchain).toEqual(transaction.blockchain)
    routeTransaction.instructions.forEach((instruction, index)=>{
      if(transaction.instructions[index] && transaction.instructions[index].params && (transaction.instructions[index].params.amountIn || transaction.instructions[index].amountOut)) {
        expect(instruction.programId.toString()).toEqual(transaction.instructions[index].to)
        let LAYOUT = struct([u8("instruction"), u64("amountIn"), u64("amountOut")])
        let data = LAYOUT.decode(instruction.data)
        expect(data.instruction).toEqual(transaction.instructions[index].params.instruction)
        expect(data.amountIn.toString()).toEqual(transaction.instructions[index].params.amountIn)
        expect(data.amountOut.toString()).toEqual(transaction.instructions[index].params.amountOut)
        instruction.keys.forEach((key, keyIndex)=>{
          if(transaction.instructions[index].keys[keyIndex].pubkey != anything) {
            expect(key.pubkey.toString()).toEqual(transaction.instructions[index].keys[keyIndex].pubkey)
          }
          expect(key.isWritable).toEqual(transaction.instructions[index].keys[keyIndex].isWritable)
          expect(key.isSigner).toEqual(transaction.instructions[index].keys[keyIndex].isSigner)
        })
      }
    })
  } else {
    Object.keys(transaction.params).every((key)=>{
      expect(JSON.stringify(normalize(routeTransaction.params[key])))
        .toEqual(JSON.stringify(normalize(transaction.params[key])))
    })
  }
}

async function testRouting({
  provider,
  blockchain,
  exchange,
  tokenIn,
  decimalsIn,
  tokenOut,
  decimalsOut,
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  fromAddress,
  transaction
}) {
  let amountInBN = typeof amountIn === 'undefined' ? undefined : ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
  let amountInMaxBN = typeof amountInMax === 'undefined' ? undefined : ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
  let amountOutBN = typeof amountOut === 'undefined' ? undefined : ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
  let amountOutMinBN = typeof amountOutMin === 'undefined' ? undefined : ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)

  mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
  mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
  
  let route = await exchange.route({
    fromAddress,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    tokenIn,
    tokenOut
  })

  const routeTransaction = await route.getTransaction({ from: fromAddress })

  expectRoute({
    blockchain,
    route,
    tokenIn,
    tokenOut,
    path,
    amountInBN,
    amountInMaxBN,
    amountOutBN,
    amountOutMinBN,
    fromAddress,
    exchange,
    transaction,
    routeTransaction
  })

  let transactionMock = mock({ blockchain, provider, transaction })

  let wallet = (await getWallets())[0]
  await wallet.sendTransaction(routeTransaction)
  expect(transactionMock).toHaveBeenCalled()
}

export {
  testRouting
}
