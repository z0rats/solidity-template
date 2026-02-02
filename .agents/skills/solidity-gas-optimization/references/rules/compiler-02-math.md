# Compiler: Math Optimizations

**Priority:** MEDIUM
**Gas Savings:** 2-50+ gas per operation

## Bitshifting vs Multiplication/Division

```solidity
// EXPENSIVE: MUL costs 5 gas, DIV costs 5 gas
uint256 doubled = x * 2;
uint256 halved = x / 2;
uint256 quadrupled = x * 4;

// CHEAP: SHL/SHR cost 3 gas
uint256 doubled = x << 1;     // x * 2
uint256 halved = x >> 1;      // x / 2
uint256 quadrupled = x << 2;  // x * 4
uint256 octupled = x << 3;    // x * 8
```

## Unchecked Math

Skip overflow checks when mathematically safe:

```solidity
// With overflow check (~50 extra gas)
uint256 sum = a + b;

// Without overflow check
unchecked {
    uint256 sum = a + b;  // Only safe if you know a + b < 2^256
}

// Common safe patterns
function increment(uint256 x) external pure returns (uint256) {
    unchecked {
        return x + 1;  // Safe if x < type(uint256).max
    }
}

// Loop increment is always safe when bounded
for (uint256 i; i < length; ) {
    unchecked { ++i; }  // Safe: i < length < 2^256
}
```

## Multiplication Over Exponentiation

```solidity
// EXPENSIVE: EXP costs 10 + 50 * (exponent_size) gas
uint256 cubed = x ** 3;

// CHEAP: Two MUL operations = 10 gas
uint256 cubed = x * x * x;

// More examples
uint256 squared = x * x;           // Instead of x ** 2
uint256 fourth = x * x * x * x;    // Instead of x ** 4
```

## Even/Odd Check

```solidity
// EXPENSIVE: MOD costs 5 gas
bool isEven = x % 2 == 0;

// CHEAP: AND costs 3 gas
bool isEven = x & 1 == 0;
bool isOdd = x & 1 == 1;
```

## Comparison Operators

Test both strict and non-strict:

```solidity
// These may compile differently depending on context
if (x < 10) { }   // Strict
if (x <= 9) { }   // Non-strict equivalent

// Benchmark both in your specific context
```

## Short-Circuit Evaluation

Order conditions by cost and likelihood:

```solidity
// For &&: Put cheap/likely-to-fail checks first
if (amount == 0 || expensiveCheck()) revert();

// For ||: Put cheap/likely-to-succeed checks first
if (isWhitelisted[msg.sender] || verifyMerkleProof(proof)) {
    // proceed
}
```

## Split Conditions

```solidity
// BAD: Both conditions always evaluated for error message
require(x > 0 && y > 0, "Invalid");

// GOOD: Short-circuits on first failure
require(x > 0, "X invalid");
require(y > 0, "Y invalid");

// BETTER: Custom errors
if (x == 0) revert InvalidX();
if (y == 0) revert InvalidY();
```

## Avoid Unnecessary Casting

```solidity
// BAD: Casts on every operation
function process(uint8 x, uint8 y) external pure returns (uint8) {
    return x + y;  // EVM converts to uint256, operates, converts back
}

// GOOD: Use uint256 unless packing
function process(uint256 x, uint256 y) external pure returns (uint256) {
    return x + y;  // No conversion needed
}
```
