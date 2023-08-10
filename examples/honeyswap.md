# TOKEN TO TOKEN (1 pool)

```javascript
let route = await Web3Exchanges.gnosis.honeyswap.route({
  tokenIn: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', // USDC
  tokenOut: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6', // USDT
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()

let prep = await route.getPrep({ account })
wallet.sendTransaction(prep.transaction)

let transaction = await route.getTransaction({ account })
wallet.sendTransaction(transaction)
```
