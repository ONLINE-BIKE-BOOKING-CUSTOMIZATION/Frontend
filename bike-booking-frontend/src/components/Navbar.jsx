import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMotorcycle, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import '../App.css';

const Navigation = () => {
    const { user, logout, role } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar expand="lg" variant="light" className="navbar-custom sticky-top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
                    <FaMotorcycle className="text-primary" size={28} />
                    <span>BikeWorld</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        {!user ? (
                            <>
                                <Nav.Link as={Link} to="/login" className="text-light fw-semibold">Login</Nav.Link>
                                <Button as={Link} to="/register" variant="primary" className="btn-primary-custom ms-2">
                                    Get Started
                                </Button>
                            </>
                        ) : (
                            <>
                                {role === 'CUSTOMER' && (
                                    <>
                                        <Nav.Link as={Link} to="/customer/home" className="text-light">Browse Bikes</Nav.Link>
                                        <Nav.Link as={Link} to="/customer/bookings" className="text-light">My Bookings</Nav.Link>
                                        <Nav.Link as={Link} to="/customer/profile" className="text-light">Profile</Nav.Link>
                                    </>
                                )}
                                {role === 'DEALER' && (
                                    <>
                                        <Nav.Link as={Link} to="/dealer/dashboard" className="text-light">Dashboard</Nav.Link>
                                        <Nav.Link as={Link} to="/dealer/grid" className="text-light">Inventory</Nav.Link>
                                        <Nav.Link as={Link} to="/dealer/profile" className="text-light">Profile</Nav.Link>
                                    </>
                                )}
                                {role === 'ADMIN' && (
                                    <>
                                        <Nav.Link as={Link} to="/admin/dashboard" className="text-light">Admin Panel</Nav.Link>
                                        <Nav.Link as={Link} to="/admin/profile" className="text-light">Profile</Nav.Link>
                                    </>
                                )}

                                <div className="d-flex align-items-center ms-lg-4 mt-2 mt-lg-0">
                                    <span className="text-white-50 me-3 d-none d-lg-block">Hello, {user.name || 'User'}</span>
                                    <Button variant="outline-danger" size="sm" onClick={handleLogout} className="d-flex align-items-center gap-2">
                                        <FaSignOutAlt /> Logout
                                    </Button>
                                </div>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
