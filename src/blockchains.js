/*#if _EVM

let supported = ['ethereum', 'bsc', 'polygon', 'fantom']
supported.evm = ['ethereum', 'bsc', 'polygon', 'fantom']
supported.solana = []

/*#elif _SOLANA

let supported = ['solana']
supported.evm = []
supported.solana = ['solana']

//#else */

let supported = ['ethereum', 'bsc', 'polygon', 'solana', 'fantom']
supported.evm = ['ethereum', 'bsc', 'polygon', 'fantom']
supported.solana = ['solana']

//#endif

export { supported }
