BIKE BOOKING FRONTEND

1. Run: npm install
2. Run: npm run dev
3. Backend must run on http://localhost:8080

APIs used:
- POST /api/auth/login
- GET /api/customer/bikes
- POST /api/customer/bookings
- GET /api/dealer/bookings/pending/{dealerId}
- PUT /api/dealer/bookings/accept/{id}
- PUT /api/dealer/bookings/reject/{id}
- GET /api/admin/dealers/pending
- PUT /api/admin/dealers/{id}/verify
