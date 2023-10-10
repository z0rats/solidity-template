import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import { Token1155, Token1155__factory } from "../typechain-types";
import { snapshot, zeroAddr } from "./utils";

// Test data
const name = "Token1155";
const symbol = "TKN";
const uri = "https://gateway.pinata.cloud/ipfs/uri/{id}.json";
const mintIds = [0, 1];
const mintAmounts = [5, 15];
const data = "0x";

describe("ERC1155 Token", function () {
  let nft: Token1155,
    owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    snapId: string;

  before(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    nft = await new Token1155__factory(owner).deploy(owner.address, name, symbol, uri);

    await nft.mintBatch(owner.address, mintIds, mintAmounts, data);
    await nft.mintBatch(alice.address, mintIds, mintAmounts, data);
  });

  beforeEach(async () => {
    snapId = await snapshot.take();
  });

  afterEach(async () => {
    await snapshot.restore(snapId);
  });

  describe("Deployment", function () {
    it("Has a uri", async () => {
      expect(await nft.uri(1)).to.be.equal(uri);
    });

    it("Should set the correct owner of the contract", async () => {
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("URI", function () {
    it("Can change URI", async () => {
      await nft.setURI("new-uri");
      expect(await nft.uri(0)).to.be.equal("new-uri");
    });
  });

  describe("Ownership", function () {
    it("Only owner can mint items", async () => {
      await expect(
        nft.connect(alice).mintBatch(alice.address, mintIds, mintAmounts, data)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("Only owner can set uri", async () => {
      await expect(
        nft.connect(alice).setURI(uri)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  describe("Minting", function () {
    it("Mint batch emits event", async () => {
      await expect(nft.mintBatch(owner.address, mintIds, mintAmounts, data))
        .to.emit(nft, "TransferBatch")
        .withArgs(owner.address, zeroAddr, owner.address, mintIds, mintAmounts);
    });

    it("Can't mint to zero address", async () => {
      await expect(
        nft.mintBatch(zeroAddr, mintIds, mintAmounts, data)
      ).to.be.revertedWithCustomError(nft, "ERC1155InvalidReceiver");
    });
  });

  describe("Approve", function () {
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
  });

  describe("Transfers", function () {
    it("safeTransfer from emits event", async () => {
      await expect(
        nft.safeTransferFrom(owner.address, alice.address, 0, 2, data)
      )
        .to.emit(nft, "TransferSingle")
        .withArgs(owner.address, owner.address, alice.address, 0, 2);
    });

    it("safeBatchTransfer from emits event", async () => {
      await expect(
        nft.safeBatchTransferFrom(
          owner.address,
          alice.address,
          [0, 1],
          [1, 1],
          data
        )
      )
        .to.emit(nft, "TransferBatch")
        .withArgs(owner.address, owner.address, alice.address, [0, 1], [1, 1]);
    });

    it("Can't transfer from if caller is not owner or approved", async () => {
      await expect(
        nft.safeTransferFrom(alice.address, owner.address, 0, 2, data)
      ).to.be.revertedWithCustomError(nft, "ERC1155MissingApprovalForAll");
      await expect(
        nft.safeBatchTransferFrom(
          alice.address,
          owner.address,
          [0, 1],
          [1, 1],
          data
        )
      ).to.be.revertedWithCustomError(nft, "ERC1155MissingApprovalForAll");
    });
  });

  describe("Getting item data", function () {
    it("Can get balanceOf", async () => {
      expect(await nft.balanceOf(owner.address, 0)).to.be.equal(mintAmounts[0]);
    });

    it("Can get balanceOfBatch", async () => {
      const balances = await nft.balanceOfBatch(
        [owner.address, alice.address],
        mintIds
      );
      expect(balances[0]).to.be.equal(mintAmounts[0]);
      expect(balances[1]).to.be.equal(mintAmounts[1]);
    });
  });
});
