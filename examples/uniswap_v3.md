# ETH TO TOKEN (OPTIMISM, 1 pool)

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'optimism',
  tokenIn: Web3Blockchains.optimism.currency.address,
  tokenOut: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

# TOKEN to ETH (OPTIMISM, 1 pool)

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'optimism',
  tokenIn: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', // USDT
  tokenOut: Web3Blockchains.optimism.currency.address,
  amountIn: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

# TOKEN TO TOKEN (NO PERTMI2, OPTIMISM, 1 pool)

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'optimism',
  tokenIn: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
  tokenOut: '0x4200000000000000000000000000000000000042', // OPTIMSM
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

# TOKEN TO TOKEN (OPTIMISM, with PERMIT2 1 pool)

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'optimism',
  tokenIn: '0x4200000000000000000000000000000000000042', // OPTIMSM
  tokenOut: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })
let signature = await wallet.sign(prep.signature)
let permit2 = {...prep.signature.message, signature}

let transaction = await route.getTransaction({ account, permit2 })
wallet.sendTransaction(transaction)
```

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

let prep = await route.getPrep({ account })

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
