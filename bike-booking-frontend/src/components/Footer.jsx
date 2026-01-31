import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer style={{ background: 'var(--secondary)', color: 'white', paddingTop: '4rem', paddingBottom: '2rem' }}>
            <Container>
                <Row className="g-4 mb-5">
                    <Col md={4}>
                        <h4 className="fw-bold text-white mb-3">BikeWorld</h4>
                        <p className="text-white-50">
                            Your premium destination for buying the best bikes in the world.
                            Experience the thrill of the ride with our curated collection.
                        </p>
                        <div className="d-flex gap-3 mt-4">
                            <FaFacebook size={20} className="text-white-50 hover-white cursor-pointer" />
                            <FaTwitter size={20} className="text-white-50 hover-white cursor-pointer" />
                            <FaInstagram size={20} className="text-white-50 hover-white cursor-pointer" />
                            <FaLinkedin size={20} className="text-white-50 hover-white cursor-pointer" />
                        </div>
                    </Col>

                    <Col md={2}>
                        <h6 className="fw-bold text-white mb-3">Company</h6>
                        <ul className="list-unstyled text-white-50 d-flex flex-column gap-2">
                            <li>About Us</li>
                            <li>Careers</li>
                            <li>Press</li>
                            <li>Blog</li>
                        </ul>
                    </Col>

                    <Col md={2}>
                        <h6 className="fw-bold text-white mb-3">Support</h6>
                        <ul className="list-unstyled text-white-50 d-flex flex-column gap-2">
                            <li>Help Center</li>
                            <li>Terms of Service</li>
                            <li>Privacy Policy</li>
                            <li>Contact Us</li>
                        </ul>
                    </Col>

                    <Col md={4}>
                        <h6 className="fw-bold text-white mb-3">Newsletter</h6>
                        <p className="text-white-50 small">Subscribe to get the latest bike launches and offers.</p>
                        <div className="d-flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="form-control bg-transparent text-white border-secondary"
                                style={{ boxShadow: 'none' }}
                            />
                            <button className="btn btn-primary">Subscribe</button>
                        </div>
                    </Col>
                </Row>

                <div className="border-top border-secondary pt-4 text-center text-white-50 small">
                    <p className="mb-0">
                        &copy; 2026 BikeWorld Inc. All rights reserved.
                        Made with <FaHeart className="text-danger mx-1" /> for Riders.
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
