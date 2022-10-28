import basics from './basics'
import { findPath } from './route/path.evm'
// import { getAmounts } from './route/amounts.evm'
import { getTransaction } from './route/transaction.evm'

export default Object.assign(basics, {
    findPath,
    // getAmounts,
    getTransaction,
  })

