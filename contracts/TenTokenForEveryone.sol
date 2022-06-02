// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC20.sol";

contract TenTokenForEveryone is IERC20 {
    mapping(address => uint256) private _balances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /// @return string Returns the name of the token
    function name() external view virtual override returns (string memory) {
        return _name;
    }

    /// @return string Returns the symbol of the token, usually a shorter version of the name
    function symbol() external view virtual override returns (string memory) {
        return _symbol;
    }

    /// @return Always returns 18 as number of decimals used to get its user representation
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /// @return success returns always false
	function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /// @return balance of current address, always 0 or 10
    function balanceOf(address _owner) public view virtual override returns (uint256 balance) {
        return _balances[_owner];
    }

    /// @notice Mints 10 tokens to current sender address (which must be passed as first argument)
    /// @param _to The address which claims tokens, must be equal to current sender
    /// @param _value Strictly 10
    /// @return success returns true after transaction was successfully processed
    function transfer(address _to, uint256 _value) public virtual override returns (bool success) {
        require(msg.sender == _to, "Only sender can claim tokens");
        require(_value == 10, "Only ten tokens available for claim");
        require(_to != address(0), "ERC20: mint to the zero address"); // Should we allow zero address balance ?
        require(balanceOf(_to) == 0, "Account already has tokens");

        _totalSupply += _value;
        _balances[_to] += _value;

        emit Transfer(address(0), _to, _value);

        return true;
    }

    /// @notice Does nothing, should not be used
    /// @return success returns always false
    function transferFrom(address _from, address _to, uint256 _value) public virtual override returns (bool success) {
        return false;
    }

    /// @notice Does nothing, should not be used
    /// @return success returns always false
    function approve(address _spender, uint256 _value) public virtual override returns (bool success) {
        return false;
    }

    /// @notice Does nothing, should not be used
    /// @return remaining returns always 0
    function allowance(address _owner, address _spender) public virtual override view returns (uint256 remaining) {
        return 0;
    }
}
