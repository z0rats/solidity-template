# Storage: Variable and Struct Packing

**Priority:** CRITICAL
**Gas Savings:** 20,000+ gas per saved storage slot

## Problem

Each storage slot is 32 bytes. Using uint256 for small values wastes entire slots.

## Solution

Pack multiple smaller variables into single slots.

## Struct Packing

```solidity
// BAD: 3 storage slots (60,000+ gas to initialize all)
struct Unpacked {
    uint64 timestamp;   // Slot 1: 8 bytes (24 bytes wasted)
    uint256 amount;     // Slot 2: 32 bytes
    address owner;      // Slot 3: 20 bytes (12 bytes wasted)
}

// GOOD: 2 storage slots (40,000+ gas to initialize all)
struct Packed {
    uint64 timestamp;   // Slot 1: 8 bytes
    address owner;      // Slot 1: 20 bytes (28 total, 4 bytes left)
    uint256 amount;     // Slot 2: 32 bytes
}

// BETTER: If amount fits in uint96, use 1 slot
struct TightlyPacked {
    uint64 timestamp;   // 8 bytes
    uint96 amount;      // 12 bytes
    address owner;      // 20 bytes (fit, but exceeds - need 2 slots)
}
```

## Slot Size Reference

| Type | Bytes | Max Value |
|------|-------|-----------|
| uint8 | 1 | 255 |
| uint16 | 2 | 65,535 |
| uint32 | 4 | ~4.3 billion |
| uint48 | 6 | ~281 trillion |
| uint64 | 8 | ~18 quintillion |
| uint96 | 12 | ~79 octillion |
| uint128 | 16 | ~340 undecillion |
| address | 20 | N/A |
| uint256 | 32 | 2^256 - 1 |

## Manual Bit Packing

```solidity
// Pack two uint128 into one uint256
uint256 private packed;

function setPair(uint128 a, uint128 b) external {
    packed = uint256(a) << 128 | uint256(b);
}

function getPair() external view returns (uint128 a, uint128 b) {
    a = uint128(packed >> 128);
    b = uint128(packed);
}
```

## Timestamp Optimization

```solidity
// BAD: uint256 for timestamp
uint256 public lastUpdate;

// GOOD: uint48 works for millions of years
uint48 public lastUpdate;

// GOOD: uint32 for block numbers
uint32 public lastBlock;
```

## When NOT to Pack

- Variables accessed together should be in same slot
- Variables accessed separately might benefit from separate slots
- Consider read/write patterns, not just storage savings
