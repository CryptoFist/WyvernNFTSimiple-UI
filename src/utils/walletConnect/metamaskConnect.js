// import react from "react";
import Web3 from 'web3';
import TokenABI from "../../contract/azuki.abi.json";
// import StaticMarketABI from "../../contract/staticmarket.abi.json";
// import WyvernAtomicizerABI from "../../contract/wyvernatomicizer.abi.json";
import WyvernExchangeABI from "../../contract/wyvernexchange.abi.json";
import WyvernRegisteryABI from "../../contract/wyvernregistry.abi.json";
import ERC20MockABI from "../../contract/erc20mock.abi.json";
import { toWei } from "web3-utils";
const {wrap, ZERO_BYTES32, parseSig} = require('../util');

const nftContractAddress = "0xdf5c681BE2A970AA372a637dA4ABec03Cdd4a4c8";
const staticContractAddress = "0xd623c287cc1a58FA834113ED40c92850Ad73E09B";
// const atomicizerContractAddress = "0x0b6E4DEeB343d5A9bd5E1559F07031E15F163a86";
const exchangeContractAddress = "0x8F27ee79a16649194987AA0356F32A1b72a8fDb2";
const registeryContractAddress = "0x1EBD745019953E892b5f95e8a79A1F626Ac46FA5";
const erc20ContractAddress = "0x33c71aE8e27c3eb99cDE3E24f6d775fda3C144DC";

export const isMetamaskDecteced = async () => {
  try {
    if (window.ethereum !== undefined) {
      return true;
    }

    return false;
  } catch(e) {
    console.log(e);
  }
  return false;
}

export const checkAccount = async () => {
  try {
    let web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
  } catch (e) {

  }
  return undefined;
}

export const connectWallet = async () => {
  try {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return await checkAccount();
      } catch (err) {
        console.log('user did not add account...', err)
      }
    } else {
      return await checkAccount();
    }
  } catch(e) {

  }
  return undefined;
}

export const walletConnection = async () => {
  try {
    if (await isMetamaskDecteced() === false) {
      return false;
    }

    if (window.ethereum) {
      return false;
    } else {
      return true;
    }
  } catch(e) {

  }
  return false;
}

export const setBaseURI = async () => {
   try {
      const baseURI = 'https://gateway.pinata.cloud/ipfs/QmYejVD4kmpv74JoieBedEX5Ba9Nj91DWy2635Q8zg4z9f/';
      const walletAddress = await connectWallet();
      if (walletAddress !== undefined) {
         const web3 = new Web3(window.ethereum);
         
         const contract = await new web3.eth.Contract(TokenABI.abi, nftContractAddress);
         await contract.methods.setBaseURI(baseURI).send({
            from: walletAddress,
            gas: 300000
         });
      }
   } catch(e) {
      console.log(e);
   }
}

export const getOwnedNFT = async () => {
   try {
      const walletAddress = await connectWallet();
      let resp = [];
      if (walletAddress !== undefined) {
         const web3 = new Web3(window.ethereum);
         
         const contract = await new web3.eth.Contract(TokenABI.abi, nftContractAddress);

         const ownedNFTTokenID = await contract.methods.getNFTByOwner().call({
            from: walletAddress,
            gas: 300000
         });

         for (let i = 0; i < ownedNFTTokenID.length; i ++) {
            const tokenId = ownedNFTTokenID[i];
            let tokenURI = await contract.methods.tokenURI(tokenId).call();
            tokenURI = tokenURI + ".json";
            const metaData = await fetch(tokenURI)
            .then((resp) => resp.json())
            .then((responseJson) => {
               return responseJson;
            })
            .catch((error) => {
               console.error(error);
            });
            let tokenData = new Object();
            tokenData.tokenID = tokenId;
            tokenData.title = metaData.title;
            tokenData.url = metaData.url;
            resp.push(tokenData);
         }

         return resp;
      }
   } catch (e) {
      console.log(e);
   }
   return undefined;
}

export const getOfferedNFT = async () => {
   try {
      const walletAddress = await connectWallet();
      let resp = [];
      if (walletAddress !== undefined) {
         const web3 = new Web3(window.ethereum);
         
         const contract = await new web3.eth.Contract(TokenABI.abi, nftContractAddress);
         const offeredNFT = await contract.methods.getOfferedNFT().call({
            from: walletAddress,
            gas: 300000
         });

         for (let i = 0; i < offeredNFT.length; i ++) {
            const tokenId = offeredNFT[i].tokenId;
            let tokenURI = await contract.methods.tokenURI(tokenId).call();
            tokenURI = tokenURI + ".json";
            const metaData = await fetch(tokenURI)
            .then((resp) => resp.json())
            .then((responseJson) => {
               return responseJson;
            })
            .catch((error) => {
               console.error(error);
            });
            let tokenData = new Object();
            tokenData.tokenID = tokenId;
            tokenData.title = metaData.title;
            tokenData.url = metaData.url;
            tokenData.price = offeredNFT[i].price / 10**18;
            resp.push(tokenData);
         }

         return resp;
      }
   } catch (e) {
      console.log(e);
   }
   return undefined;
}

