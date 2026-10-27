import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import logo from "./assets/yappy-logo.jpeg";
import { API_URL } from "./api";

function CreateAccount() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [agreeError, setAgreeError] = useState("");

  // Validate display name
  function checkName() {
    if (name.trim() === "") {
      return "Display name is required";
    }

    if (name.trim().length < 3) {
      return "Display name must be at least 3 characters";
    }

    if (!/[a-z]/i.test(name)) {
      return "Display name must contain at least one letter";
    }

    return "";
  }

  // Validate email
  function checkEmail() {
    const pattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    const cleanEmail = email.trim();

    if (cleanEmail === "") {
      return "Email is required";
    }

    if (!pattern.test(cleanEmail)) {
      return "Enter a valid email like name@example.com";
    }

    const beforeAt = cleanEmail.split("@")[0];

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

  // Validate confirm password
  function checkConfirm() {
    if (confirmPassword === "") {
      return "Please confirm your password";
    }

    if (confirmPassword !== password) {
      return "Passwords do not match";
    }

    return "";
  }

  // Handle signup form submission
  async function handleSignup(e) {
    e.preventDefault();

    // Run validations
    const nameMsg = checkName();
    const emailMsg = checkEmail();
    const passwordMsg = checkPassword();
    const confirmMsg = checkConfirm();

    const agreeMsg = agree
      ? ""
      : "You must agree to the terms and conditions";

    // Display validation messages
    setNameError(nameMsg);
    setEmailError(emailMsg);
    setPasswordError(passwordMsg);
    setConfirmError(confirmMsg);
    setAgreeError(agreeMsg);

    // Stop if any validation fails
    if (
      nameMsg ||
      emailMsg ||
      passwordMsg ||
      confirmMsg ||
      agreeMsg
    ) {
      return;
    }

    setLoading(true);

    try {
      // Send signup data to the backend
      const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
            name: name.trim(),
          }),
        }
      );

      // Read the response
      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // Handle signup errors
      if (!response.ok) {
        setEmailError(
          data.message ||
            data.detail ||
            data.error ||
            "Could not create your account. Please try again."
        );
        return;
      }

      // Save name and email for frontend use.
      // Never store the password in localStorage.
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        })
      );

      // Navigate to email verification
      navigate("/verify-email", {
        state: {
          name: name.trim(),
          email: email.trim(),
          message:
            data.message ||
            "Signup successful. Please check your email for the verification code.",
        },
      });
    } catch (error) {
      console.error("Signup API error:", error);

      setEmailError(
        "Cannot connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-account-page">
      <form
        className="create-account-box"
        onSubmit={handleSignup}
        noValidate
      >
        {/* Logo and brand name */}
        <div className="brand">
          <img
            src={logo}
            alt="Yappy logo"
            className="brand-logo"
          />

          <h1>Yappy</h1>
        </div>

        <h2>Create your account</h2>

        <p className="small-text">Join Yappy today</p>

        {/* Display name */}
        <label htmlFor="signup-name">Display name</label>

        <input
          id="signup-name"
          type="text"
          placeholder="Enter your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />

        {nameError && (
          <p className="error">{nameError}</p>
        )}

        {/* Email address */}
        <label htmlFor="signup-email">Email address</label>

        <input
          id="signup-email"
          type="text"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        {emailError && (
          <p className="error">{emailError}</p>
        )}

        {/* Password */}
        <label htmlFor="signup-password">Password</label>

        <div className="password-row">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button
            type="button"
            className="eye"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
          >
            {showPassword ? "🔒" : "🔓"}
          </button>
        </div>

        {passwordError && (
          <p className="error">{passwordError}</p>
        )}

        {/* Confirm password */}
        <label htmlFor="signup-confirm">
          Confirm password
        </label>

        <div className="password-row">
          <input
            id="signup-confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button
            type="button"
            className="eye"
            onClick={() =>
              setShowConfirm((previous) => !previous)
            }
            aria-label={
              showConfirm ? "Hide password" : "Show password"
            }
          >
            {showConfirm ? "🔒" : "🔓"}
          </button>
        </div>

        {confirmError && (
          <p className="error">{confirmError}</p>
        )}

        {/* Terms and conditions checkbox */}
        <div className="terms-row">
          <input
            type="checkbox"
            id="signup-agree"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />

          <label htmlFor="signup-agree">
            I agree to the{" "}
            <span
              className="terms-link"
              role="button"
              tabIndex={0}
              onClick={() => setShowTerms(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowTerms(true);
                }
              }}
            >
              terms and conditions
            </span>
          </label>
        </div>

        {agreeError && (
          <p className="error">{agreeError}</p>
        )}

        {/* Signup button */}
        <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        {/* Navigate to Login */}
        <p className="bottom-text">
          Already have an account?{" "}
          <span
            className="terms-link"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/");
              }
            }}
          >
            Login
          </span>
        </p>
      </form>

      {/* Terms and conditions popup */}
      {showTerms && (
        <div
          className="popup-background"
          onClick={() => setShowTerms(false)}>
          <div
            className="popup-box"
            onClick={(e) => e.stopPropagation()}>
            <h2>Terms and Conditions</h2>
            <p>1. Provide correct information when creating your account.</p>
            <p>2. Keep your password safe and do not share it with anyone.</p>
            <p>3. You are responsible for activity performed using your account.</p>
            <p>4. Do not use Yappy for illegal or harmful activities.</p>
            <p>5. These terms may be updated in the future.</p>
            <button
              type="button"
              className="login-btn"
              onClick={() => {
                setAgree(true);
                setAgreeError("");
                setShowTerms(false);
              }}>I agree</button>
            <button
              type="button"
              className="create-btn"
              onClick={() => setShowTerms(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default CreateAccount;