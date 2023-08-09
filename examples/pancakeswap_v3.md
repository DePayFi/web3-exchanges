# TOKEN TO TOKEN (1 pool)

```javascript
let route = await Web3Exchanges.pancakeswap_v3.route({
  blockchain: 'bsc',
  tokenIn: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
  tokenOut: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
  amountOutMin: 0.5
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.pancakeswap_v3.route({
  blockchain: 'bsc',
  tokenIn: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
  tokenOut: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
  amountInMax: 0.5
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

# NATIVE TO TOKEN (1 pool)

```javascript
let route = await Web3Exchanges.pancakeswap_v3.route({
  blockchain: 'bsc',
  tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  tokenOut: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
  amountOutMin: 0.1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

# TOKEN to NATIVE (1 pool)

```javascript
let route = await Web3Exchanges.pancakeswap_v3.route({
  blockchain: 'bsc',
  tokenIn: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
  tokenOut: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  amountOutMin: 0.001
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

# TOKEN TO TOKEN (2 pools)

```javascript
let route = await Web3Exchanges.pancakeswap_v3.route({
  blockchain: 'bsc',
  tokenIn: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
  tokenOut: '0x2dfF88A56767223A5529eA5960Da7A3F5f766406', // ID
  amountOutMin: 0.5
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.pancakeswap_v3.route({
  blockchain: 'bsc',
  tokenIn: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
  tokenOut: '0x2dfF88A56767223A5529eA5960Da7A3F5f766406', // ID
  amountInMax: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

# NATIVE TO TOKEN (2 pools)

```javascript
let route = await Web3Exchanges.pancakeswap_v3.route({
  blockchain: 'bsc',
  tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  tokenOut: '0xbabacc135bbf2ce30f9c0f12665b244d3689a29c', // COSMIC
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

# TOKEN TO NATIVE (2 pools)

```javascript
let route = await Web3Exchanges.pancakeswap_v3.route({
  blockchain: 'bsc',
  tokenIn: '0xbabacc135bbf2ce30f9c0f12665b244d3689a29c', // COSMIC
  tokenOut: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  amountOutMin: 0.0025
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

