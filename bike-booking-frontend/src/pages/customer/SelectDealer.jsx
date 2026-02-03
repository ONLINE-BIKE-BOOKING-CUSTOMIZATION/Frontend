import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getDealersForBike } from '../../api/dealerApi';
import { selectDealer } from '../../context/bookingSlice';
import '../../App.css';

const SelectDealer = () => {
    const { selectedBike } = useSelector((state) => state.booking);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!selectedBike) {
            navigate('/customer/home');
            return;
        }

        const fetchDealers = async () => {
            try {
                // Should return list of dealers with Price and Stock
                const response = await getDealersForBike(selectedBike.bikeId);
                if (response.success) {
                    // Deduplicate dealers just in case DB has duplicates
                    const uniqueDealers = [];
                    const seen = new Set();

                    response.data.forEach(d => {
                        if (!seen.has(d.dealerId)) {
                            seen.add(d.dealerId);
                            uniqueDealers.push(d);
                        }
                    });

                    setDealers(uniqueDealers);
                } else {
                    setError('Failed to fetch dealers');
                }
            } catch (err) {
                console.error("API Error", err);
                setError('Failed to load dealers. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDealers();
    }, [selectedBike, navigate]);

    const handleSelect = (dealer) => {
        dispatch(selectDealer(dealer));
        navigate('/customer/checkout');
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="light" /></div>;

    return (
        <Container className="py-5">
            <h2 className="text-white mb-4">Select a Dealer</h2>
            <p className="text-muted mb-4">Choose a showroom to book your {selectedBike?.name}</p>

            <Row>
                {dealers.map((dealer) => (
                    <Col key={dealer.dealerId} md={6} lg={4} className="mb-4">
                        <div className="glass-card animate-fade-in">
                            <h4 className="text-white">{dealer.showroomName}</h4>
                            <p className="text-info">{dealer.city}</p>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-light">Price: <strong>₹ {dealer.price.toLocaleString()}</strong></span>
                                <Badge bg={dealer.stock > 0 ? "success" : "danger"}>
                                    {dealer.stock > 0 ? `${dealer.stock} In Stock` : 'Out of Stock'}
                                </Badge>
                            </div>

                            <Button
                                variant="primary"
                                className="w-100 btn-primary-custom"
                                disabled={dealer.stock <= 0}
                                onClick={() => handleSelect(dealer)}
                            >
                                Select This Dealer
                            </Button>
                        </div>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default SelectDealer;
