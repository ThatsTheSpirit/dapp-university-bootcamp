// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public immutable feeAccount;
    uint256 public feePercent;

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //deposit tokens
    function depositToken(address _token, uint256 _amount) public {
        //Transfer tokens to exchange
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        //Update balance
        //Emit an event
    }

    //check balances
}
