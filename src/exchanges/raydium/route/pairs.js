import Raydium from '../basics'
import { request } from '@depay/web3-client'

let getPairs = async(base, quote) => {
  try {
    let accounts = await request(`solana://${Raydium.pair.v4.address}/getProgramAccounts`, {
      params: { filters: [
        { dataSize: Raydium.pair.v4.api.span },
        { memcmp: { offset: 400, bytes: base }},
        { memcmp: { offset: 432, bytes: quote }}
      ]},
      api: Raydium.pair.v4.api,
      cache: 3600000,
    })
    return accounts
  } catch { return [] }
}

let getBestPair = async(base, quote) => {
  let accounts = await getPairs(base, quote)
  if(accounts.length == 1){ return accounts[0] }
  if(accounts.length < 1){ return null }
  let best = accounts.reduce((account, current) => {
    let currentReserve = current.data.lpReserve
    let accountReserve = account.data.lpReserve
    if(accountReserve.gte(currentReserve)) {
      return account
    } else {
      return current
    }
  })  
  return best
}

let anyPairs = async(base, quote) => {
  return (await getPairs(base, quote)).length > 0
}

export {
  anyPairs,
  getBestPair
}
