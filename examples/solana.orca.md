## TOKEN<>TOKEN (1 Pool)

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  amountIn: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountIn: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

## SOL<>TOKEN

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111', // SOL
  tokenOut: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  amountOutMin: 0.1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

## TOKEN<>SOL

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: '11111111111111111111111111111111', // SOl
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

## TOKEN<>WSOL

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'So11111111111111111111111111111111111111112', // WSOL
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

## WSOL<>TOKEN

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'So11111111111111111111111111111111111111112', // WSOl
  tokenOut: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  amountOutMin: 0.2
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

## TOKEN<>USDC<>TOKEN (2 Pools)

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'HxhWkVpk5NS4Ltg5nij2G671CKXFRKPK8vy271Ub4uEK', // HXRO
  tokenOut: '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM', // AUDIUS
  amountInMax: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'HxhWkVpk5NS4Ltg5nij2G671CKXFRKPK8vy271Ub4uEK', // HXRO
  tokenOut: '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM', // AUDIUS
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

## SOL<>USDC<>TOKEN (2 Pools)

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111', // SOL
  tokenOut: 'Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1', // SBR
  amountInMax: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

## TOKEN<>USDC<>SOL (2 Pools)

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1', // SBR
  tokenOut: '11111111111111111111111111111111', // SOL
  amountInMax: 200
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```

## TOKEN<>WSOL<>TOKEN

```javascript
let exchange = Web3Exchanges.find('solana', 'orca')
let route = await exchange.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: '5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm', // scnSOL
  amountInMax: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let from = await wallet.account()
let transaction = await route.getTransaction({ from })

wallet.sendTransaction(transaction)
```
