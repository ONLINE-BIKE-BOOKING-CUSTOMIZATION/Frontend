import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDealerStats } from '../../api/dealerApi';
import { toast } from 'react-toastify';
import '../../App.css';

const DealerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = React.useState(null);

    React.useEffect(() => {
        if (user) loadStats();
    }, [user]);

    const loadStats = async () => {
        try {
            const res = await getDealerStats(user.userId);
            if (res.success) setStats(res.data);
        } catch (err) {
            console.error("Failed to load stats");
            toast.error("Could not load dashboard stats");
        }
    }

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="mb-1 text-secondary">Dealer Dashboard</h2>
                    <p className="text-secondary-light mb-0">Welcome back, <span className="fw-bold text-primary-custom">{user?.name}</span></p>
                </div>
            </div>

            {/* ANALYTICS SECTION */}
            {stats && (
                <Row className="mb-5 animate-fade-in">
                    <Col md={4} className="mb-3">
                        <div className="glass-card text-center p-4 border-bottom border-success border-4 h-100">
                            <h5 className="text-muted text-uppercase small ls-1">Total Revenue</h5>
                            <h2 className="text-success fw-bold display-6 mt-2">₹ {stats.totalRevenue.toLocaleString()}</h2>
                        </div>
                    </Col>
                    <Col md={4} className="mb-3">
                        <div className="glass-card text-center p-4 border-bottom border-primary border-4 h-100">
                            <h5 className="text-muted text-uppercase small ls-1">Bikes Sold</h5>
                            <h2 className="text-primary fw-bold display-6 mt-2">{stats.totalBikesSold}</h2>
                        </div>
                    </Col>
                    <Col md={4} className="mb-3">
                        <div className="glass-card text-center p-4 border-bottom border-warning border-4 h-100">
                            <h5 className="text-muted text-uppercase small ls-1">Pending Orders</h5>
                            <h2 className="text-warning fw-bold display-6 mt-2">{stats.pendingBookings}</h2>
                        </div>
                    </Col>
                </Row>
            )}

            <h4 className="mb-4 text-muted fw-bold text-uppercase small ls-1">Quick Actions</h4>
            <Row>
                <Col md={6} className="mb-4">
                    <div className="glass-card h-100 text-center animate-fade-in p-5">
                        <h3 className="mb-3">Pending Bookings</h3>
                        <p className="text-muted mb-4">View and manage new booking requests from customers.</p>
                        <button
                            className="btn-primary-custom px-5"
                            onClick={() => navigate('/dealer/bookings')}
                        >
                            Manage Bookings
                        </button>
                    </div>
                </Col>
                <Col md={6} className="mb-4">
                    <div className="glass-card h-100 text-center animate-fade-in p-5">
                        <h3 className="mb-3">Inventory Management</h3>
                        <p className="text-muted mb-4">Update your bike stock, prices, and offers.</p>
                        <button
                            className="btn-primary-custom px-5"
                            onClick={() => navigate('/dealer/grid')}
                        >
                            Manage Inventory
                        </button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default DealerDashboard;
