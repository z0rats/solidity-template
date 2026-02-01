// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.33;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title ERC721 item creation contract.
contract Token721 is ERC721URIStorage, Ownable {
    /// @notice Creates a new ERC-721 item collection.
    /// @param name   Name of the collection.
    /// @param symbol Symbol of the collection.
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {}

    /// @notice Safely mints `tokenId` and transfers it to `to`.
    /// @param to       The address to mint to.
    /// @param tokenId  The ID of the token.
    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
