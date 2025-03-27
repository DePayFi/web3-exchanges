import { blob, bool, struct, u8, u16, i32, u32, u64, i128, u128, publicKey, seq } from '@depay/solana-web3.js'

// CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C
const CPMM_LAYOUT = struct([
  blob(8),
  publicKey("configId"),
  publicKey("poolCreator"),
  publicKey("vaultA"),
  publicKey("vaultB"),
  publicKey("mintLp"),
  publicKey("mintA"),
  publicKey("mintB"),
  publicKey("mintProgramA"),
  publicKey("mintProgramB"),
  publicKey("observationId"),
  u8("bump"),
  u8("status"),
  u8("lpDecimals"),
  u8("mintDecimalA"),
  u8("mintDecimalB"),
  u64("lpAmount"),
  u64("protocolFeesMintA"),
  u64("protocolFeesMintB"),
  u64("fundFeesMintA"),
  u64("fundFeesMintB"),
  u64("openTime"),
  seq(u64(), 32),
])

const CPMM_CONFIG_LAYOUT = struct([
  blob(8),
  u8("bump"),
  bool("disableCreatePool"),
  u16("index"),
  u64("tradeFeeRate"),
  u64("protocolFeeRate"),
  u64("fundFeeRate"),
  u64("createPoolFee"),

  publicKey("protocolOwner"),
  publicKey("fundOwner"),
  seq(u64(), 16),
])

// CLMM 
const RewardInfo = struct([
  u8("rewardState"),
  u64("openTime"),
  u64("endTime"),
  u64("lastUpdateTime"),
  u128("emissionsPerSecondX64"),
  u64("rewardTotalEmissioned"),
  u64("rewardClaimed"),
  publicKey("tokenMint"),
  publicKey("tokenVault"),
  publicKey("creator"),
  u128("rewardGrowthGlobalX64"),
]);

const CLMM_LAYOUT = struct([
  blob(8),
  u8("bump"),
  publicKey("ammConfig"),
  publicKey("creator"),
  publicKey("mintA"),
  publicKey("mintB"),
  publicKey("vaultA"),
  publicKey("vaultB"),
  publicKey("observationId"),
  u8("mintDecimalsA"),
  u8("mintDecimalsB"),
  u16("tickSpacing"),
  u128("liquidity"),
  u128("sqrtPriceX64"),
  i32("tickCurrent"),
  u32(),
  u128("feeGrowthGlobalX64A"),
  u128("feeGrowthGlobalX64B"),
  u64("protocolFeesTokenA"),
  u64("protocolFeesTokenB"),
  u128("swapInAmountTokenA"),
  u128("swapOutAmountTokenB"),
  u128("swapInAmountTokenB"),
  u128("swapOutAmountTokenA"),
  u8("status"),
  seq(u8(), 7, ""),
  seq(RewardInfo, 3, "rewardInfos"),
  seq(u64(), 16, "tickArrayBitmap"),
  u64("totalFeesTokenA"),
  u64("totalFeesClaimedTokenA"),
  u64("totalFeesTokenB"),
  u64("totalFeesClaimedTokenB"),
  u64("fundFeesTokenA"),
  u64("fundFeesTokenB"),
  u64("startTime"),
  seq(u64(), 15 * 4 - 3, "padding"),
]);

const CLMM_CONFIG_LAYOUT = struct([
  blob(8),
  u8("bump"),
  u16("index"),
  publicKey(""),
  u32("protocolFeeRate"),
  u32("tradeFeeRate"),
  u16("tickSpacing"),
  seq(u64(), 8, ""),
]);

export const TICK_ARRAY_SIZE = 60;

const TickLayout = struct([
  i32("tick"),
  i128("liquidityNet"),
  u128("liquidityGross"),
  u128("feeGrowthOutsideX64A"),
  u128("feeGrowthOutsideX64B"),
  seq(u128(), 3, "rewardGrowthsOutsideX64"),
  seq(u32(), 13, ""),
]);

const TICK_ARRAY_LAYOUT = struct([
  blob(8),
  publicKey("poolId"),
  i32("startTickIndex"),
  seq(TickLayout, TICK_ARRAY_SIZE, "ticks"),
  u8("initializedTickCount"),
  seq(u8(), 115, ""),
]);

const EXTENSION_TICKARRAY_BITMAP_SIZE = 14;

const TICK_ARRAY_BITMAP_EXTENSION_LAYOUT = struct([
  blob(8),
  publicKey("poolId"),
  seq(seq(u64(), 8), EXTENSION_TICKARRAY_BITMAP_SIZE, "positiveTickArrayBitmap"),
  seq(seq(u64(), 8), EXTENSION_TICKARRAY_BITMAP_SIZE, "negativeTickArrayBitmap"),
]);

export {
  CPMM_LAYOUT,
  CPMM_CONFIG_LAYOUT,
  CLMM_LAYOUT,
  CLMM_CONFIG_LAYOUT,
  TICK_ARRAY_LAYOUT,
  TICK_ARRAY_BITMAP_EXTENSION_LAYOUT,
}

export default {
  CPMM_LAYOUT,
  CPMM_CONFIG_LAYOUT,
  CLMM_LAYOUT,
  CLMM_CONFIG_LAYOUT,
  TICK_ARRAY_LAYOUT,
  TICK_ARRAY_BITMAP_EXTENSION_LAYOUT,
}
