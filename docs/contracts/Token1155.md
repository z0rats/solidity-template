# Token1155

## Contract Description


License: MIT

## 

```solidity
contract Token1155 is ERC1155, Ownable
```


## State variables info

### name (0x06fdde03)

```solidity
string name
```

Contract name
### symbol (0x95d89b41)

```solidity
string symbol
```

Contract symbol
## Functions info

### constructor

```solidity
constructor(
    string memory _name,
    string memory _symbol,
    string memory uri
) ERC1155(uri)
```

Creates a new ERC-1155 items contract.
### mintBatch (0x1f7fdffa)

```solidity
function mintBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
) external onlyOwner
```

Mints one item to address `to`.


Parameters:

| Name | Type    | Description                  |
| :--- | :------ | :--------------------------- |
| to   | address | The address to mint item on. |

### setURI (0x02fe5305)

```solidity
function setURI(string memory newURI) external onlyOwner
```

Sets the `_uri` of the contract.


Parameters:

| Name   | Type   | Description |
| :----- | :----- | :---------- |
| newURI | string | New URI.    |
