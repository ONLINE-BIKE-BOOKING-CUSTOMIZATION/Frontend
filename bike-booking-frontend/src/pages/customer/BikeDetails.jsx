import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getBikeById } from '../../api/bikeApi';
import { selectBike } from '../../context/bookingSlice';
import '../../App.css';
import { FaCheck, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BikeDetails = () => {
    const { bikeId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bikeData = await getBikeById(bikeId);

                if (bikeData.success) {
                    setBike(bikeData.data);
                }

            } catch (err) {
                console.error("Error fetching bike details:", err);
                toast.error("Failed to load bike configuration");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [bikeId]);

    const handleProceed = () => {
        dispatch(selectBike(bike));
        navigate('/customer/select-dealer');
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="danger" /></div>;
    if (!bike) return <div className="text-center mt-5 text-danger">Bike not found</div>;

    const totalPrice = bike.price;

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            <Container className="pt-5">
                <Row className="g-5">
                    {/* LEFT: VISUALS */}
                    <Col lg={7}>
                        <div className="glass-card mb-4 animate-fade-in p-0 overflow-hidden">
                            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                                <img
                                    src={bike.imageUrl || 'https://via.placeholder.com/800x600?text=Bike+View'}
                                    alt={bike.name}
                                    className="img-fluid"
                                    style={{ maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                                />
                            </div>
                        </div>

                        <div className="glass-card animate-fade-in">
                            <h4 className="fw-bold mb-3 text-secondary">Specifications</h4>
                            <Row>
                                <Col xs={6} md={3} className="text-center p-3 border-end">
                                    <div className="text-muted small text-uppercase fw-bold">Engine</div>
                                    <div className="fw-bold fs-5 text-secondary">{bike.cc} cc</div>
                                </Col>
                                <Col xs={6} md={3} className="text-center p-3 border-end">
                                    <div className="text-muted small text-uppercase fw-bold">Mileage</div>
                                    <div className="fw-bold fs-5 text-secondary">{bike.mileage}</div>
                                </Col>
                                <Col xs={6} md={3} className="text-center p-3 border-end">
                                    <div className="text-muted small text-uppercase fw-bold">Type</div>
                                    <div className="fw-bold fs-5 text-secondary">{bike.type}</div>
                                </Col>
                                <Col xs={6} md={3} className="text-center p-3">
                                    <div className="text-muted small text-uppercase fw-bold">Brand</div>
                                    <div className="fw-bold fs-5 text-primary-custom">{bike.brand}</div>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    {/* RIGHT: CONFIGURATOR */}
                    <Col lg={5}>
                        <div className="glass-card animate-fade-in h-100 position-relative d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <h2 className="fw-bold mb-1 text-secondary">{bike.name}</h2>
                                <Badge bg="danger" className="rounded-pill px-3">Bestseller</Badge>
                            </div>
                            <div className="text-muted mb-4">{bike.description}</div>



                            <div className="mt-auto border-top pt-4">
                                <div className="d-flex justify-content-between align-items-end mb-3">
                                    <div className="text-muted small text-uppercase fw-bold">Base Price (Ex-Showroom)</div>
                                    <div className="text-primary-custom fw-bolder fs-1">₹ {totalPrice.toLocaleString()}</div>
                                    <small className="text-muted d-block">* Final price depends on dealer selection</small>
                                </div>
                                <button
                                    className="btn-primary-custom w-100 py-3 fw-bold fs-5 shadow-lg"
                                    onClick={handleProceed}
                                >
                                    Proceed to Dealer Selection
                                </button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BikeDetails;
