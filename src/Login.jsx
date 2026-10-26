import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/yappy-logo.jpeg";
import "./styles.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

    if (password.length < 8) {
      return "Password must be at least 8 characters";
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

  // Login without connecting to the backend
  function handleLogin(e) {
    e.preventDefault();

    const emailMsg = checkEmail();
    const passwordMsg = checkPassword();

    setEmailError(emailMsg);
    setPasswordError(passwordMsg);

    // Stop if validation fails
    if (emailMsg !== "" || passwordMsg !== "") {
      return;
    }

    const userEmail = email.trim();

    // Get previously saved user details, if available
    let oldUser = null;

    try {
      oldUser = JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      oldUser = null;
    }

    // Use the previous name for this email, or create a name from the email
    const userName =
      oldUser && oldUser.email === userEmail && oldUser.name
        ? oldUser.name
        : userEmail.split("@")[0];

    // Save basic user information locally
    const loggedInUser = {
      ...(oldUser && oldUser.email === userEmail ? oldUser : {}),
      name: userName,
      email: userEmail,
    };

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.setItem("role", "user");
    localStorage.setItem("isLoggedIn", "true");

    // Clear validation errors
    setEmailError("");
    setPasswordError("");

    // Navigate to the home page
    navigate("/home");
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleLogin}>
        <div className="brand">
          <img src={logo} alt="Yappy logo" className="brand-logo" />
          <h1>Yappy</h1>
        </div>

        <h2>Welcome back !</h2>

        <p className="small-text">
          Log in to your account to continue
        </p>

        <label>Email address</label>

        <input
          type="text"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <p className="error">{emailError}</p>

        <label>Password</label>

        <div className="password-row">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="eye"
            onClick={() => setShowPassword(!showPassword)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setShowPassword(!showPassword);
              }
            }}
          >
            {showPassword ? "🔒" : "🔓"}
          </span>
        </div>

        <p className="error">{passwordError}</p>

        <p
          className="forgot"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </p>

        <button type="submit" className="login-btn">
          Login
        </button>

        <button
          type="button"
          className="create-btn"
          onClick={() => navigate("/create-account")}
        >
          Create account
        </button>
      </form>
    </div>
  );
}

export default Login;