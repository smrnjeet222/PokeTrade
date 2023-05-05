// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract MarketPlaceUpgradeableProxy is TransparentUpgradeableProxy {
    constructor(
        address _logic,
        address admin_,
        bytes memory _data
    ) payable TransparentUpgradeableProxy(_logic, admin_, _data) {}

    modifier OnlyAdmin() {
        require(msg.sender == _getAdmin(), "Admin Only");
        _;
    }

    function getImplementation() external view OnlyAdmin returns (address) {
        return _getImplementation();
    }
}