export const mintNFT = async (nftAmount) => {
   try {
      const walletAddress = await connectWallet();
      if (walletAddress !== undefined) {
         const web3 = new Web3(window.ethereum);
         
         const contract = await new web3.eth.Contract(TokenABI.abi, nftContractAddress);
         await contract.methods.safeMint(walletAddress, nftAmount).send({
            from: walletAddress,
            gas: 300000
         });
      }
   } catch (e) {
      console.log(e);
   }
}

export const tradeNFT = async (tokenId, price) => {
   try {
      const walletAddress = await connectWallet();
      if (walletAddress !== undefined) {
         const web3 = new Web3(window.ethereum);

         const erc721contract = await new web3.eth.Contract(TokenABI.abi, nftContractAddress);
         const erc20Contract = await new web3.eth.Contract(ERC20MockABI.abi, erc20ContractAddress);

         const offeredNFT = await erc721contract.methods.getOfferedNFTByTokenID(tokenId).call();
         let sigOne = offeredNFT.sign;
         const seller = offeredNFT.owner;

         console.log("sigOne is ", sigOne);
         console.log("seller is ", seller);

         const registeryContract = await new web3.eth.Contract(WyvernRegisteryABI.abi, registeryContractAddress);
         let proxy = await registeryContract.methods.proxies(walletAddress).call();
         if (proxy === '0x0000000000000000000000000000000000000000') {
            console.log("register to proxy.");
            await registeryContract.methods.registerProxy().send({
               from: walletAddress,
               gas: 3000000
            });
            proxy = await registeryContract.methods.proxies(walletAddress).call();
         }
         console.log("proxy is ", proxy);

         const allowance = await erc20Contract.methods.allowance(walletAddress, proxy).call();
         if (allowance !== toWei(String(price), "ether")) {
            console.log("ERC20 approve function");
            await erc20Contract.methods.approve(proxy, toWei(String(price), "ether")).send({
               from: walletAddress,
               gas: 3000000
            });
         }

         const selectorOne = web3.eth.abi.encodeFunctionSignature('ERC721ForERC20(bytes,address[7],uint8[2],uint256[6],bytes,bytes)')
         const selectorTwo = web3.eth.abi.encodeFunctionSignature('ERC20ForERC721(bytes,address[7],uint8[2],uint256[6],bytes,bytes)');
         const paramsOne = web3.eth.abi.encodeParameters(
            ['address[2]', 'uint256[2]'],
            [[nftContractAddress, erc20ContractAddress], [tokenId, toWei(String(price), "ether")]]
         ) 
         const paramsTwo = web3.eth.abi.encodeParameters(
            ['address[2]', 'uint256[2]'],
            [[erc20ContractAddress, nftContractAddress], [tokenId, toWei(String(price), "ether")]]
         );

         const one = {
            registry: registeryContractAddress, 
            maker: seller, 
            staticTarget: staticContractAddress, 
            staticSelector: selectorOne, 
            staticExtradata: paramsOne, 
            maximumFill: 1, 
            listingTime: '0', 
            expirationTime: '10000000000', 
            salt: '11'
         }

         const two = {
            registry: registeryContractAddress, 
            maker: walletAddress, 
            staticTarget: staticContractAddress, 
            staticSelector: selectorTwo, 
            staticExtradata: paramsTwo, 
            maximumFill: 1, 
            listingTime: '0', 
            expirationTime: '10000000000', 
            salt: '12'
         }

         const firstData = erc721contract.methods.transferFrom(seller, walletAddress, tokenId).encodeABI();
		   const secondData = erc20Contract.methods.transferFrom(walletAddress, seller, toWei(String(price), "ether")).encodeABI();
         console.log("firstData is ", firstData);
         console.log("secondData is ", secondData);
         console.log("price is ", toWei(String(price), "ether"));

         const firstCall = {target: nftContractAddress, howToCall: 0, data: firstData};
		   const secondCall = {target: erc20ContractAddress, howToCall: 0, data: secondData};

         const exchangeContract = await new web3.eth.Contract(WyvernExchangeABI.abi, exchangeContractAddress);
         const wrapExchange = await wrap(exchangeContract);
         const twoData = wrapExchange.getSignData(two, exchangeContractAddress);
         console.log("twoData is ", twoData);
         let sigTwo = await getSign(JSON.stringify(twoData));
         console.log("sigTwo is ", sigTwo);

         sigOne = parseSig(sigOne);
         sigTwo = parseSig(sigTwo);

         const signatures = web3.eth.abi.encodeParameters(['bytes', 'bytes'], [
            web3.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [sigOne.v, sigOne.r, sigOne.s]) + (sigOne.suffix || ''),
            web3.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [sigTwo.v, sigTwo.r, sigTwo.s]) + (sigTwo.suffix || '')
         ]);

         await exchangeContract.methods.atomicMatch_(
            [one.registry, one.maker, one.staticTarget, one.maximumFill, one.listingTime, one.expirationTime, one.salt, firstCall.target,
               two.registry, two.maker, two.staticTarget, two.maximumFill, two.listingTime, two.expirationTime, two.salt, secondCall.target],
            [one.staticSelector, two.staticSelector],
            one.staticExtradata, firstCall.data, two.staticExtradata, secondCall.data,
            [firstCall.howToCall, secondCall.howToCall],
            ZERO_BYTES32,
            signatures,
         ).send({
            from: walletAddress,
            gas: 3000000
         });
      }
   } catch(e) {
      console.log(e);
   }
}

