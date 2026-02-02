# Solidity Gas Optimization Guidelines

Complete reference guide with 80+ gas optimization techniques for Solidity smart contracts. Based on the RareSkills Book of Solidity Gas Optimization.

---

## 1. Storage Optimization (CRITICAL)

### 1.1 Avoid Zero-to-One Storage Writes

Initializing a storage variable from zero to non-zero costs 22,100 gas. Writing to an already non-zero slot costs only 5,000 gas.

```solidity
// Bad: zero-to-one write for boolean flags
bool public initialized;  // default 0, first write costs 22,100

// Good: use 1 and 2 instead of 0 and 1
uint256 public initialized = 1;  // 1 = false, 2 = true
```

### 1.2 Cache Storage Variables

Read and write storage variables exactly once per function.

```solidity
// Bad: reads storage twice (2 SLOADs)
function increment() public {
    require(number < 10);
    number = number + 1;
}

// Good: reads storage once (1 SLOAD)
function increment() public {
    uint256 _number = number;
    require(_number < 10);
    number = _number + 1;
}
```

### 1.3 Pack Related Variables

Multiple smaller variables can share a single 32-byte storage slot.

```solidity
// Manual packing with bit shifting
uint160 packedVariables;

function packVariables(uint80 x, uint80 y) external {
    packedVariables = uint160(x) << 80 | uint160(y);
}

function unpackX() external view returns (uint80) {
    return uint80(packedVariables >> 80);
}
```

### 1.4 Pack Structs Efficiently

Order struct members by size to minimize storage slots.

```solidity
// Bad: 3 storage slots
struct Unpacked {
    uint64 timestamp;   // slot 1 (only 8 bytes used)
    uint256 amount;     // slot 2
    address user;       // slot 3
}

// Good: 2 storage slots
struct Packed {
    uint64 timestamp;   // slot 1: 8 bytes
    address user;       // slot 1: 20 bytes (total 28 bytes)
    uint256 amount;     // slot 2
}
```

### 1.5 Keep Strings Under 32 Bytes

Short strings (< 32 bytes) use one storage slot. Longer strings require multiple slots.

```solidity
// One slot
string public name = "Token";

// Multiple slots (avoid if possible)
string public description = "This is a very long description that exceeds 32 bytes";
```

### 1.6 Use Immutable and Constant

Constants and immutables are embedded in bytecode, not stored in storage.

```solidity
uint256 constant MAX_SUPPLY = 10000;           // Compile-time constant
address immutable public owner;                // Set once in constructor
uint256 immutable public deploymentTimestamp;

constructor() {
    owner = msg.sender;
    deploymentTimestamp = block.timestamp;
}
```

### 1.7 Mappings vs Arrays

Mappings avoid length checks, saving ~2,100 gas per access.

```solidity
// More expensive: 4,860 gas (includes length check)
uint256[] public balances;

// Cheaper: 2,758 gas (no length check)
mapping(uint256 => uint256) public balances;
```

### 1.8 Use Bitmaps for Boolean Arrays

Store up to 256 boolean flags in a single uint256.

```solidity
// Bad: 256 storage slots for 256 booleans
mapping(uint256 => bool) public claimed;

// Good: 1 storage slot for 256 booleans
uint256 public claimedBitmap;

function isClaimed(uint256 index) public view returns (bool) {
    uint256 wordIndex = index / 256;
    uint256 bitIndex = index % 256;
    return (claimedBitmap >> bitIndex) & 1 == 1;
}

function setClaimed(uint256 index) internal {
    claimedBitmap |= (1 << index);
}
```

### 1.9 Use Storage Pointers

Access struct fields directly from storage instead of copying to memory.

```solidity
struct User {
    uint256 balance;
    uint256 lastUpdate;
    address referrer;
}

mapping(address => User) public users;

// Bad: copies entire struct to memory
function getBalance(address _user) external view returns (uint256) {
    User memory user = users[_user];
    return user.balance;
}

// Good: direct storage access
function getBalance(address _user) external view returns (uint256) {
    return users[_user].balance;
}

// Good: storage pointer when accessing multiple fields
function updateUser(address _user) external {
    User storage user = users[_user];
    user.balance += 100;
    user.lastUpdate = block.timestamp;
}
```

### 1.10 SSTORE2/SSTORE3 for Large Data

For large data, use contract bytecode (200 gas/byte) instead of storage (22,100 gas for zero writes).

