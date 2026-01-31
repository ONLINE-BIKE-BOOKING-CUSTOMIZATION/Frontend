import React, { useEffect, useState } from 'react';
import { Container, Button, Badge, Spinner, Modal, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getPendingBookings, acceptBooking, rejectBooking } from '../../api/dealerApi';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';

const PendingBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await getPendingBookings(user.userId);
            if (response.success) {
                setBookings(response.data);
            } else {
                setError('Failed to load bookings');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchBookings();
    }, [user]);



    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [deliveryDate, setDeliveryDate] = useState('');

    const handleAction = async (id, action) => {
        if (action === 'ACCEPT') {
            setSelectedBookingId(id);
            setShowModal(true);
            return;
        }

        // REJECT LOGIC
        if (!window.confirm("Are you sure you want to reject this booking?")) return;

        try {
            const response = await rejectBooking(id);
            if (response.success) {
                toast.success(`Booking REJECTED successfully!`);
                fetchBookings();
            } else {
                toast.error(response.message || 'Action failed');
            }
        } catch (err) {
            toast.error('Error processing request');
        }
    };

    const confirmAccept = async () => {
        if (!selectedBookingId || !deliveryDate) return;

        try {
            const response = await acceptBooking(selectedBookingId, deliveryDate);
            if (response.success) {
                toast.success("Booking Accepted & Inventory Updated!");
                setShowModal(false);
                setDeliveryDate('');
                fetchBookings();
            } else {
                toast.error(response.message || "Failed to accept booking");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error connecting to server");
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="light" /></div>;

    return (
        <Container className="py-5">
            <h2 className="text-white mb-4">Pending Bookings</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            {bookings.length === 0 ? (
                <div className="text-white">No pending bookings.</div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {bookings.map(b => (
                        <div key={b.bookingId} className="glass-card d-flex flex-column flex-md-row justify-content-between align-items-center">
                            <div className="text-white mb-3 mb-md-0">
                                <h5>Booking #{b.bookingId}</h5>
                                <p className="mb-1"><strong>Bike:</strong> {b.bikeName}</p>
                                <p className="mb-1"><strong>Customer:</strong> {b.customerName}</p>



                                <Badge bg="warning" text="dark" className="mt-2">{b.status}</Badge>

                                <div className="mt-2 text-white-50 small">
                                    <div>Total: <span className="text-white fw-bold">₹ {b.totalAmount.toLocaleString()}</span></div>
                                    <div>Paid: <span className="text-success">₹ {b.paidAmount.toLocaleString()}</span></div>
                                    <div>Balance: <span className="text-danger fw-bold">₹ {b.remainingAmount.toLocaleString()}</span></div>
                                </div>


                            </div>
                            <div className="d-flex gap-2">
                                <Button variant="success" onClick={() => handleAction(b.bookingId, 'ACCEPT')}>Accept</Button>
                                <Button variant="danger" onClick={() => handleAction(b.bookingId, 'REJECT')}>Reject</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* DATE SELECTION MODAL */}
            <Modal show={showModal} onHide={() => { setShowModal(false); setSelectedBookingId(null); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Set Delivery Date</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Select Expected Delivery Date</Form.Label>
                        <Form.Control
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={confirmAccept} disabled={!deliveryDate}>
                        Confirm Acceptance
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default PendingBookings;
