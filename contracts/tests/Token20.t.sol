// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.33;

import { Token20 } from "../Token20.sol";
import { Test } from "forge-std/Test.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

abstract contract Token20TestBase is Test, IAccessControl, IERC20Errors {
  Token20 token;
  address admin;
  address minter;
  address burner;
  address alice;
  address bob;

  function setUp() public {
    admin = address(this);
    minter = makeAddr("minter");
    burner = makeAddr("burner");
    alice = makeAddr("alice");
    bob = makeAddr("bob");
    token = new Token20("Token20", "TKN");
  }

  /* ---------- Constructor ---------- */

  function test_Constructor_SetsNameAndSymbol() public view {
    assertEq(token.name(), "Token20");
    assertEq(token.symbol(), "TKN");
    assertEq(token.decimals(), 18);
  }

  function test_Constructor_DeployerHasDefaultAdminRole() public view {
    assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), admin));
  }

  function test_Constructor_InitialSupplyZero() public view {
    assertEq(token.totalSupply(), 0);
    assertEq(token.balanceOf(admin), 0);
  }

  /* ---------- mint ---------- */

  function test_Mint_RevertsWhenCallerMissingMinterRole() public {
    vm.prank(minter);
    vm.expectRevert(
      abi.encodeWithSelector(
        IAccessControl.AccessControlUnauthorizedAccount.selector,
        minter,
        token.MINTER_ROLE()
      )
    );
    token.mint(alice, 1000);
  }

  function test_Mint_SucceedsWhenCallerHasMinterRole() public {
    token.grantRole(token.MINTER_ROLE(), minter);
    vm.prank(minter);
    token.mint(alice, 1000);
    assertEq(token.balanceOf(alice), 1000);
    assertEq(token.totalSupply(), 1000);
  }

  function test_Mint_UpdatesBalanceAndTotalSupply() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 500);
    token.mint(bob, 300);
    assertEq(token.balanceOf(alice), 500);
    assertEq(token.balanceOf(bob), 300);
    assertEq(token.totalSupply(), 800);
  }

  function test_Mint_ToZeroAddress_Reverts() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC20Errors.ERC20InvalidReceiver.selector,
        address(0)
      )
    );
    token.mint(address(0), 100);
  }

  function test_Mint_ZeroAmount_Succeeds() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 0);
    assertEq(token.balanceOf(alice), 0);
    assertEq(token.totalSupply(), 0);
  }

  /* ---------- burn ---------- */

  function test_Burn_RevertsWhenCallerMissingBurnerRole() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 1000);
    vm.prank(burner);
    vm.expectRevert(
      abi.encodeWithSelector(
        IAccessControl.AccessControlUnauthorizedAccount.selector,
        burner,
        token.BURNER_ROLE()
      )
    );
    token.burn(alice, 100);
  }

  function test_Burn_SucceedsWhenCallerHasBurnerRole() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 1000);
    token.grantRole(token.BURNER_ROLE(), burner);
    vm.prank(burner);
    token.burn(alice, 300);
    assertEq(token.balanceOf(alice), 700);
    assertEq(token.totalSupply(), 700);
  }

  function test_Burn_InsufficientBalance_Reverts() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    token.grantRole(token.BURNER_ROLE(), burner);
    vm.prank(burner);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC20Errors.ERC20InsufficientBalance.selector,
        alice,
        100,
        200
      )
    );
    token.burn(alice, 200);
  }

  function test_Burn_ZeroAmount_Succeeds() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    token.grantRole(token.BURNER_ROLE(), admin);
    token.burn(alice, 0);
    assertEq(token.balanceOf(alice), 100);
  }

  /* ---------- transfer (ERC20) ---------- */

  function test_Transfer_Succeeds() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 500);
    vm.prank(alice);
    token.transfer(bob, 200);
    assertEq(token.balanceOf(alice), 300);
    assertEq(token.balanceOf(bob), 200);
  }

  function test_Transfer_ToZeroAddress_Reverts() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    vm.prank(alice);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC20Errors.ERC20InvalidReceiver.selector,
        address(0)
      )
    );
    token.transfer(address(0), 50);
  }

  function test_Transfer_InsufficientBalance_Reverts() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    vm.prank(alice);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC20Errors.ERC20InsufficientBalance.selector,
        alice,
        100,
        150
      )
    );
    token.transfer(bob, 150);
  }

  function test_Transfer_ZeroAmount_Succeeds() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    vm.prank(alice);
    token.transfer(bob, 0);
    assertEq(token.balanceOf(alice), 100);
    assertEq(token.balanceOf(bob), 0);
  }

  /* ---------- approve (ERC20) ---------- */

  function test_Approve_Succeeds() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    vm.prank(alice);
    token.approve(bob, 50);
    assertEq(token.allowance(alice, bob), 50);
  }

  function test_Approve_ZeroSpender_Reverts() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    vm.prank(alice);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC20Errors.ERC20InvalidSpender.selector,
        address(0)
      )
    );
    token.approve(address(0), 50);
  }

  /* ---------- transferFrom (ERC20) ---------- */

  function test_TransferFrom_Succeeds() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    vm.prank(alice);
    token.approve(bob, 60);
    vm.prank(bob);
    token.transferFrom(alice, bob, 60);
    assertEq(token.balanceOf(alice), 40);
    assertEq(token.balanceOf(bob), 60);
    assertEq(token.allowance(alice, bob), 0);
  }

  function test_TransferFrom_InsufficientAllowance_Reverts() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    vm.prank(alice);
    token.approve(bob, 30);
    vm.prank(bob);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC20Errors.ERC20InsufficientAllowance.selector,
        bob,
        30,
        50
      )
    );
    token.transferFrom(alice, bob, 50);
  }

  function test_TransferFrom_InsufficientBalance_Reverts() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    vm.prank(alice);
    token.approve(bob, 200);
    vm.prank(bob);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC20Errors.ERC20InsufficientBalance.selector,
        alice,
        100,
        200
      )
    );
    token.transferFrom(alice, bob, 200);
  }

  function test_TransferFrom_ToZeroAddress_Reverts() public {
    token.grantRole(token.MINTER_ROLE(), admin);
    token.mint(alice, 100);
    vm.prank(alice);
    token.approve(bob, 50);
    vm.prank(bob);
    vm.expectRevert(
      abi.encodeWithSelector(
        IERC20Errors.ERC20InvalidReceiver.selector,
        address(0)
      )
    );
    token.transferFrom(alice, address(0), 50);
  }

  /* ---------- Access control (grantRole / revokeRole) ---------- */

  function test_GrantRole_NonAdmin_Reverts() public {
    vm.prank(minter);
    vm.expectRevert(
      abi.encodeWithSelector(
        IAccessControl.AccessControlUnauthorizedAccount.selector,
        minter,
        token.DEFAULT_ADMIN_ROLE()
      )
    );
    token.grantRole(token.MINTER_ROLE(), minter);
  }

  function test_GrantRole_Admin_Succeeds() public {
    token.grantRole(token.MINTER_ROLE(), minter);
    assertTrue(token.hasRole(token.MINTER_ROLE(), minter));
  }

  function test_RevokeRole_Admin_Succeeds() public {
    token.grantRole(token.MINTER_ROLE(), minter);
    token.revokeRole(token.MINTER_ROLE(), minter);
    assertFalse(token.hasRole(token.MINTER_ROLE(), minter));
  }

  function test_RevokeRole_NonAdmin_Reverts() public {
    token.grantRole(token.MINTER_ROLE(), minter);
    vm.prank(bob);
    vm.expectRevert(
      abi.encodeWithSelector(
        IAccessControl.AccessControlUnauthorizedAccount.selector,
        bob,
        token.DEFAULT_ADMIN_ROLE()
      )
    );
    token.revokeRole(token.MINTER_ROLE(), minter);
  }

  /* ---------- Role constants ---------- */

  function test_MinterRole_IsCorrectKeccak256() public view {
    assertEq(token.MINTER_ROLE(), keccak256("MINTER_ROLE"));
  }

  function test_BurnerRole_IsCorrectKeccak256() public view {
    assertEq(token.BURNER_ROLE(), keccak256("BURNER_ROLE"));
  }
}
