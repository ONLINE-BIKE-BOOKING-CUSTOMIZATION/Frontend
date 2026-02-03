import React, { useEffect, useState } from 'react';
import { Container, Badge, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { getMyBookings, cancelBooking } from '../../api/bookingApi';
import PaymentModal from '../../components/common/PaymentModal';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);

    // Payment Modal State
    const [showPayment, setShowPayment] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await getMyBookings(user.userId);
            if (response.success) {
                setBookings(response.data);
                setError(null);
            } else {
                setError('Failed to fetch bookings');
            }
        } catch (err) {
            setError('Error loading bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user, refresh]);

    const handlePayRemaining = (booking) => {
        setSelectedBooking(booking);
        setShowPayment(true);
    };

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        setRefresh(prev => !prev);
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            const response = await cancelBooking(bookingId);
            if (response.success) {
                alert("Booking cancelled successfully.");
                setRefresh(prev => !prev);
            } else {
                alert("Failed to cancel: " + response.message);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error cancelling booking");
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="light" /></div>;

    return (
        <Container className="py-5">
            <h2 className="text-white mb-4">My Bookings</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            {bookings.length === 0 ? (
                <div className="text-white text-center">No bookings found.</div>
            ) : (
                <Row>
                    {bookings.map((booking) => {
                        // Check logic for Cancel availability
                        let canCancel = false;
                        if (booking.status === 'PENDING') canCancel = true;
                        if ((booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED') && booking.deliveryDate) {
                            const delivery = new Date(booking.deliveryDate);
                            const now = new Date();
                            const diffTime = delivery - now;
                            const diffDays = diffTime / (1000 * 60 * 60 * 24);
                            if (diffDays > 1) canCancel = true;
                        }

                        // Check logic for Payment availability
                        const canPay = booking.status === 'ACCEPTED' && booking.remainingAmount > 0;

                        return (
                            <Col md={6} lg={4} key={booking.bookingId} className="mb-4">
                                <Card className="glass-card h-100 border-0">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <Badge bg={
                                                booking.status === 'CONFIRMED' || booking.status === 'DELIVERED' ? 'success' :
                                                    booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? 'danger' : 'warning'
                                            }>
                                                {booking.status}
                                            </Badge>
                                            <small className="text-muted">#{booking.bookingId}</small>
                                        </div>

                                        <Card.Title className="text-white mb-1">{booking.bikeName}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-primary">{booking.showroomName}</Card.Subtitle>

                                        {booking.deliveryDate && (
                                            <div className="text-info small mb-3 fw-bold">
                                                Expected Delivery: {booking.deliveryDate}
                                            </div>
                                        )}



                                        <div className="mt-3 pt-3 border-top border-secondary">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="text-muted">Total</span>
                                                <span className="text-white fw-bold">₹ {booking.totalAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="text-muted">Paid</span>
                                                <span className="text-success fw-bold">₹ {booking.paidAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Balance</span>
                                                <span className={booking.remainingAmount > 0 ? "text-danger fw-bold" : "text-muted"}>
                                                    ₹ {booking.remainingAmount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>



                                        <div className="mt-4 d-grid gap-2">
                                            {canPay && (
                                                <Button
                                                    variant="warning"
                                                    className="fw-bold"
                                                    onClick={() => handlePayRemaining(booking)}
                                                >
                                                    Pay Balance (₹ {booking.remainingAmount})
                                                </Button>
                                            )}

                                            {canCancel && booking.status !== 'CANCELLED' && booking.status !== 'DELIVERED' && booking.status !== 'REJECTED' && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleCancel(booking.bookingId)}
                                                >
                                                    Cancel Booking
                                                </Button>
                                            )}

                                            {booking.status === 'PENDING' && (
                                                <div className="text-center text-muted small fst-italic">Waiting for Dealer Approval</div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            <PaymentModal
                show={showPayment}
                onHide={() => setShowPayment(false)}
                booking={selectedBooking}
                onSuccess={handlePaymentSuccess}
            />
        </Container>
    );
};

export default MyBookings;
