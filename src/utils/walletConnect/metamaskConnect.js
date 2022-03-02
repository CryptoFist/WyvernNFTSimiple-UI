import react from "react";
import Web3 from 'web3';
import { soliditySha3 } from "web3-utils";
import TokenABI from "../../contract/azuki.abi.json";

const web3js = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/c9cd2f00130e437a9ea32928c21f554d'));
const contractAddress = "0x527671eA4EC8e044a3073c2A671d4207Ad60F1C8";

export const isMetamaskDecteced = async () => {
  try {
    if (window.ethereum != undefined) {
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
         
         const contract = await new web3.eth.Contract(TokenABI.abi, contractAddress);
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
         
         const contract = await new web3.eth.Contract(TokenABI.abi, contractAddress);
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
         
         const contract = await new web3.eth.Contract(TokenABI.abi, contractAddress);
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
            tokenData.price = offeredNFT[i].price;
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
         
         const contract = await new web3.eth.Contract(TokenABI.abi, contractAddress);
         await contract.methods.safeMint(walletAddress, nftAmount).send({
            from: walletAddress,
            gas: 300000
         });
      }
   } catch (e) {
      console.log(e);
   }
}

export const placeOffering = async (tokenId, price) => {
   try {
      const walletAddress = await connectWallet();
      if (walletAddress !== undefined) {
         const web3 = new Web3(window.ethereum);
         
         const contract = await new web3.eth.Contract(TokenABI.abi, contractAddress);
         await contract.methods.placeOffering(tokenId, price).send({
            from: walletAddress,
            gas: 300000
         });
      }
   } catch(e) {
      console.log(e);
   }
}

