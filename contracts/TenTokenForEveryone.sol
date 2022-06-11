// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TenTokenForEveryone is ERC20 {
    // Storing addresses that already claimed tokens
    mapping(address => bool) private _claimedAddresses;
    // Contract creator address to store initialSupply
    address _initialAddress;

    constructor(string memory name_, string memory symbol_, uint256 initialSupply) ERC20(name_, symbol_)  {
        require(initialSupply > 0, "Initial supply must be greater than zero");
        _initialAddress = address(this);
        _mint(_initialAddress, initialSupply);
        _claimedAddresses[_initialAddress] = true;
    }

    /// @notice Sends tokens to address who claimed it
    /// @return success returns true if claim was successful
    function claim() public returns (bool success) {
        require(!hasAlreadyClaimed(), "Account already has tokens");
        _transfer(_initialAddress, msg.sender, 10);
        _claimedAddresses[msg.sender] = true;
        return true;
    }

    /// @notice Checks that current address has already claimed tokens
    /// @return hasClaimed
    function hasAlreadyClaimed() public view returns (bool hasClaimed) {
        return _claimedAddresses[msg.sender];
    }
}
