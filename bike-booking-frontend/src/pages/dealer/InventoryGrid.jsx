import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Badge, Spinner, Col, Row } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getDealerInventory, updateInventory, addBikeToInventory } from '../../api/dealerApi';
import { getAllBikes, getMasterBikes } from '../../api/bikeApi';
import { toast } from 'react-toastify';
import '../../App.css';

const InventoryGrid = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [masterBikes, setMasterBikes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showEdit, setShowEdit] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ price: 0, stock: 0, offer: '' });
    const [selectedMasterBike, setSelectedMasterBike] = useState(null);

    useEffect(() => {
        fetchInventory();
        fetchMasterList();
    }, [user]);

    const fetchInventory = async () => {
        try {
            const res = await getDealerInventory(user.userId);
            if (res.success) setInventory(res.data);
        } catch (err) {
            console.error("Failed to load inventory");
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterList = async () => {
        try {
            console.log("Fetching Master Bikes...");
            const res = await getMasterBikes();
            console.log("Master Bikes Response:", res);
            if (res.success) {
                console.log("Setting Master Bikes:", res.data);
                setMasterBikes(res.data);
            }
        } catch (err) {
            console.error("Failed to load master list", err);
        }
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setFormData({ price: item.price, stock: item.stock, offer: item.offer || '' });
        setShowEdit(true);
    };

    const handleUpdateSubmit = async () => {
        try {
            const res = await updateInventory(currentItem.dealerBikeId, formData);
            if (res.success) {
                toast.success("Inventory updated successfully!");
                setShowEdit(false);
                fetchInventory();
            }
        } catch (err) {
            toast.error("Failed to update inventory.");
        }
    };

    const handleAddSubmit = async () => {
        if (!selectedMasterBike) return toast.warning("Please select a bike to add.");
        try {
            const payload = {
                dealerId: 0,
                bikeId: parseInt(selectedMasterBike),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                offer: formData.offer
            };
            const res = await addBikeToInventory(user.userId, payload);
            if (res.success) {
                toast.success("Bike added to showroom!");
                setShowAdd(false);
                fetchInventory();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add bike. It might already exist.");
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-secondary mb-1">Inventory Management</h2>
                    <p className="text-muted">Manage your showroom stock and prices.</p>
                </div>
                <button className="btn-primary-custom" onClick={() => setShowAdd(true)}>+ Add New Bike</button>
            </div>

            <div className="glass-card p-0 overflow-hidden">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light text-secondary">
                        <tr>
                            <th className="p-3">Bike Name</th>
                            <th className="p-3">Brand</th>
                            <th className="p-3">My Price</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Active Offer</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.length > 0 ? inventory.map(item => (
                            <tr key={item.dealerBikeId}>
                                <td className="p-3 fw-bold">{item.bikeName}</td>
                                <td className="p-3 text-muted small text-uppercase fw-bold">{item.brand}</td>
                                <td className="p-3 text-primary fw-bold">₹ {item.price.toLocaleString()}</td>
                                <td className="p-3">
                                    <Badge bg={item.stock < 3 ? 'danger' : 'success'} className="px-3 py-2 rounded-pill">
                                        {item.stock} Units
                                    </Badge>
                                </td>
                                <td className="p-3">{item.offer ? <span className="text-success fw-bold">{item.offer}</span> : <span className="text-muted">-</span>}</td>
                                <td className="p-3">
                                    <Button size="sm" variant="outline-primary" className="rounded-pill px-3" onClick={() => handleEdit(item)}>Edit</Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-muted">No bikes in inventory. Add one to start selling!</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* EDIT MODAL */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold text-secondary">Update: {currentItem?.bikeName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Selling Price (₹)</Form.Label>
                            <Form.Control
                                type="number"
                                className="border-0 bg-light p-3"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Stock Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                className="border-0 bg-light p-3"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Offer Text</Form.Label>
                            <Form.Control
                                type="text"
                                className="border-0 bg-light p-3"
                                placeholder="e.g. Free Helmet"
                                value={formData.offer}
                                onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowEdit(false)}>Cancel</Button>
                    <Button className="btn-primary-custom" onClick={handleUpdateSubmit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>

            {/* ADD BIKE MODAL */}
            <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold text-secondary">Add to Showroom</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Select Model</Form.Label>
                            <Form.Select className="border-0 bg-light p-3" onChange={(e) => setSelectedMasterBike(e.target.value)}>
                                <option value="">-- Choose Bike --</option>
                                {Array.from(new Set(masterBikes.map(b => b.name))).map(name => {
                                    const bike = masterBikes.find(b => b.name === name);
                                    return <option key={bike.bikeId} value={bike.bikeId}>{bike.name} ({bike.brand})</option>
                                })}
                            </Form.Select>
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Price (₹)</Form.Label>
                                    <Form.Control type="number" className="border-0 bg-light p-3" onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Stock</Form.Label>
                                    <Form.Control type="number" className="border-0 bg-light p-3" onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Offer</Form.Label>
                            <Form.Control type="text" className="border-0 bg-light p-3" placeholder="Optional" onChange={(e) => setFormData({ ...formData, offer: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowAdd(false)}>Cancel</Button>
                    <Button className="btn-primary-custom" onClick={handleAddSubmit}>Add Bike</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default InventoryGrid;
