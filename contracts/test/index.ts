import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT", function () {
  it("NFT basic test", async function () {
    this.timeout(60 * 1000);
    const [signer] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    expect(await nft.name()).to.equal("MyNFT");
    await nft.mintNFT(signer.address, "tokenURI");
    expect(await nft.balanceOf(signer.address)).to.equal(1);
  });
});
