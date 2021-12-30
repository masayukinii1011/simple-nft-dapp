import React, { useState } from "react";
import { NFTStorage } from "nft.storage";
import { BytesLike, ethers } from "ethers";
import NFTContract from "../abi/NFT.json";

const NFT_STORAGE_API_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY || "";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT || "";
const WALLET_ADDRESS = process.env.NEXT_PUBLIC_WALLET_ADDRESS || "";

const fileUpload = async (file: File): Promise<string> => {
  const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });
  try {
    const metadata = await client.store({
      name: file.name,
      description: file.name,
      image: file,
    })
    const url = new URL(metadata.url);
    const jsonUrl = `https://ipfs.io/ipfs/${url.hostname}${url.pathname}`;
    console.log(jsonUrl);
    return jsonUrl
  } catch(err) {
    console.error(err);
    throw err
  }
};

const mintNFTFile = async (tokenUrl: string): Promise<void> => {
  const provider = ethers.getDefaultProvider("rinkeby");
  const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY as BytesLike;
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTContract.abi, provider);
  const contractWithSigner = contract.connect(wallet);
  const { mintNFT } =  contractWithSigner.functions

  try {
    const res = await mintNFT(WALLET_ADDRESS, tokenUrl)
    console.log(res)
  } catch(err) {
    console.error(err)
    throw err
  }
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
              await mintNFTFile(jsonUrl)
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
