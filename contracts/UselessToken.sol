// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UselessToken is ERC20 {
    // initialSupply in wei
    constructor() public ERC20("UselessToken", "UST") {
        _mint(msg.sender, 1000000000000000000000000);
    }
}
