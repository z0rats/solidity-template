# Design: Signatures vs Merkle Trees

**Priority:** HIGH
**Gas Savings:** ~2,000+ gas per verification

## Problem

Merkle proofs require multiple bytes32 values in calldata, which is expensive.

## Solution

Use ECDSA signatures for allowlists when possible.

```solidity
// MERKLE PROOF: More calldata, higher gas
// ~10,000+ gas for verification + calldata cost
function claimMerkle(
    uint256 amount,
    bytes32[] calldata proof  // 32 bytes per proof element
) external {
    bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
    require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");
    // ... claim logic
}

// SIGNATURE: Less calldata, lower gas
// ~6,000 gas for ecrecover
function claimSignature(
    uint256 amount,
    bytes calldata signature  // 65 bytes total
) external {
    bytes32 hash = keccak256(
        abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            keccak256(abi.encodePacked(msg.sender, amount))
        )
    );
    address signer = ECDSA.recover(hash, signature);
    require(signer == trustedSigner, "Invalid signature");
    // ... claim logic
}
```

## EIP-712 Typed Signatures

More secure and user-friendly.

```solidity
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract AllowlistClaim is EIP712 {
    bytes32 private constant CLAIM_TYPEHASH =
        keccak256("Claim(address account,uint256 amount)");

    address public immutable signer;
    mapping(address => bool) public claimed;

    constructor(address _signer) EIP712("AllowlistClaim", "1") {
        signer = _signer;
    }

    function claim(uint256 amount, bytes calldata signature) external {
        require(!claimed[msg.sender], "Already claimed");

        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, msg.sender, amount)
        );
        bytes32 hash = _hashTypedDataV4(structHash);
        address recovered = ECDSA.recover(hash, signature);

        require(recovered == signer, "Invalid signature");

        claimed[msg.sender] = true;
        // ... mint or transfer
    }
}
```

## When to Use Each

| Use Case | Recommended |
|----------|-------------|
| Small allowlist (< 100) | Signatures |
| Large allowlist (> 1000) | Merkle or Signatures |
| Frequently changing list | Signatures |
| One-time static list | Either |
| On-chain verifiability | Merkle |
| Multiple claims per address | Merkle (with index) |

## Signature Generation (Off-chain)

```javascript
// Generate signature for user
const { ethers } = require("ethers");

async function generateSignature(signer, account, amount) {
    const message = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [account, amount]
    );
    return await signer.signMessage(ethers.getBytes(message));
}
```

## Hybrid Approach

Use signatures with a bitmap for claimed status.

```solidity
contract HybridClaim {
    address public immutable signer;
    uint256 public claimedBitmap;

    function claim(uint256 index, uint256 amount, bytes calldata sig) external {
        // Check not claimed using bitmap
        uint256 mask = 1 << index;
        require(claimedBitmap & mask == 0, "Already claimed");

        // Verify signature
        bytes32 hash = keccak256(abi.encodePacked(msg.sender, index, amount));
        require(ECDSA.recover(hash, sig) == signer, "Invalid");

        // Mark claimed
        claimedBitmap |= mask;

        // ... distribute
    }
}
```
