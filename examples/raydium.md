## CPMM (constant product)

### 1 Pool

```javascript
let route = await Web3Exchanges.raydium.route({
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
