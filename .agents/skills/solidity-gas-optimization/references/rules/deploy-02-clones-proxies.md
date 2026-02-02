# Deployment: Clones and Proxies

**Priority:** HIGH
**Gas Savings:** 90%+ on repeated deployments

## Problem

Deploying identical contract bytecode multiple times wastes gas.

## Solution: EIP-1167 Minimal Proxy (Clones)

For frequently deployed contracts, deploy one implementation and create minimal proxies.

```solidity
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract VaultFactory {
    address public immutable implementation;

    constructor() {
        implementation = address(new Vault());
    }

    // Deploy clone: ~45,000 gas vs ~500,000+ for full contract
    function createVault(address owner) external returns (address vault) {
        vault = Clones.clone(implementation);
        Vault(vault).initialize(owner);
    }

    // Deterministic clone with CREATE2
    function createVaultDeterministic(
        address owner,
        bytes32 salt
    ) external returns (address vault) {
        vault = Clones.cloneDeterministic(implementation, salt);
        Vault(vault).initialize(owner);
    }

    // Predict address before deployment
    function predictAddress(bytes32 salt) external view returns (address) {
        return Clones.predictDeterministicAddress(implementation, salt);
    }
}

contract Vault {
    address public owner;
    bool private initialized;

    function initialize(address _owner) external {
        require(!initialized);
        initialized = true;
        owner = _owner;
    }
}
```

## UUPS vs Transparent Proxy

**UUPS (Universal Upgradeable Proxy Standard):**
- Upgrade logic in implementation
- No admin check on every call
- Smaller proxy bytecode

```solidity
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyContractV1 is Initializable, UUPSUpgradeable {
    address public owner;

    function initialize(address _owner) external initializer {
        owner = _owner;
    }

    function _authorizeUpgrade(address) internal override {
        require(msg.sender == owner);
    }
}
```

**Transparent Proxy:**
- Upgrade logic in proxy
- Admin check on every call (more gas)
- Larger proxy bytecode

## When to Use Each

| Pattern | Use Case |
|---------|----------|
| Full deployment | One-time contracts, unique bytecode |
| Clones | Many identical contracts (vaults, pools) |
| UUPS Proxy | Upgradeable contracts, gas-sensitive |
| Transparent Proxy | Upgradeable, simpler security model |

## Trade-offs

**Clones:**
- Pro: Very cheap deployment (~45k gas)
- Con: Slight runtime overhead (DELEGATECALL)
- Con: Implementation must be deployed first

**UUPS:**
- Pro: Cheapest upgradeable pattern
- Con: Implementation bug can brick contract
- Con: More complex upgrade logic
