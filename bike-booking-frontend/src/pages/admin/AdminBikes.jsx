import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Table, Modal, Badge } from 'react-bootstrap';
import { getMasterBikes } from '../../api/bikeApi';
import { addMasterBike } from '../../api/adminApi'; // Check this too
// We import getAllBikes from bikeApi because it's public/common

const AdminBikes = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
    const [bikes, setBikes] = useState([]);

    // Add Bike Form State
    const [formData, setFormData] = useState({
        name: '', brand: '', type: 'Sports', price: '', cc: '', mileage: '', description: '', imageUrl: ''
    });

    useEffect(() => {
        if (activeTab === 'list') fetchBikes();
    }, [activeTab]);

    const fetchBikes = async () => {
        const res = await getMasterBikes();
        if (res.success) setBikes(res.data);
    };

    const handleAddBike = async (e) => {
        e.preventDefault();

        // Validation
        const priceVal = parseFloat(formData.price);
        const ccVal = parseInt(formData.cc);

        if (isNaN(priceVal) || isNaN(ccVal)) {
            alert("Please enter valid numbers for Price and CC");
            return;
        }

        try {
            await addMasterBike({ ...formData, price: priceVal, cc: ccVal, stock: 0 });
            alert("Bike Added!");
            setFormData({ name: '', brand: '', type: 'Sports', price: '', cc: '', mileage: '', description: '', imageUrl: '' });
            setActiveTab('list');
        } catch (err) {
            alert("Error adding bike");
        }
    };



    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-white">Manage Master Bike Data</h2>
                <div>
                    <Button variant={activeTab === 'list' ? 'light' : 'outline-light'} onClick={() => setActiveTab('list')} className="me-2">View All Bikes</Button>
                    <Button variant={activeTab === 'add' ? 'light' : 'outline-light'} onClick={() => setActiveTab('add')}>Add New Bike</Button>
                </div>
            </div>

            {activeTab === 'add' ? (
                // ... Existing Add Form Code ...
                <div className="glass-card p-4">
                    <h4 className="text-white mb-3">Add New Bike Model</h4>
                    <Form onSubmit={handleAddBike}>
                        {/* Fields same as before, simplified for brevity in this plan */}
                        <Row>
                            <Col md={6}><Form.Control placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="mb-2" /></Col>
                            <Col md={6}><Form.Control placeholder="Brand" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required className="mb-2" /></Col>
                            <Col md={6}><Form.Control placeholder="Price" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required className="mb-2" /></Col>
                            <Col md={6}><Form.Control placeholder="CC" type="number" value={formData.cc} onChange={e => setFormData({ ...formData, cc: e.target.value })} required className="mb-2" /></Col>
                            <Col md={6}><Form.Control placeholder="Image URL" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="mb-2" /></Col>
                            <Col md={6}>
                                <Form.Select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="mb-2">
                                    <option>Sports</option><option>Cruiser</option><option>Electric</option>
                                </Form.Select>
                            </Col>
                        </Row>
                        <Button type="submit" variant="primary">Save Bike</Button>
                    </Form>
                </div>
            ) : (
                <div className="glass-card p-4">
                    <Table bordered hover variant="dark" responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Brand</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bikes.map(b => (
                                <tr key={b.bikeId}>
                                    <td>{b.bikeId}</td>
                                    <td>{b.name}</td>
                                    <td>{b.brand}</td>
                                    <td>₹ {b.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

        </div>
    );
};

export default AdminBikes;
