import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import logo from "./assets/yappy-logo.jpeg";

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

  // Create account without backend
  function handleSignup(e) {
    e.preventDefault();

    const nameMsg = checkName();
    const emailMsg = checkEmail();
    const passwordMsg = checkPassword();
    const confirmMsg = checkConfirm();

    let agreeMsg = "";

    if (!agree) {
      agreeMsg = "You must agree to the terms and conditions";
    }

    setNameError(nameMsg);
    setEmailError(emailMsg);
    setPasswordError(passwordMsg);
    setConfirmError(confirmMsg);
    setAgreeError(agreeMsg);

    // Stop if validation fails
    if (
      nameMsg !== "" ||
      emailMsg !== "" ||
      passwordMsg !== "" ||
      confirmMsg !== "" ||
      agreeMsg !== ""
    ) {
      return;
    }

    const cleanEmail = email.trim();

    try {
      // Get existing registered users
      const existingUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );

      // Check whether this email is already registered
      const userExists = existingUsers.some(
        (user) =>
          user.email.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (userExists) {
        setEmailError("An account with this email already exists");
        return;
      }

      // Create a new user object
      const newUser = {
        name: name.trim(),
        email: cleanEmail,
        password: password,
      };

      // Add the new user to the registered users array
      existingUsers.push(newUser);

      // Save all registered users in localStorage
      localStorage.setItem(
        "registeredUsers",
        JSON.stringify(existingUsers)
      );

      // Save basic user information for the application
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: name.trim(),
          email: cleanEmail,
        })
      );

      // Clear the form's error messages
      setNameError("");
      setEmailError("");
      setPasswordError("");
      setConfirmError("");
      setAgreeError("");

      // Navigate to Login page after successful registration
      navigate("/", {
        state: {
          registered: true,
          email: cleanEmail,
        },
      });
    } catch (error) {
      console.error("Account creation error:", error);
      setEmailError("Unable to create account. Please try again.");
    }
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSignup}>
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

        <label>Display name</label>

        <input
          type="text"
          placeholder="Enter your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <p className="error">{nameError}</p>

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

        <label>Confirm password</label>

        <div className="password-row">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <span
            className="eye"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "🔒" : "🔓"}
          </span>
        </div>

        <p className="error">{confirmError}</p>

        <div className="terms-row">
          <input
            type="checkbox"
            id="agree"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />

          <label htmlFor="agree">
            I agree to the{" "}
            <span
              className="terms-link"
              onClick={() => setShowTerms(true)}
            >
              terms and conditions
            </span>
          </label>
        </div>

        <p className="error">{agreeError}</p>

        <button type="submit" className="login-btn">
          Sign up
        </button>

        <p className="bottom-text">
          Already have an account?{" "}
          <span
            className="terms-link"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </form>

      {/* Terms and conditions popup */}
      {showTerms && (
        <div
          className="popup-background"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="popup-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Terms and Conditions</h2>

            <p>
              1. You must give correct information while creating your account.
            </p>

            <p>
              2. Keep your password safe and do not share it with anyone.
            </p>

            <p>
              3. You are responsible for everything done using your account.
            </p>

            <p>
              4. Do not use Yappy for anything illegal or harmful.
            </p>

            <p>
              5. We may update these terms at any time.
            </p>

            <button
              type="button"
              className="login-btn"
              onClick={() => {
                setAgree(true);
                setAgreeError("");
                setShowTerms(false);
              }}
            >
              I agree
            </button>

            <button
              type="button"
              className="create-btn"
              onClick={() => setShowTerms(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateAccount;
