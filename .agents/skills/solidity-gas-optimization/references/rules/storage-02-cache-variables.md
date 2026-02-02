# Storage: Cache Storage Variables

**Priority:** CRITICAL
**Gas Savings:** ~100 gas per avoided SLOAD

## Problem

Each SLOAD (storage read) costs 100 gas (warm) or 2,100 gas (cold). Reading the same variable multiple times wastes gas.

## Solution

Cache storage variables in memory when accessed multiple times.

```solidity
// BAD: Multiple SLOADs (200+ gas wasted)
contract Bad {
    uint256 public count;

    function increment() external {
        require(count < 100);      // SLOAD 1
        count = count + 1;         // SLOAD 2 + SSTORE
    }

    function process() external view returns (uint256) {
        if (count > 0) {           // SLOAD 1
            return count * 2;      // SLOAD 2
        }
        return count;              // SLOAD 3
    }
}

// GOOD: Single SLOAD
contract Good {
    uint256 public count;

    function increment() external {
        uint256 _count = count;    // Single SLOAD
        require(_count < 100);
        count = _count + 1;        // SSTORE
    }

    function process() external view returns (uint256) {
        uint256 _count = count;    // Single SLOAD
        if (_count > 0) {
            return _count * 2;
        }
        return _count;
    }
}
```

## Array Length Caching

Always cache array length in loops.

```solidity
// BAD: Length read every iteration
for (uint256 i = 0; i < array.length; i++) {
    // SLOAD on every iteration
}

// GOOD: Length cached
uint256 length = array.length;  // Single SLOAD
for (uint256 i = 0; i < length; ) {
    // No SLOAD in loop
    unchecked { ++i; }
}
```

## Mapping with Struct

Use storage pointers for multiple field access.

```solidity
mapping(address => User) public users;

// BAD: Multiple storage accesses
function update(address addr) external {
    users[addr].balance += 100;    // SLOAD + SSTORE
    users[addr].lastUpdate = block.timestamp;  // Another SLOAD + SSTORE
}

// GOOD: Storage pointer
function update(address addr) external {
    User storage user = users[addr];  // Single slot computation
    user.balance += 100;
    user.lastUpdate = block.timestamp;
}
```
