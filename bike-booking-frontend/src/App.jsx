import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import BikeList from "./pages/customer/BikeList";
import BikeDetails from "./pages/customer/BikeDetails";
import MyBookings from "./pages/customer/MyBookings";
import PendingBookings from "./pages/dealer/PendingBookings";
import VerifyDealers from "./pages/admin/VerifyDealers";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/customer/bikes" element={<BikeList />} />
          <Route path="/customer/bike/:id" element={<BikeDetails />} />
          <Route path="/customer/bookings" element={<MyBookings />} />

          <Route path="/dealer/bookings" element={<PendingBookings />} />

          <Route path="/admin/verify-dealers" element={<VerifyDealers />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
