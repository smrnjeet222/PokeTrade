// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PokeCardERC1155 is ERC1155, Ownable {
    string public name;
    string public symbol;

    uint256 public _currentTokenID = 0;

    mapping(uint => string) public tokenURI;
    mapping(address => uint[]) public tokenIdsOwned;

    constructor() ERC1155("") {
        name = "Pokemon Cards";
        symbol = "POKE";
    }

    function mint(address _to, uint _amount) external onlyOwner {
        _mint(_to, _currentTokenID, _amount, "");
        tokenIdsOwned[_to].push(_currentTokenID);
        _currentTokenID++;
    }

    function mintById(address _to, uint _id, uint _amount) external onlyOwner {
        _mint(_to, _id, _amount, "");
        tokenIdsOwned[_to].push(_id);
    }

    function listOfTokenIdsOwned(
        address owner
    ) external view returns (uint[] memory) {
        return tokenIdsOwned[owner];
    }

    function mintBatch(
        address _to,
        uint[] memory _ids,
        uint[] memory _amounts
    ) external onlyOwner {
        _mintBatch(_to, _ids, _amounts, "");
        for (uint i = 0; i < _ids.length; i++) {
            tokenIdsOwned[_to].push(_ids[i]);
        }
    }

    function burn(uint _id, uint _amount) external {
        _burn(msg.sender, _id, _amount);
    }

    function burnBatch(uint[] memory _ids, uint[] memory _amounts) external {
        _burnBatch(msg.sender, _ids, _amounts);
    }

    function burnForMint(
        address _from,
        uint[] memory _burnIds,
        uint[] memory _burnAmounts,
        uint[] memory _mintIds,
        uint[] memory _mintAmounts
    ) external onlyOwner {
        _burnBatch(_from, _burnIds, _burnAmounts);
        _mintBatch(_from, _mintIds, _mintAmounts, "");
    }

    function setURI(uint _id, string memory _uri) external onlyOwner {
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    function uri(uint _id) public view override returns (string memory) {
        return tokenURI[_id];
    }
}
