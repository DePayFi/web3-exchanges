# TOKEN TO TOKEN (1 pool)

```javascript
let exchange = Web3Exchanges.find({ name: 'uniswap_v3' })

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

# TOKEN TO NATIVE (1 pool)

```javascript
let exchange = Web3Exchanges.find({ name: 'uniswap_v3' })

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: Web3Blockchains.ethereum.currency.address, // ETH
  amountIn: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```
