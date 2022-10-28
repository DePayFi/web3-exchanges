import basics from './basics'
import Exchange from '../../classes/Exchange.evm'
import { findPath } from './route/path.evm'
import { getAmounts } from './route/amounts.evm'
import { getTransaction } from './route/transaction.evm'

export default new Exchange(
  Object.assign(basics, {
    findPath,
    getAmounts,
    getTransaction,
  })
)

