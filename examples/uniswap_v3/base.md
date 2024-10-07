# 1 Pool

## ETH TO TOKEN

### amountOutMin

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'base',
  tokenIn: Web3Blockchains.base.currency.address,
  tokenOut: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDCb
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

### amountOut

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'base',
  tokenIn: Web3Blockchains.base.currency.address,
  tokenOut: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDCb
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

## TOKEN to ETH

### amountOutMin

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'base',
  tokenIn: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDCb,
  tokenOut: Web3Blockchains.base.currency.address,
  amountOutMin: 0.000377697
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

### amountOut

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'base',
  tokenIn: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDCb,
  tokenOut: Web3Blockchains.base.currency.address,
  amountOut: 0.000377697
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

## TOKEN to TOKEN

### amountOutMin

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'base',
  tokenIn: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDCb,
  tokenOut: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

### amountOut

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'base',
  tokenIn: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDCb,
  tokenOut: '0x6223901eA64608c75Da8497d5eff15D19A1D8fd5', // DAI
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

# 2 Pools

## TOKEN to TOKEN

### amountOutMin

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'base',
  tokenIn: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDCb,
  tokenOut: '0x6223901eA64608c75Da8497d5eff15D19A1D8fd5', // CORGI
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

## ETH TO TOKEN

### amountOutMin

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'base',
  tokenIn: Web3Blockchains.base.currency.address,
  tokenOut: '0x0c03ce270b4826ec62e7dd007f0b716068639f7b',
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```

## TOKEN to ETH
