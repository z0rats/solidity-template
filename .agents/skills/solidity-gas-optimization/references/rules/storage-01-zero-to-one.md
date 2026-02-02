# Storage: Avoid Zero-to-One Writes

**Priority:** CRITICAL
**Gas Savings:** Up to 17,100 gas per write

## Problem

Initializing a storage variable from zero to non-zero costs 22,100 gas (cold SSTORE). Writing to an already non-zero slot costs only 5,000 gas (warm SSTORE).

## Solution

Use non-zero sentinel values instead of zero for "unset" states.

```solidity
// BAD: Zero-to-one write costs 22,100 gas
contract Bad {
    bool public initialized;  // default: false (0)

    function initialize() external {
        require(!initialized);
        initialized = true;  // 0 -> 1: costs 22,100 gas
    }
}

// GOOD: Non-zero to non-zero costs 5,000 gas
contract Good {
    uint256 private constant NOT_INITIALIZED = 1;
    uint256 private constant INITIALIZED = 2;
    uint256 public initialized = NOT_INITIALIZED;

    function initialize() external {
        require(initialized == NOT_INITIALIZED);
        initialized = INITIALIZED;  // 1 -> 2: costs 5,000 gas
    }
}
```

## ERC20 Balance Pattern

Keep 1 wei minimum balance to avoid zero-to-one writes on transfers.

```solidity
// GOOD: Maintain minimum balance
function transfer(address to, uint256 amount) external {
    uint256 senderBalance = balanceOf[msg.sender];
    require(senderBalance > amount, "Keep 1 wei minimum");

    unchecked {
        balanceOf[msg.sender] = senderBalance - amount;
    }
    balanceOf[to] += amount;

    emit Transfer(msg.sender, to, amount);
}
```

## When to Apply

- Boolean flags (initialized, paused, etc.)
- Reentrancy guards
- Any variable that starts at zero and changes once
- ERC20 balances that may go to zero
