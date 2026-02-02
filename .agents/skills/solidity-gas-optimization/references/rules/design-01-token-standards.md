# Design: Token Standard Selection

**Priority:** HIGH
**Gas Savings:** Variable, can be significant for NFT collections

## ERC1155 vs ERC721

**Problem:** ERC721 has balanceOf overhead on every mint and transfer.

```solidity
// ERC721: Updates balanceOf on every transfer
function _transfer(address from, address to, uint256 tokenId) internal {
    _balances[from] -= 1;  // SSTORE
    _balances[to] += 1;    // SSTORE
    _owners[tokenId] = to; // SSTORE
}

// ERC1155: No balanceOf tracking by default
function _transfer(address from, address to, uint256 id, uint256 amount) internal {
    _balances[id][from] -= amount;  // SSTORE
    _balances[id][to] += amount;    // SSTORE
    // No separate owner tracking needed
}
```

**Recommendation:** Use ERC1155 for NFT collections unless ERC721-specific features needed.

```solidity
import {ERC1155} from "solmate/tokens/ERC1155.sol";

contract MyNFT is ERC1155 {
    uint256 public totalMinted;

    function mint(address to) external returns (uint256 id) {
        id = ++totalMinted;
        _mint(to, id, 1, "");
    }

    function uri(uint256 id) public view override returns (string memory) {
        return string.concat(baseURI, LibString.toString(id));
    }
}
```

## ERC20 Optimizations

### Use Solmate/Solady

```solidity
// OpenZeppelin ERC20: More features, more gas
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Solmate ERC20: Optimized, fewer features
import {ERC20} from "solmate/tokens/ERC20.sol";

// Solady ERC20: Most optimized
import {ERC20} from "solady/tokens/ERC20.sol";
```

### Implement ERC20Permit

Combines approve + transfer into single transaction.

```solidity
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MyToken is ERC20Permit {
    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {}
}

// Usage: approve + transfer in one tx
function depositWithPermit(
    uint256 amount,
    uint256 deadline,
    uint8 v, bytes32 r, bytes32 s
) external {
    token.permit(msg.sender, address(this), amount, deadline, v, r, s);
    token.transferFrom(msg.sender, address(this), amount);
}
```

## Multi-Token Consolidation

Consider ERC1155 for multiple fungible tokens.

```solidity
// BAD: Multiple ERC20 deployments
contract TokenA is ERC20 { }
contract TokenB is ERC20 { }
contract TokenC is ERC20 { }

// GOOD: Single ERC1155 for all tokens
contract MultiToken is ERC1155 {
    uint256 public constant TOKEN_A = 1;
    uint256 public constant TOKEN_B = 2;
    uint256 public constant TOKEN_C = 3;

    function mintTokenA(address to, uint256 amount) external {
        _mint(to, TOKEN_A, amount, "");
    }
}
```

**Trade-off:** ERC1155 has limited DeFi compatibility compared to ERC20.