```solidity
// Using SSTORE2 library
import {SSTORE2} from "solmate/utils/SSTORE2.sol";

address public dataPointer;

function storeData(bytes memory data) external {
    dataPointer = SSTORE2.write(data);
}

function readData() external view returns (bytes memory) {
    return SSTORE2.read(dataPointer);
}
```

### 1.11 Maintain Non-Zero ERC20 Balances

Keep 1 wei in accounts to avoid zero-to-one writes on transfers.

```solidity
function transfer(address to, uint256 amount) external {
    uint256 senderBalance = balanceOf[msg.sender];
    require(senderBalance >= amount + 1, "Keep 1 wei");

    balanceOf[msg.sender] = senderBalance - amount;
    balanceOf[to] += amount;
}
```

### 1.12 Use Smaller Types for Timestamps

A uint48 timestamp works for millions of years.

```solidity
// Bad: wastes storage
uint256 public lastUpdate;

// Good: fits with other small values
uint48 public lastUpdate;      // timestamps
uint32 public blockNumber;     // block numbers
uint16 public nonce;           // limited counters
```

---

## 2. Deployment Optimization (HIGH)

### 2.1 Payable Constructor

Saves ~200 gas by eliminating msg.value == 0 check.

```solidity
constructor() payable {
    owner = msg.sender;
}
```

### 2.2 Custom Errors Over Require Strings

Custom errors use ~4 bytes; require strings use 64+ bytes.

```solidity
// Bad: expensive bytecode
require(amount <= balance, "Insufficient balance");
require(msg.sender == owner, "Not authorized");

// Good: minimal bytecode
error InsufficientBalance();
error Unauthorized();

if (amount > balance) revert InsufficientBalance();
if (msg.sender != owner) revert Unauthorized();

// Good with parameters
error InsufficientBalance(uint256 available, uint256 required);
if (amount > balance) revert InsufficientBalance(balance, amount);
```

### 2.3 Use Clones for Repeated Deployments

EIP-1167 minimal proxy pattern for frequently deployed contracts.

```solidity
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

address public immutable implementation;

function createClone(bytes32 salt) external returns (address) {
    return Clones.cloneDeterministic(implementation, salt);
}
```

### 2.4 UUPS Over Transparent Proxy

UUPS only checks admin on upgrades, not every call.

```solidity
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyContract is UUPSUpgradeable {
    function _authorizeUpgrade(address) internal override onlyOwner {}
}
```

### 2.5 Payable Admin Functions

Admin functions can be payable since only admins call them.

```solidity
// Saves gas by removing msg.value check
function setConfig(uint256 value) external payable onlyOwner {
    config = value;
}
```

### 2.6 Internal Functions vs Modifiers

- **Modifiers**: Lower runtime cost, larger deployment (code duplication)
- **Internal Functions**: Higher runtime cost, smaller deployment

```solidity
// Use modifier for frequently called functions
modifier onlyOwner() {
    require(msg.sender == owner);
    _;
}

// Use internal function for rarely called functions
function _checkOwner() internal view {
    require(msg.sender == owner);
}
```

---

## 3. Calldata Optimization (HIGH)

### 3.1 Calldata Over Memory

Calldata is read directly without copying.

```solidity
// Bad: copies to memory
function processData(bytes memory data) external pure returns (bytes32) {
    return keccak256(data);
}

// Good: reads from calldata
function processData(bytes calldata data) external pure returns (bytes32) {
    return keccak256(data);
}
```

### 3.2 Avoid Signed Integers in Parameters

Small negative numbers are expensive in calldata due to two's complement.

```solidity
// Bad: -1 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
function adjust(int256 delta) external;

// Good: use unsigned with separate direction
function adjust(uint256 amount, bool increase) external;
```

### 3.3 Vanity Addresses (Careful)

Addresses with leading zeros cost less in calldata. Use CREATE2, never generate private keys.

```solidity
// Cheaper calldata with leading zeros
// 0x000000000000000000000000abc...
```

---

## 4. Design Patterns (HIGH)

### 4.1 ERC1155 Over ERC721

ERC721 has balanceOf overhead on every mint/transfer.

```solidity
// Prefer ERC1155 for NFT collections
import {ERC1155} from "solmate/tokens/ERC1155.sol";

contract MyNFT is ERC1155 {
    function mint(address to, uint256 id) external {
        _mint(to, id, 1, "");
    }
}
```

### 4.2 ECDSA Signatures Over Merkle Trees

Signatures use less calldata than merkle proofs.

