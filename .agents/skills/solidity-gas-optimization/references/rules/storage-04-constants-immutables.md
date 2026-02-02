# Storage: Constants and Immutables

**Priority:** CRITICAL
**Gas Savings:** 2,100 gas per access (eliminates SLOAD)

## Problem

Regular storage variables cost 2,100 gas (cold) or 100 gas (warm) per access.

## Solution

Use `constant` for compile-time values and `immutable` for deployment-time values. Both are embedded in bytecode.

```solidity
// BAD: Storage variables (SLOAD each access)
contract Bad {
    address public owner;           // SLOAD: 2,100 gas first access
    uint256 public maxSupply;       // SLOAD: 2,100 gas first access
    uint256 public feeBps = 250;    // SLOAD: 2,100 gas first access
}

// GOOD: Constants and immutables (no SLOAD)
contract Good {
    // Constant: compile-time, embedded in bytecode
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant FEE_BPS = 250;
    bytes32 public constant DOMAIN_SEPARATOR = keccak256("EIP712Domain");

    // Immutable: set once in constructor, embedded in bytecode
    address public immutable owner;
    uint256 public immutable deployTimestamp;
    bytes32 public immutable CACHED_DOMAIN_SEPARATOR;

    constructor() {
        owner = msg.sender;
        deployTimestamp = block.timestamp;
        CACHED_DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,uint256 chainId)"),
                keccak256("MyContract"),
                block.chainid
            )
        );
    }
}
```

## Constant vs Immutable

| Feature | constant | immutable |
|---------|----------|-----------|
| Set at | Compile time | Constructor |
| Value source | Literal or pure expression | Any expression |
| Can use msg.sender | No | Yes |
| Can use block.* | No | Yes |
| Storage cost | None | None |
| Read cost | ~3 gas (PUSH) | ~3 gas (PUSH) |

## Common Patterns

```solidity
contract OptimizedContract {
    // Protocol constants
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_FEE = 1000;  // 10%
    uint256 public constant MIN_DEPOSIT = 0.01 ether;

    // Deployment configuration
    address public immutable token;
    address public immutable treasury;
    uint256 public immutable startTime;

    // Cached computations
    bytes32 public immutable PERMIT_TYPEHASH;

    constructor(address _token, address _treasury) {
        token = _token;
        treasury = _treasury;
        startTime = block.timestamp;

        PERMIT_TYPEHASH = keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );
    }
}
```

## Limitations

- Cannot be modified after deployment
- Immutables cannot be read in constructor (only assigned)
- Arrays and mappings cannot be constant/immutable
