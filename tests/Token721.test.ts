import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import { Token721, Token721__factory } from "../typechain-types";

import { zeroAddr, snapshot } from "./utils";

// Test dataNFT
const name = "Token721";
const symbol = "nft";
const itemURI = "https://gateway.pinata.cloud/ipfs/uri/1.json";

describe("ERC721 Token", function () {
  // This can be used if tests are too long
  // this.timeout(60000);

  let nft: Token721,
    owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    snapId: string;

  before(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    nft = await new Token721__factory(owner).deploy(name, symbol);

    await nft.safeMint(owner.address, itemURI);
    await nft.safeMint(alice.address, itemURI);
  });

  beforeEach(async () => {
    snapId = await snapshot.take();
  });

  afterEach(async () => {
    await snapshot.restore(snapId);
  });

  describe("Deployment", function () {
    it("Has a correct init params", async () => {
      expect(await nft.name()).to.be.equal(name);
      expect(await nft.symbol()).to.be.equal(symbol);
      expect(await nft.owner()).to.be.equal(owner.address);
    });
  });

  describe("Ownership", function () {
    it("Only owner can mint items", async () => {
      await expect(
        nft.connect(alice).safeMint(bob.address, itemURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Approve", function () {
    it("Approve emits event", async () => {
      await expect(nft.approve(alice.address, 1))
        .to.emit(nft, "Approval")
        .withArgs(owner.address, alice.address, 1);
    });

    it("Can get approved account", async () => {
      await nft.approve(alice.address, 1);
      expect(await nft.getApproved(1)).to.be.equal(alice.address);
      expect(await nft.getApproved(2)).to.be.equal(zeroAddr);
    });

    it("Approval for all emits event", async () => {
      await expect(nft.setApprovalForAll(alice.address, true))
        .to.emit(nft, "ApprovalForAll")
        .withArgs(owner.address, alice.address, true);
    });

    it("Can check whether all owner items are approved", async () => {
      await nft.setApprovalForAll(bob.address, true);
      expect(
        await nft.isApprovedForAll(owner.address, bob.address)
      ).to.be.equal(true);
      expect(
        await nft.isApprovedForAll(bob.address, owner.address)
      ).to.be.equal(false);
    });

    it("Can't get approved for nonexistent token", async () => {
      await expect(nft.getApproved(1337)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });

    it("Can't approve to current owner", async () => {
      await expect(nft.approve(owner.address, 1)).to.be.revertedWith(
        "ERC721: approval to current owner"
      );
    });

    it("Can't approve if caller is not owner or approved for all", async () => {
      await expect(nft.approve(bob.address, 2)).to.be.revertedWith(
        "ERC721: approve caller is not token owner or approved for all"
      );
    });
  });

  describe("Transfers", function () {
    it("Transfer from emits event", async () => {
      await expect(nft.transferFrom(owner.address, alice.address, 1))
        .to.emit(nft, "Transfer")
        .withArgs(owner.address, alice.address, 1);
    });

    it("Safe Transfer from emits event", async () => {
      await expect(
        nft["safeTransferFrom(address,address,uint256)"](
          owner.address,
          alice.address,
          1
        )
      )
        .to.emit(nft, "Transfer")
        .withArgs(owner.address, alice.address, 1);
    });

    it("Can't transfer from if caller is not owner or approved for all", async () => {
      await expect(
        nft.transferFrom(owner.address, alice.address, 2)
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
      await expect(
        nft["safeTransferFrom(address,address,uint256)"](
          owner.address,
          alice.address,
          2
        )
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });
  });

  describe("Getting item data", function () {
    it("Can get tokenURI by id", async () => {
      expect(await nft.tokenURI(1)).to.be.equal(itemURI);
    });

    it("Can get item owner by id", async () => {
      expect(await nft.ownerOf(1)).to.be.equal(owner.address);
    });

    it("Can get user balances", async () => {
      expect(await nft.balanceOf(owner.address)).to.be.equal(1);
    });

    it("Can't get owner for nonexistent token", async () => {
      await expect(nft.ownerOf(15)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });

    it("Can't get balance of zero address", async () => {
      await expect(nft.balanceOf(zeroAddr)).to.be.revertedWith(
        "ERC721: address zero is not a valid owner"
      );
    });
  });
});