```solidity
// Efficient: single signature
function claim(uint256 amount, bytes calldata signature) external {
    bytes32 hash = keccak256(abi.encodePacked(msg.sender, amount));
    address signer = ECDSA.recover(hash, signature);
    require(signer == trustedSigner, "Invalid signature");
}

// Less efficient: merkle proof (multiple bytes32)
function claim(uint256 amount, bytes32[] calldata proof) external {
    bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
    require(MerkleProof.verify(proof, merkleRoot, leaf));
}
```

### 4.3 ERC20Permit

Combine approve + transfer into single transaction.

```solidity
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

// User signs permit off-chain, anyone can submit
function depositWithPermit(
    uint256 amount,
    uint256 deadline,
    uint8 v, bytes32 r, bytes32 s
) external {
    token.permit(msg.sender, address(this), amount, deadline, v, r, s);
    token.transferFrom(msg.sender, address(this), amount);
}
```

### 4.4 Solmate/Solady Over OpenZeppelin

These libraries offer better gas efficiency.

```solidity
// More gas efficient
import {ERC20} from "solmate/tokens/ERC20.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";

// Or use Solady for even more optimization
import {ERC20} from "solady/tokens/ERC20.sol";
```

### 4.5 Transfer Hooks Over Approve Pattern

ERC1363 and ERC1155 support transfer hooks.

```solidity
// Bad: two transactions
token.approve(contract, amount);
contract.deposit(amount);

// Good: single transaction with ERC1363
token.transferAndCall(contract, amount, data);
```

---

## 5. Cross-Contract Calls (MEDIUM-HIGH)

### 5.1 Multicall Pattern

Batch multiple calls into one transaction.

```solidity
function multicall(bytes[] calldata data) external returns (bytes[] memory results) {
    results = new bytes[](data.length);
    for (uint256 i = 0; i < data.length; ) {
        (bool success, bytes memory result) = address(this).delegatecall(data[i]);
        require(success);
        results[i] = result;
        unchecked { ++i; }
    }
}
```

### 5.2 Cache External Call Results

Store results from expensive external calls.

```solidity
// Chainlink oracle caching
uint256 public cachedPrice;
uint256 public lastPriceUpdate;

function getPrice() public returns (uint256) {
    if (block.timestamp - lastPriceUpdate > 1 hours) {
        cachedPrice = priceFeed.latestAnswer();
        lastPriceUpdate = block.timestamp;
    }
    return cachedPrice;
}
```

### 5.3 ERC2930 Access Lists

Pre-warm storage slots for cross-contract calls.

```javascript
// Transaction with access list (off-chain)
const tx = {
    to: contractAddress,
    data: calldata,
    accessList: [
        {
            address: targetContract,
            storageKeys: ["0x0", "0x1"]  // Storage slots to warm
        }
    ]
};
```

### 5.4 Receive/Fallback Over Deposit Functions

Accept ETH directly without function call overhead.

```solidity
// Instead of deposit() function
receive() external payable {
    balances[msg.sender] += msg.value;
}
```

---

## 6. Compiler Optimizations (MEDIUM)

### 6.1 Optimal For-Loops

```solidity
// Gas-optimal loop pattern
uint256 length = array.length;  // Cache length
for (uint256 i; i < length; ) {  // No initialization
    // logic
    unchecked { ++i; }  // Unchecked increment
}
```

### 6.2 Do-While Over For

Do-while can be cheaper when you know at least one iteration occurs.

```solidity
function process(uint256 times) external {
    if (times == 0) return;

    uint256 i;
    do {
        // logic
        unchecked { ++i; }
    } while (i < times);
}
```

### 6.3 Named Return Variables

Compiler generates more efficient code.

```solidity
// More efficient
function calculate(uint256 x, uint256 y) pure returns (uint256 result) {
    result = x + y;
}

// Less efficient
function calculate(uint256 x, uint256 y) pure returns (uint256) {
    return x + y;
}
```

### 6.4 Bitshifting for Powers of 2

```solidity
// Cheaper: shift costs 3 gas
uint256 doubled = x << 1;    // x * 2
uint256 halved = x >> 1;     // x / 2
uint256 quadrupled = x << 2; // x * 4

// Expensive: mul/div cost 5 gas
uint256 doubled = x * 2;
uint256 halved = x / 2;
```

### 6.5 ++i Over i++

Pre-increment is slightly cheaper.

```solidity
// Slightly cheaper
++i;

// Slightly more expensive
i++;
```

### 6.6 Unchecked Math

Skip overflow checks when safe.

