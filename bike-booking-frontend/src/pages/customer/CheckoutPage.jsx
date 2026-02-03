import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Card, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../api/bookingApi';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../api/paymentApi';
import { resetBooking } from '../../context/bookingSlice';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';

const CheckoutPage = () => {
    const { selectedBike, selectedDealer } = useSelector((state) => state.booking);
    const { user } = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [paymentOption, setPaymentOptionState] = useState('FULL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!selectedBike || !selectedDealer) {
        // navigate('/customer/home'); // Commented out to prevent redirect during dev hot reload if state lost
        return <div className="text-white text-center mt-5">Session lost. Please start again from Home. <Button onClick={() => navigate('/customer/home')}>Go Home</Button></div>;
    }

    // Validate User Session
    if (!user || !user.userId) {
        toast.warning("Session expired. Please login again.");
        navigate('/login');
        return;
    }

    const basePrice = selectedDealer.price; // Use dealer price
    const totalAmount = basePrice;

    const payableAmount = paymentOption === 'FULL' ? totalAmount : totalAmount * 0.20;

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);

        // Validation for IDs
        const customerId = parseInt(user.userId);
        const dealerId = parseInt(selectedDealer.dealerId);
        const bikeId = parseInt(selectedBike.bikeId);

        if (isNaN(customerId) || isNaN(dealerId) || isNaN(bikeId)) {
            console.error("Invalid IDs:", { customerId, dealerId, bikeId });
            toast.error("Booking Error: Invalid User or Bike Data. Please refresh.");
            setLoading(false);
            return;
        }

        const payload = {
            customerId: customerId,
            dealerId: dealerId,
            bikeId: bikeId,
            paymentOption: paymentOption,
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        try {
            // 1. Create Booking
            const response = await createBooking(payload);

            if (response.success) {
                const bookingId = response.data.bookingId;
                const remainingToPay = response.data.remainingAmount > 0 ? response.data.remainingAmount : response.data.totalAmount; // Logic might vary based on backend
                // Actually the backend response should have the correct amounts.
                // But for checkout, we want to pay execution *of the chosen option*.
                // If Full Payment chosen, we pay Total. If Advance, we pay Advance.
                // The `booking` object returned likely has `paidAmount` = 0 initially.

                const amountToPayNow = paymentOption === 'FULL' ? totalAmount : (totalAmount * 0.20);

                // 2. Initiate Razorpay immediately
                const res = await loadRazorpayScript();
                if (!res) {
                    toast.error("Razorpay SDK failed to load. Booking created but payment pending.");
                    navigate('/customer/bookings');
                    return;
                }

                // Create Order for this booking
                // We need to call the createOrder API we made earlier.
                // Import it first! using dynamic import or duplicate logic? Better add import.

                // Note: require might not work with ES modules in Vite unless configured, better to add top imports.
                // I will add imports in a separate Edit step to be safe.
                // For now, let's assume imports are there, or I insert them.

                // Create Order for this booking
                // We need to call the createOrder API we made earlier.

                const orderRes = await createRazorpayOrder(bookingId, amountToPayNow);
                if (!orderRes.success) {
                    toast.warning("Booking Confirmed, but Payment Server Error. Please pay from My Bookings.");
                    navigate('/customer/bookings');
                    return;
                }

                const options = {
                    key: "rzp_test_S88LQF78WCxZRc",
                    amount: Math.round(amountToPayNow * 100),
                    currency: "INR",
                    name: "Bike Booking System",
                    description: `Payment for Booking #${bookingId}`,
                    image: "https://example.com/logo.png",
                    order_id: orderRes.data,
                    handler: async function (response) {
                        try {
                            const verifyRes = await verifyRazorpayPayment({
                                bookingId: bookingId,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (verifyRes.success) {
                                toast.success("Payment Successful! Booking Confirmed.");
                                dispatch(resetBooking());
                                navigate('/customer/bookings');
                            } else {
                                toast.error("Payment Verification Failed. Please check My Bookings.");
                                navigate('/customer/bookings');
                            }
                        } catch (err) {
                            toast.error("Verification Error.");
                            navigate('/customer/bookings');
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            toast.info("Payment Cancelled. You can pay later from My Bookings.");
                            navigate('/customer/bookings');
                        }
                    },
                    prefill: {
                        name: user?.name,
                        email: user?.email,
                        // contact: "9999999999" // Removed hardcoded contact
                    },
                    theme: { color: "#3399cc" }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.open();

            } else {
                toast.error(response.message || 'Booking failed');
                setLoading(false);
            }
        } catch (err) {
            console.error("Booking Error:", err);
            toast.error(err.response?.data?.message || 'Error creating booking.');
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <h2 className="text-white mb-4">Checkout & Payment</h2>

            <Row>
                <Col md={8}>
                    <div className="glass-card mb-4 animate-fade-in">
                        <h4 className="text-light border-bottom pb-2 mb-3">Order Summary</h4>

                        <div className="d-flex justify-content-between text-white mb-3 fs-5">
                            <strong>{selectedBike.name}</strong>
                        </div>

                        <div className="d-flex justify-content-between text-muted mb-2">
                            <span>Dealer Price ({selectedDealer.showroomName})</span>
                            <span>₹ {basePrice.toLocaleString()}</span>
                        </div>

                        <hr className="bg-light" />

                        <div className="d-flex justify-content-between text-white fs-5 fw-bold mb-2">
                            <span>Total Price</span>
                            <span>₹ {totalAmount.toLocaleString()}</span>
                        </div>

                        <div className="p-3 rounded bg-dark bg-opacity-50 border border-secondary">
                            <div className="d-flex justify-content-between text-info mb-1">
                                <span>Advance Payable (20%)</span>
                                <span>₹ {(totalAmount * 0.20).toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between text-warning">
                                <span>Remaining Amount</span>
                                <span>₹ {(totalAmount - (totalAmount * 0.20)).toLocaleString()}</span>
                            </div>
                            <small className="text-muted d-block mt-2">* Remaining amount to be paid at the dealership upon delivery.</small>
                        </div>
                    </div>

                    <div className="glass-card animate-fade-in">
                        <h4 className="text-light border-bottom pb-2 mb-3">Payment Method</h4>
                        <Form>
                            <div className="mb-3">
                                <Form.Check
                                    type="radio"
                                    id="pay-full"
                                    name="payment"
                                    label={`Pay Full Amount (₹ ${totalAmount.toLocaleString()})`}
                                    checked={paymentOption === 'FULL'}
                                    onChange={() => setPaymentOptionState('FULL')}
                                    className="text-white custom-radio"
                                />
                            </div>
                            <div className="mb-3">
                                <Form.Check
                                    type="radio"
                                    id="pay-advance"
                                    name="payment"
                                    label={`Pay Advance (20%) (₹ {(totalAmount * 0.20).toLocaleString()})`}
                                    checked={paymentOption === 'ADVANCE'}
                                    onChange={() => setPaymentOptionState('ADVANCE')}
                                    className="text-white custom-radio"
                                />
                            </div>
                        </Form>

                        <Alert variant="info" className="mt-3 bg-opacity-25 bg-info border-0 text-white">
                            You are paying: <strong>₹ {payableAmount.toLocaleString()}</strong> now.
                            {paymentOption === 'ADVANCE' && ` Remaining ₹ ${(totalAmount - payableAmount).toLocaleString()} to be paid upon delivery.`}
                        </Alert>
                    </div>
                </Col>

                <Col md={4}>
                    <div className="glass-card h-100 d-flex flex-column justify-content-center">
                        <h4 className="text-center text-white mb-4">Confirm Order</h4>
                        <div className="text-center mb-4">
                            <span className="text-muted">Dealer:</span>
                            <h5 className="text-white">{selectedDealer.showroomName}</h5>
                            <small className="text-muted">{selectedDealer.city}</small>
                        </div>

                        {error && <Alert variant="danger">{error}</Alert>}

                        <Button
                            size="lg"
                            className="w-100 btn-primary-custom py-3"
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Confirm Booking'}
                        </Button>

                        {/* DEBUG DATA - REMOVE IN PRODUCTION */}
                        <div className="mt-4 p-3 bg-dark border border-danger text-danger small font-monospace">
                            <strong>🕵️ DEBUG INFO:</strong><br />
                            Bike (Admin) Price: {selectedBike?.price}<br />
                            Dealer ID: {selectedDealer?.dealerId}<br />
                            Dealer Price: {selectedDealer?.price}<br />
                            Total Amount (Used): {totalAmount}<br />
                            Payable Now: {payableAmount}
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default CheckoutPage;
