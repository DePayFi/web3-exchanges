## CPMM (constant product)

### 1 Pool

```javascript
let route = await Web3Exchanges.raydium_cp.route({
  blockchain: 'solana',
  tokenIn: '9wvorGtBJ8gyLorFTmwXWcymPoGVUBn6MRzHwFpCdCeC',
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amountInMax: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[1]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## CLMM (concentrated liquidity)

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
