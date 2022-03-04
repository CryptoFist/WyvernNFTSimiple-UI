import Web3 from 'web3';
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
var web3js = new Web3(provider)

const { eip712Domain, structHash } = require('./eip712.js')

const eip712Order = {
   name: 'Order',
   fields: [
     { name: 'registry', type: 'address' },
     { name: 'maker', type: 'address' },
     { name: 'staticTarget', type: 'address' },
     { name: 'staticSelector', type: 'bytes4' },
     { name: 'staticExtradata', type: 'bytes' },
     { name: 'maximumFill', type: 'uint256' },
     { name: 'listingTime', type: 'uint256' },
     { name: 'expirationTime', type: 'uint256' },
     { name: 'salt', type: 'uint256' }
   ]
}

export const structToSign = (order, exchange) => {
   return {
     name: eip712Order.name,
     fields: eip712Order.fields,
     domain: {
       name: 'Wyvern Exchange',
       version: '3.1',
       chainId: 3,
       verifyingContract: exchange
     },
     data: order
   }
}

export const parseSig = (bytes) => {
   bytes = bytes.substr(2)
   const r = '0x' + bytes.slice(0, 64)
   const s = '0x' + bytes.slice(64, 128)
   const v = parseInt('0x' + bytes.slice(128, 130), 16)
   return {v, r, s}
}

const hashOrder = (order) => {
   return '0x' + structHash(eip712Order.name, eip712Order.fields, order).toString('hex')
}

export const wrap = async (inst) => {
   var obj = {
      inst: inst,
      hashOrder: (order) => inst.hashOrder_.call(order.registry, order.maker, order.staticTarget, order.staticSelector, order.staticExtradata, order.maximumFill, order.listingTime, order.expirationTime, order.salt),
      hashToSign: (order) => {
        return inst.hashOrder_.call(order.registry, order.maker, order.staticTarget, order.staticSelector, order.staticExtradata, order.maximumFill, order.listingTime, order.expirationTime, order.salt).then(hash => {
          return inst.hashToSign_.call(hash)
        })
      },
      validateOrderParameters: (order) => inst.validateOrderParameters_.call(order.registry, order.maker, order.staticTarget, order.staticSelector, order.staticExtradata, order.maximumFill, order.listingTime, order.expirationTime, order.salt),
      validateOrderAuthorization: (hash, maker, sig, misc) => inst.validateOrderAuthorization_.call(hash, maker, web3js.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [sig.v, sig.r, sig.s]) + (sig.suffix || ''), misc),
      approveOrderHash: (hash) => inst.approveOrderHash_(hash),
      approveOrder: (order, inclusion, misc) => inst.approveOrder_(order.registry, order.maker, order.staticTarget, order.staticSelector, order.staticExtradata, order.maximumFill, order.listingTime, order.expirationTime, order.salt, inclusion, misc),
      setOrderFill: (order, fill) => inst.setOrderFill_(hashOrder(order), fill),
      atomicMatch: (order, sig, call, counterorder, countersig, countercall, metadata) => inst.atomicMatch_(
        [order.registry, order.maker, order.staticTarget, order.maximumFill, order.listingTime, order.expirationTime, order.salt, call.target,
          counterorder.registry, counterorder.maker, counterorder.staticTarget, counterorder.maximumFill, counterorder.listingTime, counterorder.expirationTime, counterorder.salt, countercall.target],
        [order.staticSelector, counterorder.staticSelector],
        order.staticExtradata, call.data, counterorder.staticExtradata, countercall.data,
        [call.howToCall, countercall.howToCall],
        metadata,
        web3js.eth.abi.encodeParameters(['bytes', 'bytes'], [
          web3js.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [sig.v, sig.r, sig.s]) + (sig.suffix || ''),
          web3js.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [countersig.v, countersig.r, countersig.s]) + (countersig.suffix || '')
        ])
      ),
      atomicMatchWith: (order, sig, call, counterorder, countersig, countercall, metadata, misc) => inst.atomicMatch_(
        [order.registry, order.maker, order.staticTarget, order.maximumFill, order.listingTime, order.expirationTime, order.salt, call.target,
          counterorder.registry, counterorder.maker, counterorder.staticTarget, counterorder.maximumFill, counterorder.listingTime, counterorder.expirationTime, counterorder.salt, countercall.target],
        [order.staticSelector, counterorder.staticSelector],
        order.staticExtradata, call.data, counterorder.staticExtradata, countercall.data,
        [call.howToCall, countercall.howToCall],
        metadata,
        web3js.eth.abi.encodeParameters(['bytes', 'bytes'], [
          web3js.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [sig.v, sig.r, sig.s]) + (sig.suffix || ''),
          web3js.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [countersig.v, countersig.r, countersig.s]) + (countersig.suffix || '')
        ]),
        misc
      )
   }

   obj.getSignData = (order, exchangeAddress) => {
    const str = structToSign(order, exchangeAddress);

    const data = {
        types: {
          EIP712Domain: eip712Domain.fields,
          Order: eip712Order.fields
        },
        domain: str.domain,
        primaryType: 'Order',
        message: order
      };

    return data;
   }

   return obj;
}

export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const ZERO_BYTES20 = '0x0000000000000000000000000000000000000000'