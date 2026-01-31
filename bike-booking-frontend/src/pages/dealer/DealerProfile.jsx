import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getDealerProfile, updateDealerProfile } from '../../api/dealerApi';
import { toast } from 'react-toastify';

const DealerProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (user?.userId) {
                    // Try to fetch real profile data
                    try {
                        const data = await getDealerProfile(user.userId);
                        setProfile({
                            name: data.ownerName || '',
                            email: data.ownerEmail || '',
                            phone: data.contactNumber || '',
                            address: data.address || '',
                            line2: data.line2 || '', // Assuming DTO has this or we need to add it
                            city: data.city || '',
                            state: data.state || '',
                            pincode: data.pincode || ''
                        });
                    } catch (err) {
                        // Fallback to user context data if API fetch fails (or helps with initial state)
                        console.warn("Could not fetch dealer profile:", err);
                        setProfile(prev => ({
                            ...prev,
                            name: user.name || '',
                            email: user.email || ''
                        }));
                    }
                }
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');

        try {
            await updateDealerProfile(user.userId, profile);
            toast.success('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
            toast.error('Failed to update profile.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Container className="mt-5 text-center">Loading...</Container>;

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">Dealer Profile</h4>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        disabled // Email is usually immutable or requires special process
                                    />
                                    <Form.Text className="text-muted">
                                        Email cannot be changed directly.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                    />
                                </Form.Group>

                                <h5 className="mt-4 mb-3">Address Details</h5>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Address Line 1</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                value={profile.address}
                                                onChange={handleChange}
                                                placeholder="Street, House No"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Address Line 2</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="line2"
                                                value={profile.line2 || ''}
                                                onChange={handleChange}
                                                placeholder="Apartment, Studio, or Floor"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                value={profile.city || ''}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>State</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="state"
                                                value={profile.state || ''}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Pincode</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="pincode"
                                                value={profile.pincode || ''}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit" disabled={updating}>
                                        {updating ? 'Updating...' : 'Update Profile'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DealerProfile;
