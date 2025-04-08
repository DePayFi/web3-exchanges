## CPMM (constant product)

### 1 Pool

### with pairsData

```javascript
let route = await Web3Exchanges.raydium_cp.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111',
  tokenOut: '7kN5FQMD8ja4bzysEgc5FXmryKd6gCgjiWnhksjHCFb3',
  amountOutMin: 5,
  pairsData: [{"id": "9SxEcmwzHtSZu2jJSpSxuyxweYECvvtykoP3qtEprkvj", "bump": 253, "mintA": "So11111111111111111111111111111111111111112", "mintB": "7kN5FQMD8ja4bzysEgc5FXmryKd6gCgjiWnhksjHCFb3", "config": {"bump": 255, "fundFeeRate": "40000", "tradeFeeRate": "2500", "protocolFeeRate": "120000"}, "vaultA": "8KkXrm5Ssq5XUNarhpfzByZG7vK9jSDkvZ2oLnKMBLCq", "vaultB": "4WB5roWeJaFqrwXtcES1g7quAbtHKvj2Y2adTDmW1Get", "configId": "D4FPEruKEHrG5TenZ2mpDGEfu1iUvTiqBxvpU8HLBvC2", "exchange": "raydium_cp", "observationId": "fRG1B8TsfPjuhXdnJ22DexzcDDTsSddsaCNXuLVuegS"}]
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[1]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## CLMM (concentrated liquidity)

### with pairsData

```javascript
let route = await Web3Exchanges.raydium_cl.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111',
  tokenOut: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  amountOutMin: 1,
  pairsData: [{"id": "3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF", "bump": 251, "mintA": "So11111111111111111111111111111111111111112", "mintB": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "config": {"bump": 249, "tickSpacing": 1, "tradeFeeRate": 100, "protocolFeeRate": 120000}, "vaultA": "AbcuyoPeYnddzFoFQudsiFka8qd6tTwvLgxwtpTKTpKC", "vaultB": "2n6fxuD6PA5NYgEnXXYMh2iWD1JBJ1LGf76kFJAayZmX", "exchange": "raydium_cl", "ammConfig": "9iFER3bpjf1PTTCQCfTRu17EJgvsxo9pVyA9QWwEuX4x", "tickSpacing": 1, "mintDecimalsA": 9, "mintDecimalsB": 6, "observationId": "Cqb16WaM7dDDP8koxYASDJLWgan4STDB1R3LiSH8r3GR", "exBitmapAddress": "2ncinnTcJxbZ1nUHavBVJ3Ap3R4CE7p2LJ6Jtpd1vLzd"}]
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[1]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

### 1 Pool amountOutMin

```javascript
let route = await Web3Exchanges.raydium_cl.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111',
  tokenOut: 'BNso1VUJnh4zcfpZa6986Ea66P6TCp59hvtNJ8b1X85',
  amountOutMin: 0.00193
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[1]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

### 1 Pool amountInMax

```javascript
let route = await Web3Exchanges.raydium.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111',
  tokenOut: 'BNso1VUJnh4zcfpZa6986Ea66P6TCp59hvtNJ8b1X85',
  amountInMax: 0.002
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[1]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

### 2 Pools

```javascript
let route = await Web3Exchanges.raydium_cl.route({
  blockchain: 'solana',
  tokenIn: Web3Blockchains.solana.currency.address,
  tokenOut: 'BLUv63M5ib2U62EeYhjHgC5dBe5cbW87TbeCQEqjpoDe',
  amountOutMin: 0.05
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[1]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```
