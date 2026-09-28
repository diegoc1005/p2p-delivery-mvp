// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract P2PDeliveryEscrow {
    enum OrderStatus { PENDING, ESCROW_LOCKED, DELIVERED, CANCELLED }

    struct EscrowDetails {
        string orderId;
        address restaurant;
        address courier;
        uint256 foodAmount;
        uint256 deliveryFee;
        OrderStatus status;
    }

    mapping(string => EscrowDetails) public escrows;
    address public owner;

    event EscrowLocked(string orderId, address restaurant, address courier, uint256 foodAmount, uint256 deliveryFee);
    event EscrowReleased(string orderId, address restaurant, address courier, uint256 totalReleased);

    constructor() {
        owner = msg.sender;
    }

    function deposit(
        string memory orderId, 
        address restaurant, 
        address courier, 
        uint256 foodAmount, 
        uint256 deliveryFee
    ) external payable {
        require(msg.value == (foodAmount + deliveryFee), "Deposit must equal total amount");
        require(escrows[orderId].status == OrderStatus.PENDING, "Order already exists or not pending");

        escrows[orderId] = EscrowDetails({
            orderId: orderId,
            restaurant: restaurant,
            courier: courier,
            foodAmount: foodAmount,
            deliveryFee: deliveryFee,
            status: OrderStatus.ESCROW_LOCKED
        });

        emit EscrowLocked(orderId, restaurant, courier, foodAmount, deliveryFee);
    }

    function releaseFunds(string memory orderId) external {
        // In a real app, only the courier or an authorized oracle (backend) can call this
        // For hackathon simplicity, we allow the backend relayer to trigger it
        EscrowDetails storage escrow = escrows[orderId];
        require(escrow.status == OrderStatus.ESCROW_LOCKED, "Escrow not locked");
        
        escrow.status = OrderStatus.DELIVERED;

        // Transfer food money to restaurant
        (bool successRes, ) = payable(escrow.restaurant).call{value: escrow.foodAmount}("");
        require(successRes, "Transfer to restaurant failed");

        // Transfer delivery fee to courier
        (bool successCour, ) = payable(escrow.courier).call{value: escrow.deliveryFee}("");
        require(successCour, "Transfer to courier failed");

        emit EscrowReleased(orderId, escrow.restaurant, escrow.courier, escrow.foodAmount + escrow.deliveryFee);
    }
}
