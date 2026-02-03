import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Container, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaUserCheck, FaMotorcycle, FaSignOutAlt } from 'react-icons/fa';

import '../../App.css'; // Reuse glassmorphism

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ display: 'flex', height: '100vh', minHeight: '100vh', backgroundColor: '#0f172a' }}>
            <Sidebar
                collapsed={collapsed}
                backgroundColor="rgba(30, 41, 59, 0.9)"
                rootStyles={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0'
                }}
            >
                <div className="p-4 text-center">
                    <h4 className="text-white fw-bold mb-0">{collapsed ? 'A' : 'ADMIN'}</h4>
                </div>

                <Menu
                    menuItemStyles={{
                        button: ({ active }) => ({
                            backgroundColor: active ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                            color: active ? '#38bdf8' : '#e2e8f0',
                            '&:hover': {
                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                color: '#38bdf8',
                            },
                        }),
                    }}
                >
                    <MenuItem
                        active={isActive('/admin/dashboard')}
                        icon={<FaTachometerAlt />}
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        Dashboard
                    </MenuItem>

                    <MenuItem
                        active={isActive('/admin/dealers')}
                        icon={<FaUserCheck />}
                        onClick={() => navigate('/admin/dealers')}
                    >
                        Verify Dealers
                    </MenuItem>

                    <MenuItem
                        active={isActive('/admin/bikes')}
                        icon={<FaMotorcycle />}
                        onClick={() => navigate('/admin/bikes')}
                    >
                        Manage Bikes
                    </MenuItem>
                </Menu>

                <div className="p-3 mt-auto">
                    <Button
                        variant="outline-danger"
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt />
                        {!collapsed && 'Logout'}
                    </Button>
                </div>
            </Sidebar>

            <main style={{ flex: 1, overflowY: 'auto' }}>
                <Container fluid className="p-4">
                    <Outlet />
                </Container>
            </main>
        </div>
    );
};

export default AdminLayout;
