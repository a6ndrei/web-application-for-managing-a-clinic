import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BookAppointment from "./pages/BookAppointment";
import ManageAppointments from "./pages/ManageAppointments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/bookAppointment" element={<BookAppointment />}></Route>
        <Route
          path="/manageAppointments"
          element={<ManageAppointments />}
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
