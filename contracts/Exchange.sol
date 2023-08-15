// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public immutable feeAccount;
    uint256 public feePercent;
    // token address, user address, balance
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    uint256 public ordersCount;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    struct _Order {
        uint256 id;
        address user; //User who made an order
        address tokenGet; //Address of the token they receive
        uint256 amountGet; //Amount they receive
        address tokenGive; //Address of the token they spend
        uint256 amountGive; //Amount they spend
        uint256 timestamp; //When an order was created
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //deposit tokens
    function depositToken(address _token, uint256 _amount) public {
        //Transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        //Update balance
        tokens[_token][msg.sender] += _amount;
        //Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        //Ensure user has enough tokens to withdraw
        require(tokens[_token][msg.sender] >= _amount);
        //Transfer tokens to user
        Token(_token).transfer(msg.sender, _amount);
        //Update user balance

        tokens[_token][msg.sender] -= _amount;

        //Emit an event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //check balances
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    //MAKE AND CANCEL ORDERS

    //Token Give(the token they want to spend), which token and how much
    //Token Get(the token they want to receive), which token and how much
    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        //require token balance
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive);

        //++ordersCount;
        orders[ordersCount] = _Order(
            ++ordersCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        //emit the event
        emit Order(
            ordersCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }
}
