import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { getAdminStats } from '../../api/adminApi';
import { FaUsers, FaStore, FaFileInvoiceDollar, FaMotorcycle } from 'react-icons/fa';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getAdminStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (err) {
                console.error("Failed to load stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="light" /></div>;

    // Helper for cards
    const StatCard = ({ title, value, icon, color }) => (
        <Col md={3} className="mb-4">
            <div className={`glass-card p-4 h-100 border-${color} border-bottom border-4`}>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <small className="text-muted text-uppercase fw-bold">{title}</small>
                        <h2 className="text-white mt-2 mb-0">{value}</h2>
                    </div>
                    <div className={`text-${color} fs-1 opacity-50`}>
                        {icon}
                    </div>
                </div>
            </div>
        </Col>
    );

    return (
        <div className="animate-fade-in">
            <h2 className="text-white mb-4">Admin Dashboard</h2>

            <Row>
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={<FaUsers />}
                    color="info"
                />
                <StatCard
                    title="Total Dealers"
                    value={stats?.totalDealers || 0}
                    icon={<FaStore />}
                    color="warning"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats?.totalBookings || 0}
                    icon={<FaFileInvoiceDollar />}
                    color="success"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹ ${(stats?.totalRevenue || 0).toLocaleString()}`}
                    icon={<FaFileInvoiceDollar />}
                    color="primary"
                />
            </Row>

            <Row className="mt-4">
                <Col md={6}>
                    <div className="glass-card p-4 h-100">
                        <h5 className="text-white mb-3">Recent Activity</h5>
                        <p className="text-muted">Coming soon...</p>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="glass-card p-4 h-100">
                        <h5 className="text-white mb-3">System Health</h5>
                        <div className="d-flex align-items-center text-success">
                            <div className="bg-success rounded-circle me-2" style={{ width: 10, height: 10 }}></div>
                            Backend Active
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
