import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./components/ProtectedRoute";
import SignIn   from "./pages/SignIn";
import SignUp   from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AddUser  from "./pages/AddUser";
import Profile  from "./pages/Profile";
import Alerts   from "./pages/Alerts";
import Tracker from "./pages/Tracker/Tracker";
import "./styles/global.css";
import "leaflet/dist/leaflet.css";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 }
};
const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"         element={<PageWrapper><SignIn /></PageWrapper>} />
        <Route path="/signup"   element={<PageWrapper><SignUp /></PageWrapper>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/add-user"  element={<ProtectedRoute><PageWrapper><AddUser /></PageWrapper></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        <Route path="/alerts"    element={<ProtectedRoute><PageWrapper><Alerts /></PageWrapper></ProtectedRoute>} />
        <Route path="/tracker"   element={<ProtectedRoute><PageWrapper><Tracker /></PageWrapper></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <AnimatedRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
