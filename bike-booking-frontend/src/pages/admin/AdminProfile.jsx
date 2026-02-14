import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getAdminProfile, updateAdminProfile } from '../../api/adminApi';
import { toast } from 'react-toastify';

const AdminProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (user?.userId) {
                    try {
                        const data = await getAdminProfile(user.userId);
                        setProfile({
                            name: data.name || '',
                            email: data.email || ''
                        });
                    } catch (err) {
                        // Fallback to user context
                        console.warn("Could not fetch admin profile:", err);
                        setProfile(prev => ({
                            ...prev,
                            name: user?.name || '',
                            email: user?.email || ''
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
            await updateAdminProfile(user.userId, profile);
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
                        <Card.Header className="bg-dark text-white">
                            <h4 className="mb-0">Admin Profile</h4>
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
                                        disabled
                                    />
                                    <Form.Text className="text-muted">
                                        Email cannot be changed directly.
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="dark" type="submit" disabled={updating}>
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

export default AdminProfile;
