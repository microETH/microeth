// SPDX-License-Identifier: GPL-3.0-only

//                                   _______________   __
//      ____ ___  __ _____________  / ____/__  __/ /  / /
//     / __  __ \/ / ___/ ___/ __ \/ __/    / / / /__/ /
//    / / / / / / / /__/ /  / /_/ / /___   / / / ___  /
//   /_/ /_/ /_/_/\___/_/   \____/_____/  /_/ /_/  /_/
//

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MicroETH is ERC20, ReentrancyGuard {

    //
    // Definitions
    //

    uint256 public constant ONE_UETH_WEI = 1e12;   // 1 μETH or 0.000001 ETH or 1000 gwei or 1000000000000 wei or 10^12
    uint256 public constant ETH_CONVERSION = 1e6;  // Map Wei to μETH at this rate

    event Deposit(address indexed from, uint256 value);
    event Withdrawal(address indexed to, uint256 value);

    //
    // External methods
    //

    constructor() ERC20("microETH", "\xCE\xBCETH") {
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
        if (msg.value < ONE_UETH_WEI) {
            revert("Minimum deposit is 1 \xCE\xBCETH.");
        }

        // Mint tokens
        uint256 ueth = msg.value * ETH_CONVERSION;
        _mint(msg.sender, ueth);
        emit Deposit(msg.sender, ueth);
    }

    function withdraw(uint256 ueth) external nonReentrant {
        if (ueth < ETH_CONVERSION) {
            revert("Minimum withdrawal is 0.000000000001 \xCE\xBCETH.");
        }

        uint256 balance = balanceOf(msg.sender);
        if (ueth > balance) {
            revert("Insufficient balance.");
        }

        // Burn tokens
        _burn(msg.sender, ueth);

        // Send ether
        uint256 value = ueth / ETH_CONVERSION;
        (bool sent,) = msg.sender.call{value: value}("");
        if (!sent) {
            revert("Failed to withdraw.");
        }

        emit Withdrawal(msg.sender, ueth);
    }

    // ...
}
