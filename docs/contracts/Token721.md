# Token721

## Contract Description


License: MIT

## 

```solidity
contract Token721 is ERC721URIStorage, Ownable
```


## Functions info

### constructor

```solidity
constructor(string memory name, string memory symbol) ERC721(name, symbol)
```

Creates a new ERC-721 item collection.


Parameters:

| Name   | Type   | Description               |
| :----- | :----- | :------------------------ |
| name   | string | Name of the collection.   |
| symbol | string | Symbol of the collection. |

### safeMint (0xd204c45e)

```solidity
function safeMint(
    address to,
    string memory tokenURI
) external onlyOwner returns (uint256)
```

Safely mints `tokenId` and transfers it to `to`.


Parameters:

| Name     | Type    | Description                   |
| :------- | :------ | :---------------------------- |
| to       | address | The address to mint to.       |
| tokenURI | string  | The URI of the token.         |
