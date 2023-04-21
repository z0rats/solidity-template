# Token1155

## Contract Description


License: MIT

## Events info

### ApprovalForAll event

```solidity
event ApprovalForAll(address indexed account, address indexed operator, bool approved);
```


Emitted when `account` grants or revokes permission to `operator` to transfer their tokens, according to `approved`.

### OwnershipTransferred event

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

### TransferBatch event

```solidity
event TransferBatch(
	address indexed operator,
	address indexed from,
	address indexed to,
	uint256[] ids,
	uint256[] values
);
```


Equivalent to multiple {TransferSingle} events, where `operator`, `from` and `to` are the same for all transfers.

### TransferSingle event

```solidity
event TransferSingle(
	address indexed operator,
	address indexed from,
	address indexed to,
	uint256 id,
	uint256 value
);
```


Emitted when `value` tokens of token type `id` are transferred from `from` to `to` by `operator`.

### URI event

```solidity
event URI(string value, uint256 indexed id);
```


Emitted when the URI for token type `id` changes to `value`, if it is a non-programmatic URI. If an {URI} event was emitted for `id`, the standard https://eips.ethereum.org/EIPS/eip-1155#metadata-extensions[guarantees] that `value` will equal the value returned by {IERC1155MetadataURI-uri}.

## Functions info

### balanceOf (0x00fdd58e)

```solidity
function balanceOf(address account, uint256 id) external view returns (uint256);
```


See {IERC1155-balanceOf}. Requirements: - `account` cannot be the zero address.

### balanceOfBatch (0x4e1273f4)

```solidity
function balanceOfBatch(address[] accounts, uint256[] ids) external view returns (uint256[]);
```


See {IERC1155-balanceOfBatch}. Requirements: - `accounts` and `ids` must have the same length.

### isApprovedForAll (0xe985e9c5)

```solidity
function isApprovedForAll(address account, address operator) external view returns (bool);
```


See {IERC1155-isApprovedForAll}.

### mintBatch (0x1f7fdffa)

```solidity
function mintBatch(address to, uint256[] ids, uint256[] amounts, bytes data) external;
```


Mints one item to address `to`.


Parameters:

| Name | Type    | Description                  |
| :--- | :------ | :--------------------------- |
| to   | address | The address to mint item on. |

### name (0x06fdde03)

```solidity
function name() external view returns (string);
```


Contract name

### owner (0x8da5cb5b)

```solidity
function owner() external view returns (address);
```


Returns the address of the current owner.

### renounceOwnership (0x715018a6)

```solidity
function renounceOwnership() external;
```


Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

### safeBatchTransferFrom (0x2eb2c2d6)

```solidity
function safeBatchTransferFrom(
	address from,
	address to,
	uint256[] ids,
	uint256[] amounts,
	bytes data
) external;
```


See {IERC1155-safeBatchTransferFrom}.

### safeTransferFrom (0xf242432a)

```solidity
function safeTransferFrom(
	address from,
	address to,
	uint256 id,
	uint256 amount,
	bytes data
) external;
```


See {IERC1155-safeTransferFrom}.

### setApprovalForAll (0xa22cb465)

```solidity
function setApprovalForAll(address operator, bool approved) external;
```


See {IERC1155-setApprovalForAll}.

### setURI (0x02fe5305)

```solidity
function setURI(string newURI) external;
```


Sets the `_uri` of the contract.


Parameters:

| Name   | Type   | Description |
| :----- | :----- | :---------- |
| newURI | string | New URI.    |

### supportsInterface (0x01ffc9a7)

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```


See {IERC165-supportsInterface}.

### symbol (0x95d89b41)

```solidity
function symbol() external view returns (string);
```


Contract symbol

### transferOwnership (0xf2fde38b)

```solidity
function transferOwnership(address newOwner) external;
```


Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.

### uri (0x0e89341c)

```solidity
function uri(uint256) external view returns (string);
```


See {IERC1155MetadataURI-uri}. This implementation returns the same URI for *all* token types. It relies on the token type ID substitution mechanism https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP]. Clients calling this function must replace the `\{id\}` substring with the actual token type ID.
