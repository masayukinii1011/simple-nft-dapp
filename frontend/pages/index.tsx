import React, { useEffect, useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import UploadAndMint from "../components/uploadAndMint";
import InstallMetaMask from "../components/installMetaMask";
import ConnectMetaMask from "../components/connectMetaMask";

const connectWallet = async (): Promise<string> => {
  try {
    const res = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const walletAddress = res[0];
    return walletAddress;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const Home: React.FC = () => {
  const [hasWallet, setHasWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    (async () => {
      if (!hasWallet) {
        const provider = await detectEthereumProvider({ mustBeMetaMask: true });
        if (provider && window.ethereum.isMetaMask) {
          setHasWallet(true);
        }
      }
      if (hasWallet && !walletAddress) {
        const address = await connectWallet();
        if (address) setWalletAddress(address);
      }
    })();
  }, [hasWallet, walletAddress]);

  if (!hasWallet) {
    return <InstallMetaMask />;
  }
  if (hasWallet && !walletAddress) {
    return <ConnectMetaMask />;
  }
  if (hasWallet && walletAddress) {
    return <UploadAndMint walletAddress={walletAddress} />;
  }
  return null;
};

export default Home;
