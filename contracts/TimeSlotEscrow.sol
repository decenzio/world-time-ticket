// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TimeSlotEscrow
 * @dev Escrow contract for TimeSlot marketplace bookings
 * Handles deposits, releases, refunds, and disputes for time slot bookings
 */
contract TimeSlotEscrow is ReentrancyGuard, Ownable {
    
    enum BookingStatus {
        Deposited,      // Funds deposited, booking confirmed
        Released,       // Funds released to seller
        Refunded,       // Funds refunded to buyer
        Disputed        // Booking in dispute, funds locked
    }
    
    struct Booking {
        address buyer;
        address seller;
        address token;          // Token contract address (USDC/WLD)
        uint256 amount;
        uint256 createdAt;
        uint256 scheduledTime;  // Unix timestamp of scheduled session
        BookingStatus status;
        bool buyerFeedback;     // Has buyer left feedback
        bool sellerFeedback;    // Has seller left feedback
        string sessionNotes;    // Optional notes from buyer
    }
    
    // Mapping from booking ID to booking details
    mapping(bytes32 => Booking) public bookings;
    
    // Mapping to track user's active bookings
    mapping(address => bytes32[]) public userBookings;
    
    // Supported tokens (USDC, WLD)
    mapping(address => bool) public supportedTokens;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFee = 250;
    
    // Dispute timeout (24 hours after scheduled time)
    uint256 public constant DISPUTE_TIMEOUT = 24 hours;
    
    // Auto-release timeout (7 days after scheduled time)
    uint256 public constant AUTO_RELEASE_TIMEOUT = 7 days;
    
    // Events
    event BookingCreated(
        bytes32 indexed bookingId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        address token
    );
    
    event FundsReleased(
        bytes32 indexed bookingId,
        address indexed seller,
        uint256 amount
    );
    
    event FundsRefunded(
        bytes32 indexed bookingId,
        address indexed buyer,
        uint256 amount
    );
    
    event BookingDisputed(
        bytes32 indexed bookingId,
        address indexed initiator
    );
    
    event FeedbackSubmitted(
        bytes32 indexed bookingId,
        address indexed user,
        bool isBuyer
    );
    
    constructor(address _owner) {
        _transferOwnership(_owner);
    }
    
    /**
     * @dev Add supported token
     */
    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
    }
    
    /**
     * @dev Remove supported token
     */
    function removeSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
    }
    
    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%");
        platformFee = _fee;
    }
    
    /**
     * @dev Create a new booking with escrow deposit
     */
    function createBooking(
        address _seller,
        address _token,
        uint256 _amount,
        uint256 _scheduledTime,
        string calldata _sessionNotes
    ) external nonReentrant returns (bytes32) {
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Cannot book yourself");
        require(supportedTokens[_token], "Token not supported");
        require(_amount > 0, "Amount must be greater than 0");
        require(_scheduledTime > block.timestamp, "Scheduled time must be in future");
        
        // Generate unique booking ID
        bytes32 bookingId = keccak256(
            abi.encodePacked(
                msg.sender,
                _seller,
                _amount,
                _scheduledTime,
                block.timestamp,
                block.number
            )
        );
        
        require(bookings[bookingId].buyer == address(0), "Booking already exists");
        
        // Transfer tokens to escrow
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        
        // Create booking
        bookings[bookingId] = Booking({
            buyer: msg.sender,
            seller: _seller,
            token: _token,
            amount: _amount,
            createdAt: block.timestamp,
            scheduledTime: _scheduledTime,
            status: BookingStatus.Deposited,
            buyerFeedback: false,
            sellerFeedback: false,
            sessionNotes: _sessionNotes
        });
        
        // Track user bookings
        userBookings[msg.sender].push(bookingId);
        userBookings[_seller].push(bookingId);
        
        emit BookingCreated(bookingId, msg.sender, _seller, _amount, _token);
        
        return bookingId;
    }
    
    /**
     * @dev Submit feedback for a booking
     */
    function submitFeedback(bytes32 _bookingId) external {
        Booking storage booking = bookings[_bookingId];
        require(booking.buyer != address(0), "Booking does not exist");
        require(
            msg.sender == booking.buyer || msg.sender == booking.seller,
            "Not authorized"
        );
        require(booking.status == BookingStatus.Deposited, "Invalid booking status");
        require(block.timestamp >= booking.scheduledTime, "Session not completed yet");
        
        bool isBuyer = msg.sender == booking.buyer;
        
        if (isBuyer) {
            require(!booking.buyerFeedback, "Feedback already submitted");
            booking.buyerFeedback = true;
        } else {
            require(!booking.sellerFeedback, "Feedback already submitted");
            booking.sellerFeedback = true;
        }
        
        emit FeedbackSubmitted(_bookingId, msg.sender, isBuyer);
        
        // Auto-release if both parties submitted feedback
        if (booking.buyerFeedback && booking.sellerFeedback) {
            _releaseFunds(_bookingId);
        }
    }
    
    /**
     * @dev Release funds to seller (internal)
     */
    function _releaseFunds(bytes32 _bookingId) internal {
        Booking storage booking = bookings[_bookingId];
        require(booking.status == BookingStatus.Deposited, "Invalid booking status");
        
        booking.status = BookingStatus.Released;
        
        // Calculate platform fee
        uint256 fee = (booking.amount * platformFee) / 10000;
        uint256 sellerAmount = booking.amount - fee;
        
        // Transfer funds
        IERC20(booking.token).transfer(booking.seller, sellerAmount);
        if (fee > 0) {
            IERC20(booking.token).transfer(owner(), fee);
        }
        
        emit FundsReleased(_bookingId, booking.seller, sellerAmount);
    }
    
    /**
     * @dev Admin release funds (after dispute resolution)
     */
    function adminReleaseFunds(bytes32 _bookingId) external onlyOwner {
        _releaseFunds(_bookingId);
    }
    
    /**
     * @dev Refund funds to buyer
     */
    function refundFunds(bytes32 _bookingId) external {
        Booking storage booking = bookings[_bookingId];
        require(booking.buyer != address(0), "Booking does not exist");
        require(
            msg.sender == booking.buyer || msg.sender == owner(),
            "Not authorized"
        );
        require(booking.status == BookingStatus.Deposited, "Invalid booking status");
        
        // Buyer can only refund before scheduled time
        if (msg.sender == booking.buyer) {
            require(block.timestamp < booking.scheduledTime, "Cannot refund after scheduled time");
        }
        
        booking.status = BookingStatus.Refunded;
        
        // Refund full amount to buyer
        IERC20(booking.token).transfer(booking.buyer, booking.amount);
        
        emit FundsRefunded(_bookingId, booking.buyer, booking.amount);
    }
    
    /**
     * @dev Initiate dispute
     */
    function initiateDispute(bytes32 _bookingId) external {
        Booking storage booking = bookings[_bookingId];
        require(booking.buyer != address(0), "Booking does not exist");
        require(
            msg.sender == booking.buyer || msg.sender == booking.seller,
            "Not authorized"
        );
        require(booking.status == BookingStatus.Deposited, "Invalid booking status");
        require(
            block.timestamp >= booking.scheduledTime &&
            block.timestamp <= booking.scheduledTime + DISPUTE_TIMEOUT,
            "Dispute window closed"
        );
        
        booking.status = BookingStatus.Disputed;
        
        emit BookingDisputed(_bookingId, msg.sender);
    }
    
    /**
     * @dev Auto-release funds after timeout
     */
    function autoReleaseFunds(bytes32 _bookingId) external {
        Booking storage booking = bookings[_bookingId];
        require(booking.buyer != address(0), "Booking does not exist");
        require(booking.status == BookingStatus.Deposited, "Invalid booking status");
        require(
            block.timestamp >= booking.scheduledTime + AUTO_RELEASE_TIMEOUT,
            "Auto-release timeout not reached"
        );
        
        _releaseFunds(_bookingId);
    }
    
    /**
     * @dev Get booking details
     */
    function getBooking(bytes32 _bookingId) external view returns (
        address buyer,
        address seller,
        address token,
        uint256 amount,
        uint256 createdAt,
        uint256 scheduledTime,
        BookingStatus status,
        bool buyerFeedback,
        bool sellerFeedback,
        string memory sessionNotes
    ) {
        Booking memory booking = bookings[_bookingId];
        return (
            booking.buyer,
            booking.seller,
            booking.token,
            booking.amount,
            booking.createdAt,
            booking.scheduledTime,
            booking.status,
            booking.buyerFeedback,
            booking.sellerFeedback,
            booking.sessionNotes
        );
    }
    
    /**
     * @dev Get user's booking IDs
     */
    function getUserBookings(address _user) external view returns (bytes32[] memory) {
        return userBookings[_user];
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}
