import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/nexora-logo.png";
import { API_URL } from "./api";
import { GoogleLogin } from "@react-oauth/google";
import "./styles.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function checkEmail() {
    // something@something.something
    const pattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    if (email === "") {
      return "Email is required";
    }
    if (!pattern.test(email)) {
      return "Enter a valid email like name@example.com";
    }
    const beforeAt = email.split("@")[0];
    if (!/[a-z]/i.test(beforeAt)) {
      return "Email name must contain at least one letter, not only numbers";
  }
    return "";
  }

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

  async function handleLogin(e) {
  e.preventDefault();
  // Validate email and password
  const emailMsg = checkEmail();
  const passwordMsg = checkPassword();

  setEmailError(emailMsg);
  setPasswordError(passwordMsg);
  // Stop if validation fails
  if (emailMsg !== "" || passwordMsg !== "") {
    return;
  }
  // Connect to the backend login API
  try {
    const response = await fetch(
      API_URL + "/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      }
    );
    // Read the backend response safely
    let data = {};
    try {
      data = await response.json();
    } catch (err) {
      data = {};
    }
    // Handle unsuccessful login
    if (!response.ok) {
      setPasswordError(
        data.message || "Wrong email or password"
      );
      return;
    }
    // Save the access token
    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
    } else {
      setPasswordError("Login failed: access token was not received.");
      return;
    }
    // Save the refresh token if provided
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }

    // Get user information from the backend response
    const loggedInUser = data.user || {};
    const userEmail = loggedInUser.email || email.trim();

    // Preserve the previously saved name if available
    const oldUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    const userName =
      loggedInUser.name ||
      (oldUser && oldUser.email === userEmail
        ? oldUser.name
        : userEmail.split("@")[0]);

    // Save user information
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...loggedInUser,
        name: userName,
        email: userEmail,
      })
    );

    // Save role
    const role = loggedInUser.role || data.role || "user";
    localStorage.setItem("role", role);
    // Mark the user as logged in
    localStorage.setItem("isLoggedIn", "true");
    // Clear previous errors
    setPasswordError("");
    setEmailError("");
    // Navigate after successful login
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  } catch (err) {
    setPasswordError(
      "Cannot connect to the server. Please try again."
    );
  }
}
// GOOGLE LOGIN
async function handleGoogleSuccess(credentialResponse) {
  try {
    // Google returns an ID token in credential.
    const googleToken = credentialResponse.credential;

    if (!googleToken) {
      setPasswordError("Google login failed. Please try again.");
      return;
    }
    const response = await fetch("https://smartcommunity-2jf8.onrender.com/oauth2/authorization/google", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential: googleToken,
      }),
    });

    let data = {};

    try {
      data = await response.json();
    } catch (err) {
      data = {};
    }

    // Handle backend errors.
    if (!response.ok) {
      setPasswordError(
        data.message || "Google login failed. Please try again."
      );
      return;
    }

    // Save Nexora's access token returned by YOUR backend.
    if (!data.accessToken) {
      setPasswordError(
        "Google login failed: backend access token was not received."
      );
      return;
    }

    localStorage.setItem("token", data.accessToken);

    // Save refresh token only if your backend provides one.
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }

    // Get user details returned by YOUR backend.
    const loggedInUser = data.user || {};

    const userEmail = loggedInUser.email || "";

    const userName =
      loggedInUser.name ||
      userEmail.split("@")[0] ||
      "User";

    // Save user information.
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...loggedInUser,
        name: userName,
        email: userEmail,
      })
    );

    // Use the role returned by your backend, if available.
    const role = loggedInUser.role || data.role || "user";

    localStorage.setItem("role", role);
    localStorage.setItem("isLoggedIn", "true");

    // Clear errors.
    setEmailError("");
    setPasswordError("");

    // Redirect after successful login.
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  } catch (err) {
    setPasswordError(
      "Cannot connect to the server. Please try again."
    );
  }
}

// Called if Google sign-in fails or is cancelled.
function handleGoogleError() {
  setPasswordError("Google sign-in was unsuccessful. Please try again.");
}
  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleLogin}>
        <div className="brand">
          <img src={logo} alt="Nexora logo" className="brand-logo" />
          <h1>Nexora</h1>
        </div>
        <h2>Welcome back !</h2>
        <p className="small-text">Log in to your account to continue</p>

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
          >
            {showPassword ? "🔒" : "🔓"}
          </span>
        </div>
        <p className="error">{passwordError}</p>

        <p className="forgot" onClick={() => navigate("/forgot-password")}>
          Forgot password?
        </p>

        <button type="submit" className="login-btn">
          Login
        </button>

        {/* Divider between normal login and Google login */}
        <div className="login-divider">
          <span>OR</span>
        </div>

        {/* Login through Google */}
        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="continue_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width="320"
          />
        </div>

        <button
          type="button"
          className="create-btn"
          onClick={() => navigate("/create-account")}>
          Create account
        </button> 
      </form>
    </div>
  );
}

export default Login;
