// SPDX-License-Identifier: GPL-3.0-only

//       __  ____                 _______________   __
//      /  |/  /_______________  / ____/__  __/ /  / /
//     / /|_/ / / ___/ ___/ __ \/ __/    / / / /__/ /
//    / /  / / / /__/ /  / /_/ / /___   / / / ___  /
//   /_/  /_/_/\___/_/   \____/_____/  /_/ /_/  /_/
//

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MicroETH is ERC20, ReentrancyGuard {

    //
    // Definitions
    //

    uint256 public constant ONE_METH = 1e12; // 1000000000000 wei or 0.000001 eth or 1 szabo

    event Deposit(address indexed from, uint256 value);
    event Withdrawal(address indexed to, uint256 value);

    //
    // External methods
    //

    constructor() ERC20("MicroETH", "METH") {
        // ...
    }

    fallback() external payable nonReentrant {
        _deposit();
    }

    //
    // External ether conversion methods
    //

    function deposit() external payable nonReentrant {
        _deposit();
    }

    function _deposit() private {
        if (msg.value < ONE_METH) {
            revert("Minimum deposit is 1 METH.");
        }

        uint256 meth = msg.value / ONE_METH;
        uint256 remainder = msg.value % ONE_METH;

        // Mint tokens
        _mint(msg.sender, meth);

        // Refund remainder
        (bool sent, bytes memory data) = msg.sender.call{value: remainder}("");
        if (!sent) {
            revert("Failed to send refund fraction.");
        }

        emit Deposit(msg.sender, meth);
    }

    function withdraw(uint256 meth) external nonReentrant {
        if (meth < 1) {
            revert("Minimum withdrawal is 1 METH.");
        }

        uint256 balanceMeth = balanceOf(msg.sender);
        if (meth > balanceMeth) {
            revert("Insufficient balance.");
        }

        // Burn tokens
        _burn(msg.sender, meth);

        // Send ether
        uint256 value = ONE_METH * meth;
        (bool sent, bytes memory data) = msg.sender.call{value: value}("");
        if (!sent) {
            revert("Failed to withdraw.");
        }

        emit Withdrawal(msg.sender, meth);
    }

    // ...
}
