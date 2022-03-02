import { useEffect, useState } from 'react';
import { AbiItem, toWei } from 'web3-utils';
import Web3 from 'web3';
import './App.scss';
import { pinJSONToIPFS } from './minter';
import nftContract from "./contract/token.abi.json";
import { walletConnection, connectWallet, getOwnedNFT, mintNFT, setBaseURI, getOfferedNFT, placeOffering } from './utils/walletConnect/metamaskConnect';
import SaleModal from './component/modal/sale.modal.component';

function App() {
  const [walletAddress, setWalletAddress] = useState("Connect");
  const [nftAmount, setNFTAmount] = useState(0);
  const [ownedNFT, setOwnedNFT] = useState(undefined);
  const [offeredNFT, setOfferedNFT] = useState(undefined);
  const [nftPrice, setNFTPrice] = useState(0);
  const [saleModalOpened, setSaleModalOpened] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState();
  let curWalletAddress = "";

  const contractAddress = "0x1c5202f478FE8360Ff05250755069935D3B7f6E7";
  const web3js = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/c9cd2f00130e437a9ea32928c21f554d'));

  async function checkAccount() {
    let web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    curWalletAddress = accounts[0];
    setWalletAddress(curWalletAddress);
  }

  const walletConnect = async() => {
    const walletAddress = await connectWallet();
    if (walletAddress != undefined) {
      setWalletAddress(walletAddress);
    }
  }

  useEffect(() => {
    initData();
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
      } else {
        setWalletAddress("Connect");
      }
    });
  }, []);

  const initData = async () => {
    try {
      await walletConnect();
      await getNFTs();
      await getNFTOffered();
    } catch(e) {
      console.log(e);
    }
  }

  const getNFTs = async () => {
    try {
      const ownedNFTs = await getOwnedNFT();
      console.log(ownedNFTs);
      setOwnedNFT(ownedNFTs);
    } catch (e) {
      console.log(e);
    }
  }

  const getNFTOffered = async () => {
    try {
      const offeredNFT = await getOfferedNFT();
      console.log(offeredNFT);
      setOfferedNFT(offeredNFT);
    } catch (e) {
      console.log(e);
    }
  }

  const onChangeAmount = (e) => {
    setNFTAmount(e.target.value);
  }

  const onMintClick = async () => {
    if (nftAmount <= 0) {
      alert("Please input correct amount");
      return;
    }

    await mintNFT(nftAmount);
    await getNFTs();

    // await setBaseURI();
  }

  const listSaleOffering = (item) => {
    setSelectedNFT(item);
    setSaleModalOpened(true);
  }

  const saleNFT = async () => {
    try {
      await placeOffering(selectedNFT.tokenID, nftPrice);
      await getNFTOffered();
    } catch(e) {
      console.log(e);
    }
  }

  return (
    <div className="App">
      <header className="header">
        <div className="div-wallet" onClick={() => walletConnect()}>
          <p className="txt-wallet">{walletAddress}</p>
        </div>
      </header>

      <div className="div-body">
        <div className="div-action">
          <div className="div-mint">
            <input className="input-amount" value={nftAmount} onChange={(e) => onChangeAmount(e)} />
            <button className="btn-mint" onClick={() => onMintClick()}>Mint</button>
          </div>
        </div>
        <div className="div-detail">
          <ul className="div-userNFT">
            {
              ownedNFT != undefined && 
              ownedNFT.map(item => (
                <li className="sub-item" key={item.tokenID} onClick={() => listSaleOffering(item)}>
                  <p className="txt-name">{item.title}</p>
                </li>
              ))
            }
          </ul>

          <ul className="div-saleNFT">
            {
              offeredNFT != undefined && 
              offeredNFT.map(item => (
                <li className="div-offered" key={item.tokenID}>
                  <p className="txt-name">{item.title}</p>
                  <p className="txt-price">{item.price}</p>
                </li>
              ))
            }
          </ul>

        </div>
      </div>

      <SaleModal 
        nftPrice = {nftPrice}
        setNFTPrice = {setNFTPrice}
        isOpened = {saleModalOpened}
        setIsOpened = {setSaleModalOpened}
        saleNFT = {saleNFT}
      />
    </div>
  );
}

export default App;
