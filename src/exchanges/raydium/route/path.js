import basics from '../basics'
import { request } from '@depay/web3-client'
import { CONSTANTS } from '@depay/web3-constants'

const PAIR = basics.pair

let findPath = async ({ tokenIn, tokenOut }) => {
  const PAIR_VERSION = PAIR.v5

  let accounts = await request(`solana://${PAIR_VERSION.address}/getProgramAccounts`, {
    params: { filters: [{ dataSize: PAIR_VERSION.api.span }] }})

  let directPairs = []
  let via = []
  let viaPairs = []
  let viaTokens = [CONSTANTS.solana.WRAPPED, CONSTANTS.solana.USD]
  accounts.forEach((item)=>{
    const pair = PAIR_VERSION.api.decode(item.account.data)
    const baseMint = pair.baseMint.toString()
    const quoteMint = pair.quoteMint.toString()
    console.log('baseMint', baseMint)
    console.log('quoteMint', quoteMint)
    console.log('tokenIn', tokenIn)
    console.log('tokenOut', tokenOut)
    console.log('[baseMint, quoteMint].includes(tokenIn)', [baseMint, quoteMint].includes(tokenIn))
    console.log('viaTokens.some((token)=>[baseMint, quoteMint].includes(token))', viaTokens.some((token)=>[baseMint, quoteMint].includes(token)))
    if([baseMint, quoteMint].includes(tokenIn) && [baseMint, quoteMint].includes(tokenOut)) {
      directPairs.push(pair)
    } else if([baseMint, quoteMint].includes(tokenIn) && viaTokens.some((token)=>[baseMint, quoteMint].includes(token))) {
      viaPairs.push(pair)
    } else if([baseMint, quoteMint].includes(tokenOut) && viaTokens.some((token)=>[baseMint, quoteMint].includes(token))) {
      viaPairs.push(pair)
    }
  })

  console.log('directPairs', directPairs)
  console.log('viaPairs', viaPairs)
}

export {
  findPath
}
