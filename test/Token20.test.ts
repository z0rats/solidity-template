import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { Token20, Token20__factory } from "../typechain-types";

import { roles, snapshot } from "./utils";

// Test data
const tokenName = "Token20";
const symbol = "CRPT";
const decimals = 18;
const tenTokens = ethers.utils.parseUnits("10.0", decimals);
const twentyTokens = ethers.utils.parseUnits("20.0", decimals);

describe("ERC20 Token", function () {
  // This can be used if tests are too long
  // this.timeout(60000);

  let token: Token20,
    owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    snapId: string;

  before(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    token = await new Token20__factory(owner).deploy(tokenName, symbol);
    await token.deployed();

    // Grant roles and mint some tokens
    await token.grantRole(roles.minter, alice.address);
    await token.grantRole(roles.burner, bob.address);
    const amount = ethers.utils.parseUnits("1000.0", decimals);
    await token.connect(alice).mint(owner.address, amount);
    // await token.connect(alice).mint(alice.address, amount);
    await token.connect(alice).mint(bob.address, amount);
  });

  beforeEach(async () => {
    snapId = await snapshot.take();
  });

  afterEach(async () => {
    await snapshot.restore(snapId);
  });

  describe("Deployment", function () {
    it("Has correct init params", async () => {
      expect(await token.name()).to.be.equal(tokenName);
      expect(await token.symbol()).to.be.equal(symbol);
      expect(await token.decimals()).to.be.equal(decimals);
      expect(await token.hasRole(roles.admin, owner.address)).to.be.equal(true);
      expect(await token.hasRole(roles.minter, alice.address)).to.be.equal(
        true
      );
      expect(await token.hasRole(roles.burner, bob.address)).to.be.equal(true);
    });
  });

  describe("Ownership", function () {
    it("Only admin can grant roles", async () => {
      await expect(
        token.connect(alice).grantRole(roles.burner, alice.address)
      ).to.be.revertedWith(
        `AccessControl: account ${alice.address.toLowerCase()} is missing role ${
          roles.admin
        }`
      );
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens between accounts", async () => {
      // Transfer 20 tokens from owner to Alice
      const amount: BigNumber = ethers.utils.parseUnits("20.0", decimals);
      await token.transfer(alice.address, amount);
      const aliceBalance = await token.balanceOf(alice.address);
      expect(aliceBalance).to.be.equal(amount);
    });

    it("Should fail if sender doesn't have enough tokens", async () => {
      // Trying to send 10 tokens from Alice (0 tokens) to owner (1000 tokens)
      await expect(
        token.connect(alice).transfer(owner.address, tenTokens)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.balanceOf(owner.address)).to.be.equal(ownerBalance);
    });

    it("Can not transfer above the amount", async () => {
      await expect(
        token.transfer(
          alice.address,
          ethers.utils.parseUnits("1000.01", decimals)
        )
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Transfer should emit event", async () => {
      const from = owner.address;
      const to = alice.address;
      const amount = tenTokens;

      await expect(token.transfer(to, amount))
        .to.emit(token, "Transfer")
        .withArgs(from, to, amount);
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      const initialAliceBalance = await token.balanceOf(alice.address);
      const initialBobBalance = await token.balanceOf(bob.address);

      // Transfer 10 tokens from owner to Alice
      await token.transfer(alice.address, tenTokens);
      // Transfer another 10 tokens from owner to Bob
      await token.transfer(bob.address, tenTokens);

      // Check balances
      const finalOwnerBalance = await token.balanceOf(owner.address);
      expect(finalOwnerBalance).to.be.equal(
        initialOwnerBalance.sub(twentyTokens)
      );

      const aliceBalance = await token.balanceOf(alice.address);
      expect(aliceBalance).to.be.equal(initialAliceBalance.add(tenTokens));

      const bobBalance = await token.balanceOf(bob.address);
      expect(bobBalance).to.be.equal(initialBobBalance.add(tenTokens));
    });
  });

  describe("Allowance", function () {
    it("Approve should emit event", async () => {
      const amount = tenTokens;
      await expect(token.approve(alice.address, amount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, alice.address, amount);
    });

    it("Allowance should change after token approve", async () => {
      await token.approve(alice.address, tenTokens);
      const allowance = await token.allowance(owner.address, alice.address);
      expect(allowance).to.be.equal(tenTokens);
    });

    it("TransferFrom should emit event", async () => {
      const amount = tenTokens;
      await token.approve(alice.address, amount);
      await expect(
        token.connect(alice).transferFrom(owner.address, alice.address, amount)
      )
        .to.emit(token, "Transfer")
        .withArgs(owner.address, alice.address, amount);
    });

    it("Can not TransferFrom above the approved amount", async () => {
      // Approve 10 tokens to Alice
      await token.approve(alice.address, tenTokens);
      // Trying to transfer 20 tokens
      await expect(
        token
          .connect(alice)
          .transferFrom(owner.address, alice.address, twentyTokens)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Can not TransferFrom if owner does not have enough tokens", async () => {
      // Approve Alice to use 10 tokens
      await token.approve(alice.address, tenTokens);

      // Send most of owner tokens to Bob
      await token.transfer(
        bob.address,
        ethers.utils.parseUnits("995.0", decimals)
      );

      // Check that Alice can't transfer all amount (only 5 left)
      await expect(
        token
          .connect(alice)
          .transferFrom(owner.address, alice.address, tenTokens)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  // In our tests Bob has the BURNER_ROLE
  describe("Burning", function () {
    it("Should not be able to burn tokens without BURNER_ROLE", async () => {
      const burnAmount = tenTokens;
      await expect(token.burn(alice.address, burnAmount)).to.be.revertedWith(
        `AccessControl: account ${owner.address.toLowerCase()} is missing role ${
          roles.burner
        }`
      );
    });

    it("Burner should be able to burn tokens", async () => {
      const burnAmount = tenTokens;
      await expect(token.connect(bob).burn(owner.address, burnAmount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, ethers.constants.AddressZero, burnAmount);
    });

    it("Token supply & balance should change after burning", async () => {
      const initialSupply = await token.totalSupply();
      const initialOwnerBalance = await token.balanceOf(owner.address);

      const burnAmount = tenTokens;
      await token.connect(bob).burn(owner.address, burnAmount);

      const currentSupply = await token.totalSupply();
      expect(currentSupply).to.be.equal(initialSupply.sub(burnAmount));

      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.be.equal(initialOwnerBalance.sub(burnAmount));
    });

    it("Can not burn above total supply", async () => {
      const initialSupply = await token.totalSupply();
      await expect(
        token.connect(bob).burn(owner.address, initialSupply)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });

  // In our tests Alice has the MINTER_ROLE
  describe("Minting", function () {
    it("Should not be able to mint tokens without MINTER_ROLE", async () => {
      const mintAmount = tenTokens;
      await expect(token.mint(alice.address, mintAmount)).to.be.revertedWith(
        `AccessControl: account ${owner.address.toLowerCase()} is missing role ${
          roles.minter
        }`
      );
    });

    it("Minter should be able to mint tokens", async () => {
      const mintAmount = tenTokens;
      await expect(token.connect(alice).mint(owner.address, mintAmount))
        .to.emit(token, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, mintAmount);
    });

    it("Token supply & balance should change after minting", async () => {
      const initialSupply = await token.totalSupply();
      const initialOwnerBalance = await token.balanceOf(owner.address);

      const mintAmount = tenTokens;
      await token.connect(alice).mint(owner.address, mintAmount);

      const currentSupply = await token.totalSupply();
      expect(currentSupply).to.be.equal(initialSupply.add(mintAmount));

      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.be.equal(initialOwnerBalance.add(mintAmount));
    });
  });
});
