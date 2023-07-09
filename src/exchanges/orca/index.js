import basics from './basics'
import Exchange from '../../classes/Exchange'
import { findPath, pathExists } from './route/path'
import { getAmounts } from './route/amounts'
import { getTransaction } from './route/transaction'

export default (scope)=>{
  
  return new Exchange(

    Object.assign(basics, {
      scope,
      findPath,
      pathExists,
      getAmounts,
      getTransaction,
    })
  )
}
