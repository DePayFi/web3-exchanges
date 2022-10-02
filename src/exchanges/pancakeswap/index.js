import basics from './basics'
import Exchange from '../../classes/Exchange'
import { findPath } from './route/path'
import { getAmountsIn, getAmounts } from './route/amounts'
import { getTransaction } from './route/transaction'

export default new Exchange(
  Object.assign(basics, {
    findPath,
    getAmounts,
    getAmountsIn,
    getTransaction,
  })
)

