import React from "react";
import { ethers } from "ethers";
import {abi,bytecode} from "../../contracts/artifacts/contracts/NFT.sol/NFT.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
let address = ""

const buttonDeploy = async() => {
  const signer = provider.getSigner();
  const factory = new ethers.ContractFactory(abi,bytecode,signer);
  const contract = await factory.deploy();
  address = contract.address;
  console.log(contract);
  console.log(address);
  const net = await signer.provider.getNetwork();
  if( net.chainId == 4) console.log("https://rinkeby.etherscan.io/tx/" + contract.deployTransaction.hash);
};

const buttonGetName = async() => {
  const contract = new ethers.Contract(address, abi, provider);
  console.log(await contract.name())
  console.log(address);
};

const buttonMint = async() => {
  const signer = provider.getSigner();
  const contract = new ethers.Contract(address, abi, provider);
  const { hash } = await contract.connect(signer).mint(signer.getAddress());
  console.log(contract);
  console.log(address);
  const net = await signer.provider.getNetwork();
  if( net.chainId == 4) console.log("https://rinkeby.etherscan.io/tx/" + hash);
};

const buttonSupply = async() => {
  const contract = new ethers.Contract(address, abi, provider);
  console.log(address);
  console.log(await contract.totalSupply());
};

const Home: React.FC = () => {
  return (
    <div className="App">
    <button id="test" onClick={buttonDeploy}>NFT deploy</button><br/>
    <button id="test1" onClick={buttonGetName}>NFT get name</button><br/>
    <button id="test2" onClick={buttonMint}>NFT mint</button><br/>
    <button id="test2" onClick={buttonSupply}>NFT totalSupply</button>
    </div>
  );
}

export default Home
