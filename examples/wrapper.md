# Ethereum: WETH

```javascript
let route = await Web3Exchanges.ethereum.weth.route({
  blockchain: 'ethereum',
  tokenIn: Web3Blockchains.ethereum.currency.address,
  tokenOut: Web3Blockchains.ethereum.wrapped.address,
  amountOut: 0.0001
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.ethereum.weth.route({
  blockchain: 'ethereum',
  tokenIn: Web3Blockchains.ethereum.wrapped.address,
  tokenOut: Web3Blockchains.ethereum.currency.address,
  amountOut: 0.0001
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
wallet.sendTransaction(transaction)
```

# Arbitrum: WETH
# Optimism: WETH
# BSC: WBNB
# Polygon: WMATIC
# Avalanche: WAVAX
# Fantom: WFTM
# GNOSIS: WXDAI
