import { ethers } from 'ethers'

const fixAddress = (address)=>{
  if(address.match('0x')) {
    return ethers.utils.getAddress(address)
  } else {
    return address
  }
}

export { fixAddress }
