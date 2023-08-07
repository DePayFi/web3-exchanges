# NATIVE TO TOKEN (sort best routes)

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'ethereum',
  tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await routes[0].getTransaction({ account })

wallet.sendTransaction(transaction)
```


# TOKEN TO TOKEN

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'ethereum',
  tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await routes[0].getTransaction({ account })

wallet.sendTransaction(transaction)
```
