# TOKEN TO TOKEN (1 pool)

```javascript
let route = await Web3Exchanges.trader_joe.route({
  blockchain: 'avalanche',
  tokenIn: '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd', // JOE
  tokenOut: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })
```
