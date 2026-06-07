import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BookAppointment from "./pages/BookAppointment";
import AppointmentPage from "./pages/AppointmentPage";
import ManageAppointments from "./pages/ManageAppointments";
import DoctorPage from "./pages/DoctorPage";
import AdminPage from "./pages/AdminPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (!token || user.rol !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/reset-password/:token" element={<ResetPassword />}></Route>
        <Route
          path="/bookAppointment"
          element={
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute>
              <AppointmentPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/manageAppointments"
          element={
            <ProtectedRoute>
              <ManageAppointments />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/doctor-appointments"
          element={
            <ProtectedRoute>
              <DoctorPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminPage />
            </AdminProtectedRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
