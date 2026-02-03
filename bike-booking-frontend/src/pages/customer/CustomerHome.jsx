import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAllBikes } from '../../api/bikeApi';
import { FaSearch, FaBolt, FaGasPump, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../../App.css';

const CustomerHome = () => {
    const [allBikes, setAllBikes] = useState([]);
    const [displayBikes, setDisplayBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchBikes = async () => {
            try {
                const response = await getAllBikes();
                if (response.success) {
                    setAllBikes(response.data);
                    setDisplayBikes(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch bikes");
                toast.error("Could not load bikes from server");
            } finally {
                setLoading(false);
            }
        };
        fetchBikes();
    }, []);

    // Deduplicate and Filter Logic
    useEffect(() => {
        // 1. Group by NAME to hide messy duplicate data
        const uniqueMap = new Map();

        allBikes.forEach(bike => {
            if (!bike.name) return;
            const key = bike.name.toLowerCase().trim(); // Organize by name

            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, {
                    ...bike,
                    minPrice: bike.price || 0, // Fallback -> no more crash
                    variantCount: 1
                });
            } else {
                const existing = uniqueMap.get(key);
                // Keep lowest price found in catalog
                if ((bike.price || 0) < existing.minPrice) {
                    existing.minPrice = bike.price || 0;
                    existing.bikeId = bike.bikeId; // Point to the cheaper variant
                }
                existing.variantCount += 1;
            }
        });

        let filtered = Array.from(uniqueMap.values());

        if (searchTerm) {
            filtered = filtered.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedBrand) {
            filtered = filtered.filter(b => b.brand === selectedBrand);
        }
        setDisplayBikes(filtered);
    }, [searchTerm, selectedBrand, allBikes]);

    const brands = ["Yamaha", "Royal Enfield", "Honda", "KTM", "Suzuki", "Hero"];

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '5rem' }}>

            {/* 🌟 CINEMATIC HERO */}
            <div className="hero-wrapper">
                <div className="hero-bg"></div>
                <div className="hero-content">
                    <h1 className="hero-title animate-fade-in">Unleash Your <span className="text-primary-custom">Ride</span></h1>
                    <p className="hero-subtitle animate-fade-in">Discover the perfect machine for your journey.</p>

                    {/* Floating Search */}
                    <div className="search-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search for bikes (e.g. R15, Duke)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-btn">
                            <FaSearch className="me-2" /> Find
                        </button>
                    </div>

                    <div className="mt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <span className="text-white-50 me-2">Trending:</span>
                        {['Royal Enfield', 'KTM', 'Sports'].map(tag => (
                            <Badge
                                key={tag}
                                bg="white" text="dark"
                                className="me-2 rounded-pill px-3 py-2"
                                style={{ cursor: 'pointer', opacity: 0.9 }}
                                onClick={() => setSearchTerm(tag === 'Sports' ? '' : tag)}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <Container className="py-5" style={{ marginTop: '-80px', position: 'relative', zIndex: 20 }}>

                {/* 🌟 BRAND GRID */}
                <div className="glass-card mb-5 animate-fade-in">
                    <h5 className="text-muted text-uppercase fw-bold ls-1 mb-4 text-center">Top Manufacturers</h5>
                    <div className="brand-grid">
                        {brands.map((brand) => (
                            <div
                                key={brand}
                                className={`brand-item ${selectedBrand === brand ? 'border-primary' : ''}`}
                                onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                                style={{ borderColor: selectedBrand === brand ? 'var(--primary)' : 'transparent' }}
                            >
                                <span className={selectedBrand === brand ? 'text-primary-custom' : ''}>{brand}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🌟 FEATURED SECTION */}
                <div className="section-header">
                    <h2>Available Models</h2>
                    <p>Explore the flagship collection.</p>
                </div>

                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
                ) : allBikes.length === 0 ? (
                    <Container className="text-center py-5">
                        <div className="p-5 glass-card">
                            <h2 className="text-primary-custom mb-3">No bikes found 🏍️</h2>
                            <p className="lead text-muted mb-4">The database is currently empty.</p>
                        </div>
                    </Container>
                ) : (
                    <Row className="g-4">
                        {displayBikes.length > 0 ? displayBikes.map((bike, index) => (
                            <Col key={`${bike.bikeId}-${index}`} md={6} lg={4}>
                                <div className="premium-card">
                                    <div className="card-img-wrapper">
                                        <img
                                            src={bike.imageUrl || 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                                            alt={bike.name}
                                        />
                                        <div className="card-badges">
                                            {bike.stock < 5 && <div className="badge-custom text-danger">Low Stock</div>}
                                            <div className="badge-custom">2024 Model</div>
                                        </div>
                                    </div>

                                    <div className="card-content">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>{bike.brand}</small>
                                                <h3 className="card-title fw-bold mt-1">{bike.name}</h3>
                                            </div>
                                            <span className="card-price">₹ {(bike.minPrice || 0).toLocaleString()}</span>
                                        </div>

                                        <div className="spec-grid my-3">
                                            <div className="spec-item"><FaBolt className="text-warning" /> {bike.cc} cc</div>
                                            <div className="spec-item"><FaGasPump className="text-success" /> {bike.mileage} km/l</div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-4">
                                            {bike.dealerCount > 0 && (
                                                <Badge bg="light" text="dark" className="border rounded-pill">
                                                    {bike.dealerCount} Dealers
                                                </Badge>
                                            )}
                                        </div>

                                        <button
                                            className="btn-primary-custom w-100 mt-3"
                                            onClick={() => navigate(`/customer/bike/${bike.bikeId}`)}
                                        >
                                            View Details <FaArrowRight className="ms-2" />
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        )) : (
                            <Col className="text-center py-5">
                                <h3>No matching bikes.</h3>
                                <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedBrand(null); }}>Clear Filters</Button>
                            </Col>
                        )}
                    </Row>
                )}
            </Container>

            {/* 🌟 FOOTER PROMO */}
            <div className="footer-modern bg-secondary text-white text-center">
                <Container>
                    <h2 className="mb-3 text-white">Ready to Ride?</h2>
                    <p className="text-white-50 mb-4">Book your test ride today at the nearest dealer.</p>
                </Container>
            </div>
        </div>
    );
};

export default CustomerHome;
