# TOKEN TO TOKEN (1 pool)

```javascript
let route = await Web3Exchanges.pancakeswap_v3.route({
  blockchain: 'bsc',
  tokenIn: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
  tokenOut: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
  amountOut: 0.5
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })
```
