import Raydium from 'src/exchanges/raydium'
import { Buffer, PublicKey, BN } from '@depay/solana-web3.js'
import { mock } from '@depay/web3-mock'
import { POOL_INFO } from 'src/exchanges/raydium/apis'
import { provider } from '@depay/web3-client'
import { Token } from '@depay/web3-tokens'

let blockchain = 'solana'

function mockPair({ tokenIn, tokenOut, pair, _return, pool }) {
  if(pool) {
    mock({
      blockchain,
      provider: provider(blockchain),
      simulate: {
        from: 'RaydiumSimuLateTransaction11111111111111111',
        instructions: [{
          to: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
          api: POOL_INFO
        }],
        params: {
          instruction: 12,
          simulateType: 0
        },
        return: {
          logs: [
            `Program log: GetPoolData: {"status":1,"coin_decimals":9,"pc_decimals":6,"lp_decimals":9,"pool_pc_amount":${pool.pool_pc_amount},"pool_coin_amount":${pool.pool_coin_amount},"pool_lp_supply":263577512770802,"pool_open_time":0,"amm_id":"${pair}"}`
          ]
        }
      }
    })
  }
  if(_return) {
     mock({
      blockchain,
      provider: provider(blockchain),
      request: {
        method: 'getProgramAccounts',
        to: Raydium.pair.v4.address,
        params: { filters: [
          { dataSize: Raydium.pair.v4.api.span },
          { memcmp: { offset: 400, bytes: tokenOut }},
          { memcmp: { offset: 432, bytes: tokenIn }},
        ]},
        return: _return
      }
    })
    mock({
      blockchain,
      provider: provider(blockchain),
      request: {
        method: 'getProgramAccounts',
        to: Raydium.pair.v4.address,
        params: { filters: [
          { dataSize: Raydium.pair.v4.api.span },
          { memcmp: { offset: 400, bytes: tokenIn }},
          { memcmp: { offset: 432, bytes: tokenOut }},
        ]},
        return: _return
      }
    })
  }
  if(!pair) {
    mock({
      blockchain,
      provider: provider(blockchain),
      request: {
        method: 'getProgramAccounts',
        to: Raydium.pair.v4.address,
        params: { filters: [
          { dataSize: Raydium.pair.v4.api.span },
          { memcmp: { offset: 400, bytes: tokenOut }},
          { memcmp: { offset: 432, bytes: tokenIn }},
        ]},
        return: []
      }
    })
    mock({
      blockchain,
      provider: provider(blockchain),
      request: {
        method: 'getProgramAccounts',
        to: Raydium.pair.v4.address,
        params: { filters: [
          { dataSize: Raydium.pair.v4.api.span },
          { memcmp: { offset: 400, bytes: tokenIn }},
          { memcmp: { offset: 432, bytes: tokenOut }},
        ]},
        return: []
      }
    })
    return
  }
  let data = Buffer.alloc(Raydium.pair.v4.api.span)
  Raydium.pair.v4.api.encode({
    status: new BN("1"),
    nonce: new BN("254"),
    maxOrder: new BN("7"),
    depth: new BN("3"),
    baseDecimal: new BN("9"),
    quoteDecimal: new BN("6"),
    state: new BN("1"),
    resetFlag: new BN("1"),
    minSize: new BN("100000000"),
    volMaxCutRatio: new BN("0"),
    amountWaveRatio: new BN("5000000"),
    baseLotSize: new BN("100000000"),
    quoteLotSize: new BN("1000000"),
    minPriceMultiplier: new BN("1"),
    maxPriceMultiplier: new BN("1000000000"),
    systemDecimalValue: new BN("1000000000"),
    minSeparateNumerator: new BN("5"),
    minSeparateDenominator: new BN("10000"),
    tradeFeeNumerator: new BN("25"),
    tradeFeeDenominator: new BN("10000"),
    pnlNumerator: new BN("12"),
    pnlDenominator: new BN("100"),
    swapFeeNumerator: new BN("25"),
    swapFeeDenominator: new BN("10000"),
    baseNeedTakePnl: new BN("4510329839053"),
    quoteNeedTakePnl: new BN("173550260422"),
    quoteTotalPnl: new BN("18809917364632"),
    baseTotalPnl: new BN("206298412317135"),
    quoteTotalDeposited: new BN("0"),
    baseTotalDeposited: new BN("0"),
    swapBaseInAmount: new BN("64652927760230137"),
    swapQuoteOutAmount: new BN("6497290107504032"),
    swapBase2QuoteFee: new BN("15742669828255"),
    swapQuoteInAmount: new BN("6223442952155377"),
    swapBaseOutAmount: new BN("61789478352287910"),
    swapQuote2BaseFee: new BN("160644245130594"),
    baseVault: new PublicKey("DQyrAcCrDXQ7NeoqGgDCZwBvWDcYmFCjSb9JtteuvPpz"),
    quoteVault: new PublicKey("HLmqeL62xR1QoZ1HKKbXRrdN1p3phKpxRMb2VVopvBBz"),
    baseMint: new PublicKey("So11111111111111111111111111111111111111112"),
    quoteMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    lpMint: new PublicKey("8HoQnePLqPj4M7PUDzfw8e3Ymdwgc7NLGnaTUapubyvu"),
    openOrders: new PublicKey("HRk9CMrpq7Jn9sh7mzxE8CChHG8dneX9p475QKz4Fsfc"),
    marketId: new PublicKey("9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT"),
    marketProgramId: new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"),
    targetOrders: new PublicKey("CZza3Ej4Mc58MnxWA385itCC9jCo3L1D7zc3LKy1bZMR"),
    withdrawQueue: new PublicKey("G7xeGGLevkRwB5f44QNgQtrPKBdMfkT6ZZwpS9xcC97n"),
    lpVault: new PublicKey("Awpt6N7ZYPBa4vG4BQNFhFxDj4sxExAA9rpBAoBw2uok"),
    owner: new PublicKey("HggGrUeg4ReGvpPMLJMFKV69NTXL1r4wQ9Pk9Ljutwyv"),
    lpReserve: new BN("304658271050200"),
    padding: [new BN("1172707"), new BN("0"), new BN("0")]
  }, data)
  mock({
    blockchain,
    provider: provider(blockchain),
    request: {
      method: 'getProgramAccounts',
      to: Raydium.pair.v4.address,
      params: { filters: [
        { dataSize: Raydium.pair.v4.api.span },
        { memcmp: { offset: 400, bytes: tokenIn }},
        { memcmp: { offset: 432, bytes: tokenOut }},
      ]},
      return: [{ account: { data, executable: false, lamports: 2039280, owner: tokenIn, rentEpoch: 327 }, pubkey: pair }]
    }
  })
  mock({
    blockchain,
    provider: provider(blockchain),
    request: {
      method: 'getProgramAccounts',
      to: Raydium.pair.v4.address,
      params: { filters: [
        { dataSize: Raydium.pair.v4.api.span },
        { memcmp: { offset: 400, bytes: tokenOut }},
        { memcmp: { offset: 432, bytes: tokenIn }},
      ]},
      return: []
    }
  })
}

function mockToken({ symbol, name, mint, meta, decimals }) {
  mock({
    blockchain,
    provider: provider(blockchain),
    request: {
      to: mint,
      api: Token[blockchain].MINT_LAYOUT,
      return: {
        mintAuthorityOption: 1,
        mintAuthority: "2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9",
        supply: "5034999492452932",
        decimals: decimals,
        isInitialized: true,
        freezeAuthorityOption: 1,
        freezeAuthority: "3sNBr7kMccME5D55xNgsmYpZnzPgP2g12CixAajXypn6"
      }
    }
  })
  mock({
    blockchain,
    provider: provider(blockchain),
    request: {
      to: meta,
      api: Token[blockchain].METADATA_LAYOUT,
      return: {
        key: { metadataV1: {} },
        isMutable: true,
        editionNonce: 252,
        primarySaleHappened: false,
        updateAuthority: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9',
        mint: mint,
        data: {
          creators: null,
          name,
          sellerFeeBasisPoints: 0,
          symbol,
          uri: ""
        }
      }
    }
  })
}

export {
  mockPair,
  mockToken
}
