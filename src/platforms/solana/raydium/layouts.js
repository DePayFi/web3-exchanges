import { blob, bool, struct, u8, u16, i32, u32, u64, i128, u128, publicKey, seq } from '@depay/solana-web3.js'

// OpenBook Market
const MARKET_LAYOUT = struct([
  blob(5),
  blob(8), // accountFlagsLayout('accountFlags'),
  publicKey('ownAddress'),
  u64('vaultSignerNonce'),
  publicKey('baseMint'),
  publicKey('quoteMint'),
  publicKey('baseVault'),
  u64('baseDepositsTotal'),
  u64('baseFeesAccrued'),
  publicKey('quoteVault'),
  u64('quoteDepositsTotal'),
  u64('quoteFeesAccrued'),
  u64('quoteDustThreshold'),
  publicKey('requestQueue'),
  publicKey('eventQueue'),
  publicKey('bids'),
  publicKey('asks'),
  u64('baseLotSize'),
  u64('quoteLotSize'),
  u64('feeRateBps'),
  u64('referrerRebatesAccrued'),
  blob(7),
])

// AMM 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8
const AMM_LAYOUT = struct([
  u64('status'),
  u64('nonce'),
  u64('maxOrder'),
  u64('depth'),
  u64('baseDecimal'),
  u64('quoteDecimal'),
  u64('state'),
  u64('resetFlag'),
  u64('minSize'),
  u64('volMaxCutRatio'),
  u64('amountWaveRatio'),
  u64('baseLotSize'),
  u64('quoteLotSize'),
  u64('minPriceMultiplier'),
  u64('maxPriceMultiplier'),
  u64('systemDecimalValue'),
  u64('minSeparateNumerator'),
  u64('minSeparateDenominator'),
  u64('tradeFeeNumerator'),
  u64('tradeFeeDenominator'),
  u64('pnlNumerator'),
  u64('pnlDenominator'),
  u64('swapFeeNumerator'),
  u64('swapFeeDenominator'),
  u64('baseNeedTakePnl'),
  u64('quoteNeedTakePnl'),
  u64('quoteTotalPnl'),
  u64('baseTotalPnl'),
  u64('poolOpenTime'),
  u64('punishPcAmount'),
  u64('punishCoinAmount'),
  u64('orderbookToInitTime'),
  u128('swapBaseInAmount'),
  u128('swapQuoteOutAmount'),
  u64('swapBase2QuoteFee'),
  u128('swapQuoteInAmount'),
  u128('swapBaseOutAmount'),
  u64('swapQuote2BaseFee'),
  // amm vault
  publicKey('baseVault'),
  publicKey('quoteVault'),
  // mint
  publicKey('baseMint'),
  publicKey('quoteMint'),
  publicKey('lpMint'),
  // market
  publicKey('openOrders'),
  publicKey('marketId'),
  publicKey('marketProgramId'),
  publicKey('targetOrders'),
  publicKey('withdrawQueue'),
  publicKey('lpVault'),
  publicKey('owner'),
  // true circulating supply without lock up
  u64('lpReserve'),
  seq(u64(), 3, 'padding'),
])

// CP_AMM CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C
const CPAMM_LAYOUT = struct([
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

export {
  AMM_LAYOUT,
  CPAMM_LAYOUT,
  CLMM_LAYOUT,
  MARKET_LAYOUT,
}