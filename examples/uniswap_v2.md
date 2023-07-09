# TOKEN TO TOKEN (1 pool)

```javascript
let route = await Web3Exchanges.uniswap_v2.route({
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
```
