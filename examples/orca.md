## TOKEN<>TOKEN (1 Pool) with pairsData

```javascript
let pairsData = [
    {
    "id": "C1MgLojNLWBKADvu9BHdtgzz1oZX4dZ5zGdGcgvvW8Wz",
    "exchange": "orca",
    "mintA": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    "mintB": "So11111111111111111111111111111111111111112",
    "vaultA": "HVJuVW2dRbZ2fynWEY2JK6Ak2YTfVpji73sHZMCqiXSb",
    "vaultB": "8MFbZEaXp8Ky8ufhZRgphgMgKVwsjhDhZtNqmEPcxvQK",
    "feeRate": 500,
    "tickSpacing": 8,
    "whirlpoolBump": [254],
    "protocolFeeRate": 1300,
    "tickSpacingSeed": [8, 0],
    "whirlpoolsConfig": "2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ"
    }
]

let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111',
  tokenOut: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  amountOutMin: 0.1,
  pairsData
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[1]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## TOKEN<>TOKEN (1 Pool)

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  amountIn: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  amountInMax: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountIn: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountInMax: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  amountIn: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountIn: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## SOL<>TOKEN

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111', // SOL
  tokenOut: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  amountOutMin: 0.1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## TOKEN<>SOL

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: '11111111111111111111111111111111', // SOl
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## TOKEN<>WSOL

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  tokenOut: 'So11111111111111111111111111111111111111112', // WSOL
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## WSOL<>TOKEN

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'So11111111111111111111111111111111111111112', // WSOl
  tokenOut: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', // ORCA
  amountOutMin: 0.2
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## TOKEN<>USDC<>TOKEN (2 Pools)

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111', // SOL
  tokenOut: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111', // SOL
  tokenOut: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  amountOut: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111', // SOL
  tokenOut: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  amountIn: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111', // SOL
  tokenOut: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  amountInMax: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  tokenOut: '11111111111111111111111111111111', // SOL
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  tokenOut: '11111111111111111111111111111111', // SOL
  amountOutMin: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  tokenOut: '11111111111111111111111111111111', // SOL
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[1]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF', // DEPAY
  tokenOut: '11111111111111111111111111111111', // SOL
  amountInMax: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'HxhWkVpk5NS4Ltg5nij2G671CKXFRKPK8vy271Ub4uEK', // HXRO
  tokenOut: '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM', // AUDIUS
  amountInMax: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'HxhWkVpk5NS4Ltg5nij2G671CKXFRKPK8vy271Ub4uEK', // HXRO
  tokenOut: '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM', // AUDIUS
  amountOutMin: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## SOL<>USDC<>TOKEN (2 Pools)

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: '11111111111111111111111111111111', // SOL
  tokenOut: 'Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1', // SBR
  amountInMax: 0.01
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## TOKEN<>USDC<>SOL (2 Pools)

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1', // SBR
  tokenOut: '11111111111111111111111111111111', // SOL
  amountInMax: 200
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```

## TOKEN<>WSOL<>TOKEN

```javascript
let route = await Web3Exchanges.orca.route({
  blockchain: 'solana',
  tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  tokenOut: '5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm', // scnSOL
  amountInMax: 1
})

let wallets = await Web3Wallets.getWallets()
let wallet = wallets[0]
let account = await wallet.account()
let transaction = await route.getTransaction({ account })

wallet.sendTransaction(transaction)
```