export const closeOffering = async (tokenId) => {
   try {
      const walletAddress = await connectWallet();
      if (walletAddress !== undefined) {
         const web3 = new Web3(window.ethereum);
         const contract = await new web3.eth.Contract(TokenABI.abi, nftContractAddress);

         await contract.methods.closeOffering(tokenId).send({
            from: walletAddress,
            gas: 3000000
         });
      }

      return true;

   } catch(e) {
      console.log(e);
   }

   return false;
}

export const placeOffering = async (tokenId, price) => {
   try {
      const walletAddress = await connectWallet();
      if (walletAddress !== undefined) {
         const web3 = new Web3(window.ethereum);
         
         const contract = await new web3.eth.Contract(TokenABI.abi, nftContractAddress);
         const registeryContract = await new web3.eth.Contract(WyvernRegisteryABI.abi, registeryContractAddress);

         // register proxy
         let proxy = await registeryContract.methods.proxies(walletAddress).call();
         if (proxy === '0x0000000000000000000000000000000000000000') {
            console.log("register to proxy.");
            await registeryContract.methods.registerProxy().send({
               from: walletAddress,
               gas: 3000000
            });

            proxy = await registeryContract.methods.proxies(walletAddress).call();  // get proxy address
         }
         console.log("proxy is ", proxy);

         // approve tokenId to sell the NFT of tokenId
         // await contract.methods.approve(proxy, tokenId).send({
         //    from: walletAddress,
         //    gas: 3000000
         // });

         const selectorOne = web3.eth.abi.encodeFunctionSignature('ERC721ForERC20(bytes,address[7],uint8[2],uint256[6],bytes,bytes)')
         const paramsOne = web3.eth.abi.encodeParameters(
            ['address[2]', 'uint256[2]'],
            [[nftContractAddress, erc20ContractAddress], [tokenId, toWei(price, "ether")]]
         ) 
         const one = {
            registry: registeryContractAddress, 
            maker: walletAddress, 
            staticTarget: staticContractAddress,
            staticSelector: selectorOne, 
            staticExtradata: paramsOne, 
            maximumFill: 1, 
            listingTime: '0', 
            expirationTime: '10000000000', 
            salt: '11'
         }
         const exchangeContract = await new web3.eth.Contract(WyvernExchangeABI.abi, exchangeContractAddress);
         const wrapExchange = await wrap(exchangeContract);
         const oneData = wrapExchange.getSignData(one, exchangeContractAddress);
         console.log(oneData);

         const sign = await getSign(JSON.stringify(oneData));
         console.log(sign);
         
         await contract.methods.placeOffering(tokenId, toWei(price, "ether"), sign).send({
            from: walletAddress,
            gas: 3000000
         });
      }
      return true;
   } catch(e) {
      console.log(e);
   }

   return false;
}

const getSign = async (data) => {
   try {
      const walletAddress = await connectWallet();
      if (walletAddress !== undefined) {
         let params = [walletAddress, data];
         return window.ethereum.request({
            method: 'eth_signTypedData_v4',
            params: params
         });
      }
   } catch (e) {
      console.log(e);
   }

   return undefined;
}

