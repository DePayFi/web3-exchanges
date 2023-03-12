```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  tokenOut: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  amountIn: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```
