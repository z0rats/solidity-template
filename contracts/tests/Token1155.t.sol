// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.33;

import { Token1155 } from "../Token1155.sol";
import { Test } from "forge-std/Test.sol";
import { IERC1155Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract Token1155Test is Test, IERC1155Errors {
  Token1155 token;
  address owner;
  address alice;
  address bob;

  function setUp() public {
    owner = address(this);
    alice = makeAddr("alice");
    bob = makeAddr("bob");
    token = new Token1155(
      owner,
      "Token1155",
      "TKN1155",
      "https://example.com/{id}.json"
    );
  }

  /* ---------- Constructor ---------- */

  function test_Constructor_SetsNameSymbolAndOwner() public view {
    assertEq(token.name(), "Token1155");
    assertEq(token.symbol(), "TKN1155");
    assertEq(token.owner(), owner);
  }

  function test_Constructor_SetsUri() public view {
    assertEq(token.uri(1), "https://example.com/{id}.json");
  }

  function test_Constructor_InitialBalanceZero() public view {
    assertEq(token.balanceOf(alice, 1), 0);
  }

  /* ---------- mintBatch ---------- */

  function test_MintBatch_OnlyOwner_Succeeds() public {
    uint256[] memory ids = new uint256[](2);
    ids[0] = 1;
    ids[1] = 2;
    uint256[] memory amounts = new uint256[](2);
    amounts[0] = 100;
    amounts[1] = 50;
    token.mintBatch(alice, ids, amounts, "");
    assertEq(token.balanceOf(alice, 1), 100);
    assertEq(token.balanceOf(alice, 2), 50);
  }

  function test_MintBatch_NonOwner_Reverts() public {
    uint256[] memory ids = new uint256[](1);
    ids[0] = 1;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = 100;
    vm.prank(bob);
    vm.expectRevert(
      abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", bob)
    );
    token.mintBatch(alice, ids, amounts, "");
  }

  function test_MintBatch_ArrayLengthMismatch_Reverts() public {
    uint256[] memory ids = new uint256[](2);
    ids[0] = 1;
    ids[1] = 2;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = 100;
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC1155Errors.ERC1155InvalidArrayLength.selector,
        2,
        1
      )
    );
    token.mintBatch(alice, ids, amounts, "");
  }

  function test_MintBatch_ToZeroAddress_Reverts() public {
    uint256[] memory ids = new uint256[](1);
    ids[0] = 1;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = 100;
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC1155Errors.ERC1155InvalidReceiver.selector,
        address(0)
      )
    );
    token.mintBatch(address(0), ids, amounts, "");
  }

  /* ---------- setURI ---------- */

  function test_SetURI_OnlyOwner_Succeeds() public {
    token.setURI("https://new.example.com/{id}.json");
    assertEq(token.uri(1), "https://new.example.com/{id}.json");
  }

  function test_SetURI_NonOwner_Reverts() public {
    vm.prank(bob);
    vm.expectRevert(
      abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", bob)
    );
    token.setURI("https://new.example.com/{id}.json");
  }

  /* ---------- safeTransferFrom (ERC1155) ---------- */

  function test_SafeTransferFrom_Owner_Succeeds() public {
    uint256[] memory ids = new uint256[](1);
    ids[0] = 1;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = 100;
    token.mintBatch(alice, ids, amounts, "");
    vm.prank(alice);
    token.safeTransferFrom(alice, bob, 1, 30, "");
    assertEq(token.balanceOf(alice, 1), 70);
    assertEq(token.balanceOf(bob, 1), 30);
  }

  function test_SafeTransferFrom_ExceedsBalance_Reverts() public {
    uint256[] memory ids = new uint256[](1);
    ids[0] = 1;
    uint256[] memory amounts = new uint256[](1);
    amounts[0] = 100;
    token.mintBatch(alice, ids, amounts, "");
    vm.prank(alice);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC1155Errors.ERC1155InsufficientBalance.selector,
        alice,
        100,
        150,
        1
      )
    );
    token.safeTransferFrom(alice, bob, 1, 150, "");
  }
}
