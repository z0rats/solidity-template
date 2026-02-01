// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.33;

import { Token721 } from "../Token721.sol";
import { Test } from "forge-std/Test.sol";
import { IERC721Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract Token721Test is Test, IERC721Errors {
  Token721 token;
  address owner;
  address alice;
  address bob;

  function setUp() public {
    owner = address(this);
    alice = makeAddr("alice");
    bob = makeAddr("bob");
    token = new Token721("Token721", "TKN721", owner);
  }

  /* ---------- Constructor ---------- */

  function test_Constructor_SetsNameSymbolAndOwner() public view {
    assertEq(token.name(), "Token721");
    assertEq(token.symbol(), "TKN721");
    assertEq(token.owner(), owner);
  }

  function test_Constructor_InitialBalanceZero() public view {
    assertEq(token.balanceOf(owner), 0);
  }

  /* ---------- safeMint ---------- */

  function test_SafeMint_OnlyOwner_Succeeds() public {
    token.safeMint(alice, 1);
    assertEq(token.ownerOf(1), alice);
    assertEq(token.balanceOf(alice), 1);
  }

  function test_SafeMint_NonOwner_Reverts() public {
    vm.prank(bob);
    vm.expectRevert(
      abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", bob)
    );
    token.safeMint(alice, 1);
  }

  function test_SafeMint_ToZeroAddress_Reverts() public {
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC721Errors.ERC721InvalidReceiver.selector,
        address(0)
      )
    );
    token.safeMint(address(0), 1);
  }

  function test_SafeMint_DuplicateTokenId_Reverts() public {
    token.safeMint(alice, 1);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC721Errors.ERC721InvalidSender.selector,
        address(0)
      )
    );
    token.safeMint(bob, 1);
  }

  function test_SafeMint_UpdatesBalanceAndOwnerOf() public {
    token.safeMint(alice, 1);
    token.safeMint(alice, 2);
    assertEq(token.balanceOf(alice), 2);
    assertEq(token.ownerOf(1), alice);
    assertEq(token.ownerOf(2), alice);
  }

  /* ---------- transfer (ERC721) ---------- */

  function test_TransferFrom_Owner_Succeeds() public {
    token.safeMint(alice, 1);
    vm.prank(alice);
    token.transferFrom(alice, bob, 1);
    assertEq(token.ownerOf(1), bob);
    assertEq(token.balanceOf(alice), 0);
    assertEq(token.balanceOf(bob), 1);
  }

  function test_TransferFrom_NonOwner_Reverts() public {
    token.safeMint(alice, 1);
    vm.prank(bob);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC721Errors.ERC721InsufficientApproval.selector,
        bob,
        1
      )
    );
    token.transferFrom(alice, bob, 1);
  }
}
