# Assembly: Basic Patterns

**Priority:** MEDIUM
**Risk:** HIGH - Use with caution

## When to Use Assembly

- Hot paths with many executions
- Simple operations with known safety
- After profiling shows significant benefit
- When Solidity generates suboptimal bytecode

## Address Zero Check

```solidity
// Solidity: ~24 gas
function checkZeroSolidity(address addr) internal pure {
    require(addr != address(0), "Zero address");
}

// Assembly: ~18 gas
function checkZeroAssembly(address addr) internal pure {
    assembly {
        if iszero(addr) {
            revert(0, 0)
        }
    }
}

// Assembly with custom error
error ZeroAddress();

function checkZeroWithError(address addr) internal pure {
    assembly {
        if iszero(addr) {
            mstore(0x00, 0xe6c4247b)  // ZeroAddress() selector
            revert(0x1c, 0x04)
        }
    }
}
```

## Efficient Min/Max

```solidity
// Solidity: uses conditional jump
function maxSolidity(uint256 x, uint256 y) internal pure returns (uint256) {
    return x > y ? x : y;
}

// Assembly: branchless
function maxAssembly(uint256 x, uint256 y) internal pure returns (uint256 z) {
    assembly {
        z := xor(x, mul(xor(x, y), gt(y, x)))
    }
}

function minAssembly(uint256 x, uint256 y) internal pure returns (uint256 z) {
    assembly {
        z := xor(x, mul(xor(x, y), lt(y, x)))
    }
}
```

## Self Balance

```solidity
// Solidity
uint256 balance = address(this).balance;

// Assembly (sometimes cheaper)
function selfBalance() internal view returns (uint256 bal) {
    assembly {
        bal := selfbalance()
    }
}
```

## Caller Check

```solidity
// Solidity
require(msg.sender == owner, "Not owner");

// Assembly
function checkOwner(address owner) internal view {
    assembly {
        if iszero(eq(caller(), owner)) {
            revert(0, 0)
        }
    }
}
```

## Hash Two Values

Using scratch space (0x00-0x40):

```solidity
function hashPair(uint256 a, uint256 b) internal pure returns (bytes32 result) {
    assembly {
        mstore(0x00, a)
        mstore(0x20, b)
        result := keccak256(0x00, 0x40)
    }
}
```

## Efficient Event Emission

```solidity
event Transfer(address indexed from, address indexed to, uint256 amount);

function emitTransfer(address from, address to, uint256 amount) internal {
    assembly {
        // Transfer(address,address,uint256) = 0xddf252ad...
        let sig := 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
        mstore(0x00, amount)
        log3(0x00, 0x20, sig, from, to)
    }
}
```

## Safety Guidelines

1. **Never use assembly for complex logic** - Bugs are hard to find
2. **Always add comments** - Explain what each line does
3. **Test extensively** - Including edge cases
4. **Benchmark first** - Verify actual gas savings
5. **Consider maintainability** - Is the savings worth the complexity?

## Common Assembly Gotchas

```solidity
// WRONG: Memory not cleared
assembly {
    let x := mload(0x40)  // Free memory pointer
    mstore(x, value)
    // Forgot to update free memory pointer!
}

// RIGHT: Proper memory management
assembly {
    let fmp := mload(0x40)
    mstore(fmp, value)
    mstore(0x40, add(fmp, 0x20))  // Update free memory pointer
}
```
