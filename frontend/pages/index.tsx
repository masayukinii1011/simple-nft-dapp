import React, { useState } from "react";
import Web3 from "web3";
import { NFTStorage } from "nft.storage";

const NFT_STORAGE_API_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY || "";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT || "";
const WALLET_ADDRESS = process.env.NEXT_PUBLIC_WALLET_ADDRESS || "";
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";
const PROVIDER_URL = `https://eth-rinkeby.alchemyapi.io/v2/${
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ""
}`;

const fileUpload = async (file: File): Promise<string> => {
  const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });
  await client.store({
    name: file.name,
    description: file.name,
    image: file,
  }).then(metadata => {
    const url = new URL(metadata.url);
    const jsonUrl = `https://ipfs.io/ipfs/${url.hostname}${url.pathname}`;
    console.log(jsonUrl);
    return jsonUrl
  }).catch(err => {
    console.log(err);
  })
  return ""
};

const mint = async (tokenUrl: string) => {
  const web3 = new Web3(PROVIDER_URL);
  const contract = require("../abi/NFT.json");
  const nftContract = new web3.eth.Contract(contract.abi, CONTRACT_ADDRESS);
  const nonce = await web3.eth.getTransactionCount(WALLET_ADDRESS, "latest");
  const tx = {
    from: WALLET_ADDRESS,
    to: CONTRACT_ADDRESS,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.mint(WALLET_ADDRESS, tokenUrl).encodeABI(),
  };

  web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
    .then((signedTx) => {
      const tx = signedTx.rawTransaction;
      if (tx) {
        web3.eth.sendSignedTransaction(tx, (err, hash) => {
          if (!err) {
            console.log("The hash of your transaction is: ", hash);
          } else {
            console.log("Something went wrong when submitting your transaction:", err);
          }
        });
      }
    })
    .catch((err) => {
      console.log("Promise failed:", err);
    });
};

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [jsonUrl, setJsonUrl] = useState("")
  const [message, setMessage] = useState("")

  return (
    <div>
      <div>
        <input
          type="file"
          placeholder="ファイルを選択"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFile(e?.target?.files ? e.target.files[0] : null)
          }}
        />
      </div>
      <div>
        <button
          disabled={!file}
          onClick={async () => {
            if(!file) return
            try {
              const res = await fileUpload(file)
              setJsonUrl(res)
              setMessage("アップロードに成功しました")
            } catch {
              setMessage("アップロードに失敗しました")
            }
          }}
        >
          ファイルをアップロード
        </button>
      </div>
      <div>
        <button
          disabled={!jsonUrl}
          onClick={async () => {
            try {
              await mint(jsonUrl)
              setMessage("mintに成功しました")
            } catch {
              setMessage("mintに失敗しました")
            }
          }}
        >
          MINT
        </button>
        <div>{message}</div>
      </div>
    </div>
  );
}

export default Home
