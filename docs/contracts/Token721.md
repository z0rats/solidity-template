# Token721

## Contract Description


License: MIT

## Events info

### Approval event

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
```


Emitted when `owner` enables `approved` to manage the `tokenId` token.

### ApprovalForAll event

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
```


Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.

### OwnershipTransferred event

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

### Transfer event

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
```


Emitted when `tokenId` token is transferred from `from` to `to`.

## Functions info

### approve (0x095ea7b3)

```solidity
function approve(address to, uint256 tokenId) external;
```


See {IERC721-approve}.

### balanceOf (0x70a08231)

```solidity
function balanceOf(address owner) external view returns (uint256);
```


See {IERC721-balanceOf}.

### getApproved (0x081812fc)

```solidity
function getApproved(uint256 tokenId) external view returns (address);
```


See {IERC721-getApproved}.

### isApprovedForAll (0xe985e9c5)

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool);
```


See {IERC721-isApprovedForAll}.

### name (0x06fdde03)

```solidity
function name() external view returns (string);
```


See {IERC721Metadata-name}.

### owner (0x8da5cb5b)

```solidity
function owner() external view returns (address);
```


Returns the address of the current owner.

### ownerOf (0x6352211e)

```solidity
function ownerOf(uint256 tokenId) external view returns (address);
```


See {IERC721-ownerOf}.

### renounceOwnership (0x715018a6)

```solidity
function renounceOwnership() external;
```


Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

### safeMint (0xd204c45e)

```solidity
function safeMint(address to, string tokenURI) external returns (uint256);
```


Safely mints `tokenId` and transfers it to `to`.


Parameters:

| Name     | Type    | Description             |
| :------- | :------ | :---------------------- |
| to       | address | The address to mint to. |
| tokenURI | string  | The URI of the token.   |

### safeTransferFrom (0x42842e0e)

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external;
```


See {IERC721-safeTransferFrom}.

### safeTransferFrom (0xb88d4fde)

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external;
```


See {IERC721-safeTransferFrom}.

### setApprovalForAll (0xa22cb465)

```solidity
function setApprovalForAll(address operator, bool approved) external;
```


See {IERC721-setApprovalForAll}.

### supportsInterface (0x01ffc9a7)

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool);
```


See {IERC165-supportsInterface}.

### symbol (0x95d89b41)

```solidity
function symbol() external view returns (string);
```


See {IERC721Metadata-symbol}.

### tokenURI (0xc87b56dd)

```solidity
function tokenURI(uint256 tokenId) external view returns (string);
```


See {IERC721Metadata-tokenURI}.

### transferFrom (0x23b872dd)

```solidity
function transferFrom(address from, address to, uint256 tokenId) external;
```


See {IERC721-transferFrom}.

### transferOwnership (0xf2fde38b)

```solidity
function transferOwnership(address newOwner) external;
```


Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.
