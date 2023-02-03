// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/// @title ERC1155 items creation contract.
contract Token1155 is ERC1155, Ownable {
    /// Contract name
    string public name;

    /// Contract symbol
    string public symbol;

    /// @notice Creates a new ERC-1155 items contract.
    constructor(string memory _name, string memory _symbol, string memory uri) ERC1155(uri) {
        name = _name;
        symbol = _symbol;
    }

    /// @notice Mints one item to address `to`.
    /// @param to The address to mint item on.
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) external onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }

    /// @notice Sets the `_uri` of the contract.
    /// @param newURI New URI.
    function setURI(string memory newURI) external onlyOwner {
        _setURI(newURI);
    }
}