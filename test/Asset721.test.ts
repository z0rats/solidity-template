import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { Asset721, Asset721__factory } from "../types";

import { snapshot } from "./utils";

// NFT metadata
const name = "Asset721";
const symbol = "nft721";

// Test data
const zeroAddr = ethers.constants.AddressZero;
const itemURI = "https://gateway.pinata.cloud/ipfs/uri/1.json";

describe("Academy721", function () {
  let nft: Asset721,
    owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    snapId: string;

  before(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    nft = await new Asset721__factory(owner).deploy(name, symbol);
    await nft.deployed();
  });

  beforeEach(async () => {
    snapId = await snapshot.take();
    await nft.safeMint(owner.address, itemURI);
    await nft.safeMint(alice.address, itemURI);
  });

  afterEach(async () => {
    await snapshot.restore(snapId);
  });

  describe("Deployment", function () {
    it("Has a name", async () => {
      expect(await nft.name()).to.be.equal(name);
    });

    it("Has a symbol", async () => {
      expect(await nft.symbol()).to.be.equal(symbol);
    });

    it("Should set the correct owner of the contract", async () => {
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("Ownership", function () {
    it("Only owner can mint items", async () => {
      await expect(nft.connect(alice).safeMint(bob.address, itemURI)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
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
      expect(await nft.isApprovedForAll(owner.address, bob.address)).to.be.equal(true);
      expect(await nft.isApprovedForAll(bob.address, owner.address)).to.be.equal(false);
    });

    it("Can't get approved for nonexistent token", async () => {
      await expect(nft.getApproved(1337)).to.be.revertedWith(
        "ERC721: approved query for nonexistent token"
      );
    });

    it("Can't approve to current owner", async () => {
      await expect(nft.approve(owner.address, 1)).to.be.revertedWith(
        "ERC721: approval to current owner"
      );
    });

    it("Can't approve if caller is not owner nor approved for all", async () => {
      await expect(nft.approve(bob.address, 2)).to.be.revertedWith(
        "ERC721: approve caller is not owner nor approved for all"
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
        nft["safeTransferFrom(address,address,uint256)"](owner.address, alice.address, 1)
      )
        .to.emit(nft, "Transfer")
        .withArgs(owner.address, alice.address, 1);
    });

    it("Can't transfer from if caller is not owner nor approved for all", async () => {
      await expect(nft.transferFrom(owner.address, alice.address, 2)).to.be.revertedWith(
        "ERC721: transfer caller is not owner nor approved"
      );
      await expect(
        nft["safeTransferFrom(address,address,uint256)"](owner.address, alice.address, 2)
      ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
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
        "ERC721: owner query for nonexistent token"
      );
    });

    it("Can't get balance of zero address", async () => {
      await expect(nft.balanceOf(zeroAddr)).to.be.revertedWith(
        "ERC721: balance query for the zero address"
      );
    });
  });
});
