import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import CreateAccount from "./CreateAccount";
import ForgotPassword from "./ForgotPassword";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import VerifyEmail from "./VerifyEmail";


// shows the page only if user is logged in
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  return children;
}
function AdminRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  if (role !== "admin") {
    return <Navigate to="/home" />; // normal users can't open admin pages
  }
  return children;
}
// if user is already logged in, skip login / create account pages
function PublicRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");

  if (isLoggedIn) {
    // admin goes to admin dashboard, normal user goes to home
    if (role === "admin") {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/home" />;
  }
  return children;
}

function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  }

  return (
    <div>
      <h1>Home Page</h1>
      {user && <p>Welcome, {user.name}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/create-account" element={
          <PublicRoute>
            <CreateAccount />
          </PublicRoute>
        }
      />
      <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route path="/home" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route path="/verify-email" element={
          <PublicRoute>
            <VerifyEmail />
          </PublicRoute>
        }
      />
    </Routes>
  );
}

export default App;
