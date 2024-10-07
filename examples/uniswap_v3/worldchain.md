# 1 Pool

## ETH TO TOKEN

### amountOutMin

```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'worldchain',
  tokenIn: Web3Blockchains.worldchain.currency.address,
  tokenOut: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1', // USDC.e
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```