```solidity
function sum(uint256[] calldata values) external pure returns (uint256 total) {
    uint256 length = values.length;
    for (uint256 i; i < length; ) {
        unchecked {
            total += values[i];  // Safe if sum < 2^256
            ++i;
        }
    }
}
```

### 6.7 Short-Circuit Booleans

Order conditions by likelihood.

```solidity
// For &&: put likely-to-fail first
if (amount == 0 && expensiveCheck()) revert();

// For ||: put likely-to-succeed first
if (isWhitelisted[msg.sender] || verifySignature(sig)) {
    // proceed
}
```

### 6.8 Split Require/Revert Statements

```solidity
// Bad: evaluates both
require(x > 0 && y > 0);

// Good: short-circuits
require(x > 0);
require(y > 0);

// Good: separate reverts
if (x < 10) revert TooLow();
if (x > 100) revert TooHigh();
```

### 6.9 Keep Variables Private

Public creates implicit getter, increasing bytecode.

```solidity
// Larger bytecode (implicit getter)
uint256 public value;

// Smaller bytecode
uint256 private _value;

function getValue() external view returns (uint256) {
    return _value;
}
```

### 6.10 Use uint256

EVM works with 32-byte words; smaller types require conversion.

```solidity
// No conversion needed
uint256 public counter;

// Requires conversion (unless packed)
uint8 public counter;  // Converted to uint256 internally
```

### 6.11 Optimizer Run Value

Higher values optimize for execution, lower for deployment.

```javascript
// solidity config
settings: {
    optimizer: {
        enabled: true,
        runs: 10000  // High for frequently-used contracts
    }
}
```

---

## 7. Assembly Tricks (MEDIUM - Use Carefully)

### 7.1 Address Zero Check

```solidity
function requireNonZero(address addr) internal pure {
    assembly {
        if iszero(addr) {
            revert(0, 0)
        }
    }
}
```

### 7.2 Even/Odd Check

```solidity
function isEven(uint256 x) internal pure returns (bool) {
    assembly {
        // x & 1 == 0 means even
        mstore(0, iszero(and(x, 1)))
        return(0, 32)
    }
}
```

### 7.3 Efficient Min/Max

```solidity
function max(uint256 x, uint256 y) internal pure returns (uint256 z) {
    assembly {
        z := xor(x, mul(xor(x, y), gt(y, x)))
    }
}

function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
    assembly {
        z := xor(x, mul(xor(x, y), lt(y, x)))
    }
}
```

### 7.4 Reuse Memory for External Calls

```solidity
function multipleExternalCalls(address target) internal {
    assembly {
        // First call
        mstore(0x00, 0x12345678)  // selector
        mstore(0x04, 100)         // arg1
        pop(staticcall(gas(), target, 0x00, 0x24, 0x00, 0x20))

        // Second call: reuse same memory
        mstore(0x04, 200)         // different arg
        pop(staticcall(gas(), target, 0x00, 0x24, 0x00, 0x20))
    }
}
```

### 7.5 Use Scratch Space for Small Data

Memory 0x00-0x40 is scratch space, 0x40-0x60 is free memory pointer.

```solidity
function hashTwoValues(uint256 a, uint256 b) internal pure returns (bytes32 result) {
    assembly {
        mstore(0x00, a)
        mstore(0x20, b)
        result := keccak256(0x00, 0x40)
    }
}
```

### 7.6 selfbalance() for Contract Balance

```solidity
function getBalance() internal view returns (uint256 bal) {
    assembly {
        bal := selfbalance()
    }
}
```

---

## 8. Dangerous Techniques (AVOID)

These should NOT be used in production:

| Technique | Risk |
|-----------|------|
| Make all functions payable | Accidental ETH transfers |
| Ignore send() return values | Silent transfer failures |
| Use gasleft() for branching | Unpredictable behavior |
| Pass data via gasprice() | Not production viable |
| External library jumping | Unsafe function dispatch |
| Append raw bytecode | Extremely error-prone |

---

## 9. Outdated Patterns

No longer valid in modern Solidity:

- **"external is cheaper than public"** - Compiler optimizes this now
- **"!= 0 is cheaper than > 0"** - Fixed around Solidity 0.8.12

---

## 10. Benchmarking Recommendations

1. **Always test both approaches** - Compiler behavior varies
2. **Use Foundry's gas snapshots** - `forge snapshot`
3. **Check with `--via-ir` flag** - May change optimization results
4. **Profile with different optimizer runs** - 200 vs 10000
5. **Test on actual EVM** - Gas estimates can differ
