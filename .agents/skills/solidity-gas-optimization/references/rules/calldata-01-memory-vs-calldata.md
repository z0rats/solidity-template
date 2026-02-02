# Calldata: Memory vs Calldata

**Priority:** HIGH
**Gas Savings:** ~60+ gas per parameter

## Problem

Using `memory` for external function parameters copies data unnecessarily.

## Solution

Use `calldata` for read-only external parameters.

```solidity
// BAD: Copies bytes to memory
function processData(bytes memory data) external pure returns (bytes32) {
    return keccak256(data);
}

// GOOD: Reads directly from calldata
function processData(bytes calldata data) external pure returns (bytes32) {
    return keccak256(data);
}
```

## Arrays

```solidity
// BAD: Copies entire array to memory
function sum(uint256[] memory values) external pure returns (uint256 total) {
    for (uint256 i = 0; i < values.length; ) {
        total += values[i];
        unchecked { ++i; }
    }
}

// GOOD: Reads from calldata
function sum(uint256[] calldata values) external pure returns (uint256 total) {
    uint256 length = values.length;
    for (uint256 i = 0; i < length; ) {
        total += values[i];
        unchecked { ++i; }
    }
}
```

## Structs

```solidity
struct Order {
    address maker;
    address taker;
    uint256 amount;
    uint256 price;
}

// BAD: Copies struct to memory
function processOrder(Order memory order) external {
    // ...
}

// GOOD: Reads from calldata
function processOrder(Order calldata order) external {
    // ...
}
```

## When to Use Memory

Use `memory` only when you need to:
- Modify the data
- Pass to internal functions that require memory
- Store in storage

```solidity
function modify(bytes calldata data) external pure returns (bytes memory) {
    // Must use memory to modify
    bytes memory modified = data;
    modified[0] = 0x00;
    return modified;
}
```

## Calldata Slicing

```solidity
// Efficient: slice without copying
function processFirst10(bytes calldata data) external pure returns (bytes calldata) {
    return data[:10];  // Returns calldata slice, no copy
}

function processRest(uint256[] calldata values) external pure returns (uint256[] calldata) {
    return values[1:];  // Skip first element, no copy
}
```
