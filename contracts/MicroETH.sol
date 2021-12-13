// SPDX-License-Identifier: GPL-3.0-only

//       __  ____                 _______________   __
//      /  |/   /_______________ / ____/__  __/ /  / /
//     / /|_/ / / ___/ ___/ __ \/ __/    / / / /__/ /
//    / /  / / / /__/ /  / /_/ / /___   / / / ___  /
//   /_/  /_/_/\___/_/   \____/_____/  /_/ /_/  /_/
//

pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract MicroETH {

    uint256 private x = 123;

    //
    // External methods
    //

    constructor() {
        x = 456;
    }

    function getX() public view returns (uint256) {
        return x;
    }

    // ...
}
