// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TenTokenForEveryone is ERC20 {
    uint constant TOKEN_AMOUNT_TO_CLAIM = 10 ether;
    // Storing addresses that already claimed tokens
    mapping(address => bool) private _claimedAddresses;

    constructor(string memory name_, string memory symbol_, uint256 initialSupply) ERC20(name_, symbol_)  {
        require(initialSupply > 0, "Initial supply must be greater than zero");
        _mint(address(this), initialSupply);
    }

    /// @notice Sends tokens to address who claimed it
    function claim() public {
        require(!hasAlreadyClaimed(), "Account already has tokens");
        _transfer(address(this), msg.sender, TOKEN_AMOUNT_TO_CLAIM);
        _claimedAddresses[msg.sender] = true;
    }

    /// @notice Checks that current address has already claimed tokens
    /// @return hasClaimed
    function hasAlreadyClaimed() public view returns (bool) {
        return _claimedAddresses[msg.sender];
    }
}
