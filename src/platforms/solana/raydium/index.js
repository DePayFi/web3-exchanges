import { findPath, pathExists } from './path'
import { getAmounts } from './amounts'
import { getTransaction } from './transaction'
import { AMM_LAYOUT, CPAMM_LAYOUT, CLMM_LAYOUT, MARKET_LAYOUT } from './layouts'

export default {
  findPath,
  pathExists,
  getAmounts,
  getTransaction,
  AMM_LAYOUT,
  CPAMM_LAYOUT,
  CLMM_LAYOUT,
  MARKET_LAYOUT,
}

// // AMM
// let accounts = await Web3Client.request(`solana://${Web3Exchanges.raydium.solana.router_amm.address}/getProgramAccounts`, {
//   params: { filters: [
//     { dataSize: Web3Exchanges.raydium.solana.router_amm.api.span },
//     { memcmp: { offset: 0, bytes: [6,0,0] }}, // filters for status 6
//     { memcmp: { offset: 400, bytes: "So11111111111111111111111111111111111111112" }},
//     { memcmp: { offset: 432, bytes: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" }},
//   ]},
//   api:  Web3Exchanges.raydium.solana.router_amm.api,
// })
// console.log(accounts)


// // CPAMM
// let accounts = await Web3Client.request(`solana://${Web3Exchanges.raydium.solana.router_cpamm.address}/getProgramAccounts`, {
//   params: { filters: [
//     { dataSize: Web3Exchanges.raydium.solana.router_cpamm.api.span },
//     { memcmp: { offset: 168, bytes: "So11111111111111111111111111111111111111112" }},
//     { memcmp: { offset: 200, bytes: "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv" }},
//   ]},
//   api:  Web3Exchanges.raydium.solana.router_cpamm.api,
// })
// console.log(accounts)


// // CLMM
// let accounts = await Web3Client.request(`solana://${Web3Exchanges.raydium.solana.router_clmm.address}/getProgramAccounts`, {
//   params: { filters: [
//     { dataSize: Web3Exchanges.raydium.solana.router_clmm.api.span },
//     { memcmp: { offset: 73, bytes: "So11111111111111111111111111111111111111112" }},
//     { memcmp: { offset: 105, bytes: "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv" }},
//   ]},
//   api:  Web3Exchanges.raydium.solana.router_clmm.api,
// })
// console.log(accounts)
