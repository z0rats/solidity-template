# Compiler: Loop Optimization

**Priority:** MEDIUM
**Gas Savings:** ~50-200 gas per iteration

## Optimal Loop Pattern

```solidity
// BEST: All optimizations applied
function sumOptimal(uint256[] calldata values) external pure returns (uint256 total) {
    uint256 length = values.length;  // Cache length
    for (uint256 i; i < length; ) {  // No initialization (default 0)
        total += values[i];
        unchecked { ++i; }            // Unchecked pre-increment
    }
}
```

## Optimization Breakdown

### 1. Cache Array Length

```solidity
// BAD: SLOAD/MLOAD every iteration
for (uint256 i = 0; i < array.length; i++) { }

// GOOD: Single read
uint256 length = array.length;
for (uint256 i = 0; i < length; ) { }
```

### 2. Skip Zero Initialization

```solidity
// BAD: Explicit zero (wastes a tiny amount)
for (uint256 i = 0; i < length; i++) { }

// GOOD: Default to zero
for (uint256 i; i < length; ) { }
```

### 3. Use Pre-increment

```solidity
// BAD: Post-increment (stores old value temporarily)
i++;

// GOOD: Pre-increment (returns new value directly)
++i;
```

### 4. Unchecked Increment

When overflow is impossible (bounded by length):

```solidity
// BAD: Overflow check on every iteration
for (uint256 i; i < length; i++) { }

// GOOD: Skip overflow check
for (uint256 i; i < length; ) {
    // ... logic
    unchecked { ++i; }
}
```

## Do-While for Known Iterations

When at least one iteration is guaranteed:

```solidity
// FOR loop: checks condition before first iteration
function processFor(uint256 times) external {
    if (times == 0) return;
    for (uint256 i; i < times; ) {
        // process
        unchecked { ++i; }
    }
}

// DO-WHILE: slightly cheaper, skips initial check
function processDoWhile(uint256 times) external {
    if (times == 0) return;
    uint256 i;
    do {
        // process
        unchecked { ++i; }
    } while (i < times);
}
```

## Reverse Iteration

Counting down can be cheaper in some cases:

```solidity
function processReverse(uint256[] calldata values) external {
    for (uint256 i = values.length; i != 0; ) {
        unchecked { --i; }
        // process values[i]
    }
}
```

## Avoid Loop Variables When Possible

```solidity
// BAD: Loop variable
for (uint256 i; i < 3; ) {
    doSomething(i);
    unchecked { ++i; }
}

// GOOD: Unroll small fixed loops
doSomething(0);
doSomething(1);
doSomething(2);
```

## Note on Solidity 0.8.22+

As of Solidity 0.8.22, the compiler handles many loop optimizations automatically. However, explicitly applying these patterns ensures optimization regardless of compiler version.
