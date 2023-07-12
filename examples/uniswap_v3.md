# TOKEN TO TOKEN (1 pool)

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })
```

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })
```

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  amountIn: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })
```

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  amountInMax: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })
```

# TOKEN TO NATIVE (1 pool)

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: Web3Blockchains.ethereum.currency.address, // ETH
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await routes[0].getTransaction({ account })
```

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: Web3Blockchains.ethereum.currency.address, // ETH
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await routes[0].getTransaction({ account })
```

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: Web3Blockchains.ethereum.currency.address, // ETH
  amountIn: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await routes[0].getTransaction({ account })
```

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  tokenOut: Web3Blockchains.ethereum.currency.address, // ETH
  amountInMax: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await routes[0].getTransaction({ account })
```

# TOKEN TO TOKEN (2 pools)

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  tokenOut: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  tokenOut: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  tokenOut: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
  amountIn: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.uniswap_v3

let route = await exchange.route({
  blockchain: 'ethereum',
  tokenIn: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', // DEPAY
  tokenOut: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
  amountInMax: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```
