import { ethers } from 'ethers'

const fixCheckSum = (address)=>{
  return ethers.utils.getAddress(address)
}

export { fixCheckSum }
