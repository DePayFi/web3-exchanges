import basics from './basics'
import Exchange from '../../classes/Exchange'
import route from './route'

export default new Exchange(
  Object.assign(basics, { route })
)

