import { useEffect, useState } from 'react';
import { setInterval } from 'timers';
import './App.scss';
import SaleModal from './component/modal/sale.modal.component';
import BuyModal from './component/modal/buy.modal.component';
import {connectWallet, getOwnedNFT, mintNFT, getOfferedNFT, placeOffering, tradeNFT, closeOffering } from './utils/walletConnect/metamaskConnect';

function App() {
  const [walletAddress, setWalletAddress] = useState("Connect");
  const [nftAmount, setNFTAmount] = useState(0);
  const [ownedNFT, setOwnedNFT] = useState(undefined);
  const [offeredNFT, setOfferedNFT] = useState(undefined);
  const [nftPrice, setNFTPrice] = useState(0);
  const [saleModalOpened, setSaleModalOpened] = useState(false);
  const [buyModalOpened, setBuyModalOpened] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState();

  const walletConnect = async() => {
    const walletAddress = await connectWallet();
    if (walletAddress !== undefined) {
      setWalletAddress(walletAddress);
    }
  }

  useEffect(() => {
    initData();
    setInterval(initData, 1500);
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
      setOwnedNFT(ownedNFTs);
    } catch (e) {
      console.log(e);
    }
  }

  const getNFTOffered = async () => {
    try {
      const offeredNFT = await getOfferedNFT();
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

  const listBuyOffering = (item) => {
    setSelectedNFT(item);
    setBuyModalOpened(true);
  }

  const saleNFT = async () => {
    try {
      const succeed = await placeOffering(selectedNFT.tokenID, nftPrice);
      if (succeed === true) {
        await getNFTOffered();
        setSaleModalOpened(false);
      }
    } catch(e) {
      console.log(e);
    }
  }

  const closeOffer = async () => {
    try {
      const succeed = await closeOffering(selectedNFT.tokenID);
      if (succeed === true) {
        await getNFTOffered();
        setBuyModalOpened(false);
      }
    } catch(e) {
      console.log(e);
    }
  }

  const buyNFT = async () => {
    try {
      alert("Do you want to buy NFT?");
      const succeed = await tradeNFT(selectedNFT.tokenID, selectedNFT.price);
      if (succeed === true) {
        await getNFTOffered();
        await getOwnedNFT();
        setSaleModalOpened(false);
      }
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
              ownedNFT !== undefined && 
              ownedNFT.map(item => (
                <li className="sub-item" key={item.tokenID} onClick={() => listSaleOffering(item)}>
                  <p className="txt-name">{item.title}</p>
                </li>
              ))
            }
          </ul>

          <ul className="div-saleNFT">
            {
              offeredNFT !== undefined && 
              offeredNFT.map(item => (
                <li className="div-offered" key={item.tokenID} onClick={() => listBuyOffering(item)}>
                  <p className="txt-name">{item.title}</p>
                  <p className="txt-price">{item.price}(TST)</p>
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

      <BuyModal 
      isOpened = {buyModalOpened}
      setIsOpened = {setBuyModalOpened}
      closeOffer = {closeOffer}
      buyNFT = {buyNFT}
      />
    </div>
  );
}

export default App;
