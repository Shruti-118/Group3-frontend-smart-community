import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import logo from "./assets/yappy-logo.png";
import { API_URL } from "./api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate email
  function checkEmail() {
    const pattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    if (email.trim() === "") {
      return "Email is required";
    }

    if (!pattern.test(email.trim())) {
      return "Enter a valid email like name@example.com";
    }

    const beforeAt = email.trim().split("@")[0];

    if (!/[a-z]/i.test(beforeAt)) {
      return "Email name must contain at least one letter, not only numbers";
    }

    return "";
  }

  // Validate password
  function checkPassword() {
    if (password === "") {
      return "Password is required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must have a lowercase letter";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must have an uppercase letter";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must have a number";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must have a symbol like @ # $ !";
    }

    return "";
  }

  // Login using the backend API
  async function handleLogin(e) {
    e.preventDefault();

    const emailMsg = checkEmail();
    const passwordMsg = checkPassword();

    setEmailError(emailMsg);
    setPasswordError(passwordMsg);

    if (emailMsg || passwordMsg) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // Handle unsuccessful login
      if (!response.ok) {
        setPasswordError(
          data.message ||
            data.detail ||
            "Login failed. Please check your email and password."
        );
        return;
      }

      // Read the access token from the response
      const accessToken = data.accessToken;

      if (!accessToken) {
        setPasswordError(
          "Login failed: the server did not return an access token."
        );
        return;
      }

      // Read user details and role
      const loggedInUser = data.user || {};

      // If the backend doesn't return a role, default to "user"
      const role = String(
        loggedInUser.role || data.role || "user"
      ).toLowerCase();

      // Save the token for authenticated API requests
      // "token" supports components that already use this key.
      localStorage.setItem("token", accessToken);
      localStorage.setItem("accessToken", accessToken);

      // Save refresh token only if the backend provides one
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      // Save user information
      const userEmail = loggedInUser.email || email.trim();
      const userName =
        loggedInUser.name || userEmail.split("@")[0];

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...loggedInUser,
          name: userName,
          email: userEmail,
          role: role,
        })
      );

      localStorage.setItem("role", role);
      localStorage.setItem("isLoggedIn", "true");

      setEmailError("");
      setPasswordError("");

      // Navigate based on the role returned by the backend
      if (role === "admin") {
        navigate("/admindashboard", { replace: true });
      } else {
        navigate("/userdashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login API error:", error);

      setPasswordError(
        "Cannot connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="yappy-login-page">
      <form className="yappy-login-box" onSubmit={handleLogin}>
        <div className="yappy-brand">
          <img
            src={logo}
            alt="Yappy logo"
            className="yappy-brand-logo"
          />
          <h1>Yappy</h1>
        </div>

        <h2>Welcome back !</h2>

        <p className="yappy-small-text">
          Log in to your account to continue
        </p>

        <label htmlFor="login-email">Email address</label>

        <input
          id="login-email"
          type="text"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={Boolean(emailError)}
        />

        {emailError && (
          <p className="yappy-error">{emailError}</p>
        )}

        <label htmlFor="login-password">Password</label>

        <div className="yappy-password-row">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-invalid={Boolean(passwordError)}
          />

          <button
            type="button"
            className="yappy-eye"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🔒" : "🔓"}
          </button>
        </div>

        {passwordError && (
          <p className="yappy-error">{passwordError}</p>
        )}

        <p
          className="yappy-forgot"
          onClick={() => navigate("/forgot-password")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/forgot-password");
            }
          }}
        >
          Forgot password?
        </p>

        <button
          type="submit"
          className="yappy-login-btn"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          className="yappy-create-btn"
          onClick={() => navigate("/create-account")}
        >
          Create account
        </button>
      </form>
    </div>
  );
}

export default Login;