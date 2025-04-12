```javascript
let route = await Web3Exchanges.uniswap_v3.route({
  blockchain: 'gnosis',
  tokenIn: Web3Blockchains.base.currency.address,
  tokenOut: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6', // USDT
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```
