# NATIVE TO TOKEN (1 POOL)

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: Web3Blockchains.avalanche.currency.address, // AVAX
  tokenOut: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  amountOutMin: 0.00001
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: Web3Blockchains.avalanche.currency.address, // AVAX
  tokenOut: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  amountOut: 0.00001
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: Web3Blockchains.avalanche.currency.address, // AVAX
  tokenOut: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  amountInMax: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: Web3Blockchains.avalanche.currency.address, // AVAX
  tokenOut: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  amountIn: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

# TOKEN TO NATIVE (1 POOL)

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: Web3Blockchains.avalanche.currency.address, // AVAX
  amountOutMin: 0.00001
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: Web3Blockchains.avalanche.currency.address, // AVAX
  amountOut: 0.00001
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: Web3Blockchains.avalanche.currency.address, // AVAX
  amountInMax: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: Web3Blockchains.avalanche.currency.address, // AVAX
  amountIn: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

# TOKEN TO TOKEN (1 POOL)

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
  amountOut: 0.00001
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
  amountInMax: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
  amountIn: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

# TOKEN TO TOKEN (2 POOLS, via WRAPPED)

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: '0xb279f8dd152b99ec1d84a489d32c35bc0c7f5674', // STEAK
  amountOutMin: 0.002
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: '0xb279f8dd152b99ec1d84a489d32c35bc0c7f5674', // STEAK
  amountOut: 0.002
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: '0xb279f8dd152b99ec1d84a489d32c35bc0c7f5674', // STEAK
  amountInMax: 0.0001
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH
  tokenOut: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
  amountIn: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

# TOKEN TO TOKEN (2 POOLS, via STABLE)

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0xAEC8318a9a59bAEb39861d10ff6C7f7bf1F96C57', // agEUR
  tokenOut: '0xb279f8dd152b99ec1d84a489d32c35bc0c7f5674', // STEAK
  amountOutMin: 0.002
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0xAEC8318a9a59bAEb39861d10ff6C7f7bf1F96C57', // agEUR
  tokenOut: '0xb279f8dd152b99ec1d84a489d32c35bc0c7f5674', // STEAK
  amountOut: 0.002
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0xAEC8318a9a59bAEb39861d10ff6C7f7bf1F96C57', // agEUR
  tokenOut: '0xb279f8dd152b99ec1d84a489d32c35bc0c7f5674', // STEAK
  amountInMax: 0.0001
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.trader_joe_v2_1.route({
  blockchain: 'avalanche',
  tokenIn: '0xAEC8318a9a59bAEb39861d10ff6C7f7bf1F96C57', // agEUR
  tokenOut: '0xb279f8dd152b99ec1d84a489d32c35bc0c7f5674', // STEAK
  amountIn: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

# TOKEN TO NATIVE (2 POOLS, via WRAPPED)

# NATIVE TO TOKEN (2 POOLS, via WRAPPED)
