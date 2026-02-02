# Deployment: Custom Errors

**Priority:** HIGH
**Gas Savings:** ~50+ bytes per error string removed

## Problem

Require strings are stored in contract bytecode, increasing deployment cost and runtime revert cost.

```solidity
// BAD: Each string adds 64+ bytes to bytecode
require(amount > 0, "Amount must be greater than zero");
require(msg.sender == owner, "Only owner can call this function");
require(deadline >= block.timestamp, "Transaction has expired");
```

## Solution

Use custom errors with optional parameters.

```solidity
// GOOD: Custom errors use ~4 bytes (selector only)
error ZeroAmount();
error Unauthorized();
error Expired();

// With parameters for debugging
error InsufficientBalance(uint256 available, uint256 required);
error InvalidRecipient(address recipient);

contract Optimized {
    function transfer(address to, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (to == address(0)) revert InvalidRecipient(to);

        uint256 balance = balanceOf[msg.sender];
        if (balance < amount) {
            revert InsufficientBalance(balance, amount);
        }

        // transfer logic
    }
}
```

## Comparison

```solidity
// Require with string: ~100 gas + string storage
require(x > 0, "Value must be positive");

// Custom error: ~50 gas, minimal storage
error NotPositive();
if (x == 0) revert NotPositive();
```

## Error Organization

```solidity
// errors.sol - Centralized error definitions
error Unauthorized();
error InvalidAmount();
error Expired(uint256 deadline, uint256 current);
error InsufficientLiquidity(uint256 available, uint256 required);

// In contract
import {Unauthorized, InvalidAmount} from "./errors.sol";

contract MyContract {
    function restricted() external {
        if (msg.sender != owner) revert Unauthorized();
    }
}
```

## Catching Custom Errors

```solidity
try target.someFunction() {
    // success
} catch (bytes memory reason) {
    // Decode custom error
    if (bytes4(reason) == InsufficientBalance.selector) {
        // Handle specific error
    }
}
```
