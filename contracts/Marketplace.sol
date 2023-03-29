// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard{



    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;

    struct Item{
        address payable seller;
        IERC721 nft;
        uint itemId;
        uint tokenId;
        uint price;
        bool sold;
    }

    event Offered (
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    

    mapping(uint => Item)items;

    constructor(uint _feePercent){
        feeAccount= payable(msg.sender);
        feePercent= _feePercent;
    }

    function makeItem(IERC721 _nft,uint _tokenId,uint _price)external nonReentrant{
        require(_price>0,"the price should be greater than 0");
        itemCount++;
        _nft.transferFrom(msg.sender,address(this),_tokenId);
        items[itemCount]=Item(
            payable(msg.sender),
            _nft,
            itemCount,
            _tokenId,
            _price,
            false
        );
        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint _itemId) external payable nonReentrant{
        uint _totalPrice=getTotalPrice(_itemId);
        Item storage item= items[_itemId];
        require(_itemId>0 && _itemId<=itemCount);
        require(msg.value>= _totalPrice,"not enough ethers to cover the price");
        require(!item.sold,"item aready sold");

        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice-item.price);
        item.sold=true;
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function getTotalPrice(uint _itemId) public view returns(uint){
        return(items[_itemId].price*(100+feePercent)/100);
    }



}

