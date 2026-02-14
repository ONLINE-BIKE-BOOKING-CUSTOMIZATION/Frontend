import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { getPendingDealers, verifyDealer, rejectDealer } from '../../api/adminApi';

const AdminDealers = () => {
    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDealers = async () => {
        try {
            const response = await getPendingDealers();
            if (response.success) {
                setDealers(response.data);
            }
        } catch (err) {
            setError("Failed to load dealers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDealers();
    }, []);

    const handleVerify = async (id) => {
        if (!window.confirm("Approve this dealer?")) return;
        try {
            await verifyDealer(id);
            setDealers(dealers.filter(d => d.dealerId !== id)); // Remove from list
            alert("Dealer verified!");
        } catch (err) {
            alert("Failed to verify dealer");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reject and remove this dealer application?")) return;
        try {
            await rejectDealer(id);
            setDealers(dealers.filter(d => d.dealerId !== id));
            alert("Dealer rejected!");
        } catch (err) {
            alert("Failed to reject dealer");
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="light" /></div>;

    return (
        <div className="animate-fade-in">
            <h2 className="text-white mb-4">Dealer Verification</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="glass-card p-4">
                {dealers.length === 0 ? (
                    <div className="text-center text-muted">No pending dealer applications.</div>
                ) : (
                    <Table hover variant="dark" responsive className="mb-0 bg-transparent">
                        <thead>
                            <tr>
                                <th>Showroom Name</th>
                                <th>Owner Name</th>
                                <th>City</th>
                                <th>Contact</th>
                                <th>GST No.</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dealers.map((dealer) => (
                                <tr key={dealer.dealerId}>
                                    <td>{dealer.showroomName}</td>
                                    <td>{dealer.user?.name || "Unknown"}</td>
                                    <td>{dealer.address?.city || "Unknown"}</td>
                                    <td>{dealer.contactNumber}</td>
                                    <td>{dealer.gstNumber}</td>
                                    <td className="text-end">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleVerify(dealer.dealerId)}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleReject(dealer.dealerId)}
                                        >
                                            Reject
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </div>
    );
};

export default AdminDealers;
