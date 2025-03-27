import { bool, struct, u8, u16, i32, u64, i128, u128, publicKey, seq } from '@depay/solana-web3.js'

const WHIRLPOOL_REWARD_LAYOUT = struct([
  publicKey("mint"),
  publicKey("vault"),
  publicKey("authority"),
  u128("emissionsPerSecondX64"),
  u128("growthGlobalX64"),
])

const WHIRLPOOL_LAYOUT = struct([
  u64("anchorDiscriminator"),
  publicKey("whirlpoolsConfig"),
  seq(u8(), 1, "whirlpoolBump"),
  u16("tickSpacing"),
  seq(u8(), 2, "tickSpacingSeed"),
  u16("feeRate"),
  u16("protocolFeeRate"),
  u128("liquidity"),
  u128("sqrtPrice"),
  i32("tickCurrentIndex"),
  u64("protocolFeeOwedA"),
  u64("protocolFeeOwedB"),
  publicKey("tokenMintA"),
  publicKey("tokenVaultA"),
  u128("feeGrowthGlobalA"),
  publicKey("tokenMintB"),
  publicKey("tokenVaultB"),
  u128("feeGrowthGlobalB"),
  u64("rewardLastUpdatedTimestamp"),
  seq(WHIRLPOOL_REWARD_LAYOUT, 3, "rewardInfos"),
])

const TICK_LAYOUT = struct([
  bool("initialized"),
  i128("liquidityNet"),
  u128("liquidityGross"),
  u128("feeGrowthOutsideA"),
  u128("feeGrowthOutsideB"),
  seq(u128(), 3, "reward_growths_outside"),
])

const TICK_ARRAY_LAYOUT = struct([
  u64("anchorDiscriminator"),
  i32("startTickIndex"),
  seq(TICK_LAYOUT, 88, "ticks"),
  publicKey("whirlpool"),
])

export {
  TICK_ARRAY_LAYOUT,
  WHIRLPOOL_LAYOUT,
}

export default {
  TICK_ARRAY_LAYOUT,
  WHIRLPOOL_LAYOUT,
}
