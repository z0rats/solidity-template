# Token721

## Overview

#### License: MIT

## 

```solidity
contract Token721 is ERC721URIStorage, Ownable
```


## Functions info

### constructor

```solidity
constructor(
    string memory name,
    string memory symbol,
    address initialOwner
) ERC721(name, symbol) Ownable(initialOwner)
```

Creates a new ERC-721 item collection.


Parameters:

| Name   | Type   | Description               |
| :----- | :----- | :------------------------ |
| name   | string | Name of the collection.   |
| symbol | string | Symbol of the collection. |

### safeMint (0xa1448194)

```solidity
function safeMint(address to, uint256 tokenId) public onlyOwner
```

Safely mints `tokenId` and transfers it to `to`.


Parameters:

| Name    | Type    | Description                   |
| :------ | :------ | :---------------------------- |
| to      | address | The address to mint to.       |
| tokenId | uint256 | The ID of the token.          |
