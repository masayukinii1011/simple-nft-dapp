import React, { useState } from "react";
import { NFTStorage } from "nft.storage";
import { BytesLike, ethers } from "ethers";
import NFTContract from "../abi/NFT.json";

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "";
const NFT_STORAGE_API_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY || "";

const fileUpload = async (file: File): Promise<string> => {
  const storageClient = new NFTStorage({ token: NFT_STORAGE_API_KEY });

  try {
    const metadata = await storageClient.store({
      name: new Date().getTime() + file.name,
      description: file.name,
      image: file,
    });
    const url = new URL(metadata.url);
    const jsonUrl = `https://ipfs.io/ipfs/${url.hostname}${url.pathname}`;
    console.log(jsonUrl);
    return jsonUrl;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const mintNFTFile = async (
  walletAddress: string,
  walletPrivateKey: BytesLike,
  tokenUrl: string
): Promise<void> => {
  const provider = ethers.getDefaultProvider("rinkeby");
  const wallet = new ethers.Wallet(walletPrivateKey, provider);
  const contract = new ethers.Contract(
    NFT_CONTRACT_ADDRESS,
    NFTContract.abi,
    provider
  );
  const contractWithSigner = contract.connect(wallet);
  const { mintNFT } = contractWithSigner.functions;

  try {
    const res = await mintNFT(walletAddress, tokenUrl);
    console.log(res);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

type Props = {
  walletAddress: string;
};

const UploadAndMint: React.FC<Props> = ({ walletAddress }) => {
  const [file, setFile] = useState<File | null>(null);
  const [walletPrivateKey, setWalletPrivateKey] = useState<BytesLike>("");
  const [jsonUrl, setJsonUrl] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div>
      <div>
        <input
          type="file"
          placeholder="ファイルを選択"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFile(e?.target?.files ? e.target.files[0] : null);
          }}
        />
      </div>
      <div>
        <button
          disabled={!file}
          onClick={async () => {
            if (!file) return;
            try {
              const jsonUrl = await fileUpload(file);
              setJsonUrl(jsonUrl);
              setMessage("アップロードに成功しました");
            } catch {
              setMessage("アップロードに失敗しました");
            }
          }}
        >
          ファイルをアップロード
        </button>
      </div>
      <div>
        <input
          placeholder="秘密鍵の入力"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setWalletPrivateKey(e.target.value);
          }}
        />
      </div>
      <div>
        <button
          disabled={!jsonUrl || !walletPrivateKey}
          onClick={async () => {
            try {
              await mintNFTFile(walletAddress, walletPrivateKey, jsonUrl);
              setMessage("mintに成功しました");
            } catch {
              setMessage("mintに失敗しました");
            }
          }}
        >
          MINT
        </button>
        <div>{message}</div>
      </div>
    </div>
  );
};

export default UploadAndMint;
