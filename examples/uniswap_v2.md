# TOKEN TO TOKEN (1 pool)

```javascript
let route = await Web3Exchanges.uniswap_v2.route({
  tokenIn: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })
wallet.sendTransaction(prep.transaction)

let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```
