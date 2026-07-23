import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SignIn   from "./pages/SignIn";
import SignUp   from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AddUser  from "./pages/AddUser";
import Profile  from "./pages/Profile";
import Alerts   from "./pages/Alerts";
import "./styles/global.css";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/"         element={<SignIn />} />
          <Route path="/signup"   element={<SignUp />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add-user"  element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/alerts"    element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
