## TOKEN<>TOKEN

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  tokenOut: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```

## SOL<>TOKEN

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111', // SOL
  tokenOut: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```

## WSOL<>TOKEN

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: 'So11111111111111111111111111111111111111112', // WSOL
  tokenOut: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
  amountOutMin: 0.1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```

## TOKEN<>SOL

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
  tokenOut: '11111111111111111111111111111111', // SOl
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```

## TOKEN<>WSOL

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
  tokenOut: 'So11111111111111111111111111111111111111112', // WSOl
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```

## TOKEN<>USDC<>TOKEN

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM', // AUDIUS
  tokenOut: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT', // STEP
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT', // STEP
  tokenOut: '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM', // AUDIUS
  amountOutMin: 0.1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```

## TOKEN<>WSOL<>TOKEN

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT', // STEP
  tokenOut: '9tzZzEHsKnwFL1A3DyFJwj36KnZj3gZ7g4srWp9YTEoh', // ARB
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```

## SOL<>WSOL (PENDING)

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111', // SOL
  tokenOut: 'So11111111111111111111111111111111111111112', // WSOL
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```

## WSOL<>SOL (PENDING)

```javascript
let routes = await Web3Exchanges.route({
  blockchain: 'solana',
  tokenIn: 'So11111111111111111111111111111111111111112', // WSOL
  tokenOut: '11111111111111111111111111111111', // SOL
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await routes[0].getTransaction({ from })

wallet.sendTransaction(transaction)
```
