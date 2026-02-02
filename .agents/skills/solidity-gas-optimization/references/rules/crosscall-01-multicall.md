# Cross-Contract: Multicall Pattern

**Priority:** MEDIUM-HIGH
**Gas Savings:** ~21,000 gas per batched transaction

## Problem

Multiple transactions have base cost overhead (21,000 gas each).

## Solution

Batch multiple calls into single transaction.

```solidity
contract Multicall {
    function multicall(
        bytes[] calldata data
    ) external returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; ) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            if (!success) {
                // Bubble up revert reason
                assembly {
                    revert(add(result, 0x20), mload(result))
                }
            }
            results[i] = result;
            unchecked { ++i; }
        }
    }
}
```

## Payable Multicall

For functions that accept ETH:

```solidity
contract PayableMulticall {
    function multicall(
        bytes[] calldata data
    ) external payable returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; ) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success);
            results[i] = result;
            unchecked { ++i; }
        }
    }
}
```

## Multicall with Deadline

Common in DEX routers:

```solidity
contract MulticallWithDeadline {
    error TransactionExpired();

    modifier checkDeadline(uint256 deadline) {
        if (block.timestamp > deadline) revert TransactionExpired();
        _;
    }

    function multicall(
        uint256 deadline,
        bytes[] calldata data
    ) external payable checkDeadline(deadline) returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i; i < data.length; ) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success);
            results[i] = result;
            unchecked { ++i; }
        }
    }
}
```

## Client-Side Usage

```javascript
// Encode multiple function calls
const calls = [
    contract.interface.encodeFunctionData("approve", [spender, amount]),
    contract.interface.encodeFunctionData("deposit", [amount]),
    contract.interface.encodeFunctionData("stake", [amount])
];

// Execute as single transaction
await contract.multicall(calls);
```

## Multicall3 (Aggregate Calls to Multiple Contracts)

For batching calls across different contracts:

```solidity
interface IMulticall3 {
    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    function aggregate3(Call3[] calldata calls) external payable returns (Result[] memory);
}

// Usage
IMulticall3.Call3[] memory calls = new IMulticall3.Call3[](2);
calls[0] = IMulticall3.Call3({
    target: tokenA,
    allowFailure: false,
    callData: abi.encodeCall(IERC20.balanceOf, (user))
});
calls[1] = IMulticall3.Call3({
    target: tokenB,
    allowFailure: false,
    callData: abi.encodeCall(IERC20.balanceOf, (user))
});

IMulticall3.Result[] memory results = multicall3.aggregate3(calls);
```

## Security Considerations

1. **Reentrancy** - delegatecall preserves msg.sender, be careful
2. **ETH handling** - msg.value is same for all calls in batch
3. **Partial failures** - Decide whether to allow or revert all
