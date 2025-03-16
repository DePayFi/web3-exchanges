/*#if _EVM

/*#elif _SVM

import { request } from '@depay/web3-client-svm'

//#else */

import { request } from '@depay/web3-client'

//#endif

import { Buffer, PublicKey } from '@depay/solana-web3.js'
import { TICK_ARRAY_LAYOUT } from '../../orca/layouts'

const MAX_SWAP_TICK_ARRAYS = 3
const MAX_TICK_INDEX = 443636 // i32
const MIN_TICK_INDEX = -443636 // i32
const TICK_ARRAY_SIZE = 88 // i32

const getStartTickIndex = (tickIndex, tickSpacing, offset) => {
  const realIndex = Math.floor(tickIndex / tickSpacing / TICK_ARRAY_SIZE)
  const startTickIndex = (realIndex + offset) * tickSpacing * TICK_ARRAY_SIZE

  const ticksInArray = TICK_ARRAY_SIZE * tickSpacing;
  const minTickIndex = MIN_TICK_INDEX - ((MIN_TICK_INDEX % ticksInArray) + ticksInArray)
  if(startTickIndex < minTickIndex) { throw(`startTickIndex is too small - - ${startTickIndex}`) }
  if(startTickIndex > MAX_TICK_INDEX) { throw(`startTickIndex is too large - ${startTickIndex}`) }
  return startTickIndex
}

const getTickArrayAddresses = async({ aToB, pool, tickSpacing, tickCurrentIndex })=>{
  const shift = aToB ? 0 : tickSpacing
  let offset = 0
  let tickArrayAddresses = []
  for (let i = 0; i < MAX_SWAP_TICK_ARRAYS; i++) {
    let startIndex
    try {
      startIndex = getStartTickIndex(tickCurrentIndex + shift, tickSpacing, offset)
    } catch {
      return tickArrayAddresses
    }

    const pda = (
      await PublicKey.findProgramAddress([
          Buffer.from('tick_array'),
          new PublicKey(pool.toString()).toBuffer(),
          Buffer.from(startIndex.toString())
        ],
        new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')
      )
    )[0]
    tickArrayAddresses.push(pda)
    offset = aToB ? offset - 1 : offset + 1
  }

  return tickArrayAddresses
}

const getTickArrays = async ({ 
  pool, // stale whirlpool pubkey
  freshWhirlpoolData, // fresh whirlpool account data
  aToB, // direction
})=>{

  const tickArrayAddresses = await getTickArrayAddresses({ aToB, pool, tickSpacing: freshWhirlpoolData.tickSpacing, tickCurrentIndex: freshWhirlpoolData.tickCurrentIndex })

  return (
    await Promise.all(tickArrayAddresses.map(async(address, index) => {

      let data
      try {
        data = await request({ blockchain: 'solana' , address: address.toString(), api: TICK_ARRAY_LAYOUT, cache: 10 });
      } catch {}

      return { address, data }
    }))
  )
}

export {
  getTickArrayAddresses,
  getTickArrays,
  MAX_SWAP_TICK_ARRAYS,
  MAX_TICK_INDEX,
  MIN_TICK_INDEX,
  TICK_ARRAY_SIZE,      
}
