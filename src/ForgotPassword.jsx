import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./forgotpassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  // Email state
  const [email, setEmail] = useState("");

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  // Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show/hide password states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error and success messages
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loading states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // DEMO OTP
  // Replace this with the OTP verification API when the backend is ready.
  const DEMO_OTP = "414581";

  // Validate email
  function checkEmail() {
    const pattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    if (email.trim() === "") {
      return "Email is required";
    }

    if (!pattern.test(email.trim())) {
      return "Enter a valid email address";
    }

    return "";
  }

  // Validate password
  function checkPassword() {
    if (newPassword === "") {
      return "New password is required";
    }

    if (newPassword.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (!/[a-z]/.test(newPassword)) {
      return "Password must contain a lowercase letter";
    }

    if (!/[A-Z]/.test(newPassword)) {
      return "Password must contain an uppercase letter";
    }

    if (!/[0-9]/.test(newPassword)) {
      return "Password must contain a number";
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return "Password must contain a special character";
    }

    return "";
  }

  // STEP 1: Request OTP
  async function handleSendOtp(e) {
    e.preventDefault();

    const emailMsg = checkEmail();

    setEmailError(emailMsg);
    setOtpError("");
    setSuccessMessage("");

    if (emailMsg) {
      return;
    }

    setSendingOtp(true);

    try {
      /*
       * BACKEND INTEGRATION:
       *
       * Replace the demo implementation with your backend endpoint.
       *
       * Example:
       *
       * const response = await fetch(
       *   `${API_URL}/api/auth/forgot-password`,
       *   {
       *     method: "POST",
       *     headers: {
       *       "Content-Type": "application/json",
       *     },
       *     body: JSON.stringify({
       *       email: email.trim(),
       *     }),
       *   }
       * );
       *
       * const data = await response.json();
       *
       * if (!response.ok) {
       *   throw new Error(data.message || "Unable to send OTP");
       * }
       *
       * The backend should generate and email the OTP.
       */

      // DEMO IMPLEMENTATION
      await new Promise((resolve) => setTimeout(resolve, 400));

      setOtp("");
      setOtpModalOpen(true);
      setOtpError("");
    } catch (error) {
      setEmailError(error.message || "Unable to send OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  // STEP 2: Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();

    setOtpError("");
    setSuccessMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      /*
       * BACKEND INTEGRATION:
       *
       * Send the email and OTP to your backend.
       *
       * Example:
       *
       * const response = await fetch(
       *   `${API_URL}/api/auth/verify-reset-otp`,
       *   {
       *     method: "POST",
       *     headers: {
       *       "Content-Type": "application/json",
       *     },
       *     body: JSON.stringify({
       *       email: email.trim(),
       *       otp: otp,
       *     }),
       *   }
       * );
       *
       * const data = await response.json();
       *
       * if (!response.ok) {
       *   throw new Error(data.message || "Invalid OTP");
       * }
       *
       * Store any reset token returned by the backend securely
       * according to your backend's authentication design.
       */

      // DEMO IMPLEMENTATION
      if (otp !== DEMO_OTP) {
        setOtpError("Incorrect OTP. Please try again.");
        return;
      }

      setOtpVerified(true);
      setOtpModalOpen(false);
      setOtpError("");
      setSuccessMessage("Email verified successfully!");
    } catch (error) {
      setOtpError(error.message || "OTP verification failed");
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    setOtp("");
    setOtpError("");

    /*
     * BACKEND INTEGRATION:
     *
     * Call your resend-OTP endpoint here.
     * The backend should generate a new OTP and email it.
     *
     * For example:
     * POST /api/auth/resend-reset-otp
     * Body: { email: email.trim() }
     */

    // DEMO MODE: The OTP remains 414581.
    setOtpError("Demo OTP: 414581. Enter this code to continue.");
  }

  // STEP 3: Reset password
  async function handleResetPassword(e) {
    e.preventDefault();

    setPasswordError("");
    setConfirmPasswordError("");
    setSuccessMessage("");

    if (!otpVerified) {
      setOtpModalOpen(true);
      setOtpError("Please verify your email first.");
      return;
    }

    const passwordMsg = checkPassword();

    if (passwordMsg) {
      setPasswordError(passwordMsg);
      return;
    }

    if (confirmPassword === "") {
      setConfirmPasswordError("Please confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    setResettingPassword(true);

    try {
      /*
       * BACKEND INTEGRATION:
       *
       * Once OTP verification is implemented by your backend,
       * call the actual password-reset endpoint here.
       *
       * Example:
       *
       * const response = await fetch(
       *   `${API_URL}/api/auth/reset-password`,
       *   {
       *     method: "POST",
       *     headers: {
       *       "Content-Type": "application/json",
       *     },
       *     body: JSON.stringify({
       *       email: email.trim(),
       *       otp: otp,
       *       newPassword: newPassword,
       *     }),
       *   }
       * );
       *
       * const data = await response.json();
       *
       * if (!response.ok) {
       *   throw new Error(data.message || "Password reset failed");
       * }
       *
       * IMPORTANT:
       * Use the exact endpoint, request fields, and reset-token
       * mechanism defined by your backend team.
       */

      // DEMO IMPLEMENTATION ONLY
      // This validates the form but DOES NOT change a real account password.
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccessMessage(
        "Password reset successfully! Redirecting to login..."
      );

      // Clear the form
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setOtpVerified(false);

      // Navigate to login automatically
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (error) {
      setPasswordError(error.message || "Unable to reset password");
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <div className="forgot-page">
      <form
        className="forgot-box"
        onSubmit={handleResetPassword}
        noValidate
      >
        {/* Heading */}
        <div className="forgot-heading">
          <span className="forgot-lock-icon">🔐</span>
          <h1>Reset password</h1>
        </div>

        <p className="forgot-description">
          {otpVerified
            ? "Create a new password to regain access to your account."
            : "Verify your email first, then create a new password."}
        </p>

        {/* Email field */}
        <div className="forgot-email-section">
          <label htmlFor="forgot-email">Registered email address</label>

          <input
            id="forgot-email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            disabled={otpVerified}
          />

          {emailError && (
            <p className="forgot-error">{emailError}</p>
          )}

          {!otpVerified && (
            <button
              type="button"
              className="forgot-secondary-btn"
              onClick={handleSendOtp}
              disabled={sendingOtp}
            >
              {sendingOtp ? "Sending OTP..." : "Send verification OTP"}
            </button>
          )}
        </div>

        {/* Password section: available only after OTP verification */}
        <div
          className={`forgot-password-section ${
            !otpVerified ? "forgot-password-disabled" : ""
          }`}
        >
          <label htmlFor="new-password">New password</label>

          <div className="forgot-password-row">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
              }}
              disabled={!otpVerified}
            />

            <button
              type="button"
              className="forgot-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={!otpVerified}
            >
              {showPassword ? "🔒" : "🔓"}
            </button>
          </div>

          <ul className="forgot-password-rules">
            <li>At least 8 characters</li>
            <li>One lowercase letter</li>
            <li>One uppercase letter</li>
            <li>One number</li>
            <li>One special character (e.g. @ # $ !)</li>
          </ul>

          {passwordError && (
            <p className="forgot-error">{passwordError}</p>
          )}

          <label htmlFor="confirm-password">Confirm new password</label>

          <div className="forgot-password-row">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter your new password again"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError("");
              }}
              disabled={!otpVerified}
            />

            <button
              type="button"
              className="forgot-eye"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              disabled={!otpVerified}
            >
              {showConfirmPassword ? "🔒" : "🔓"}
            </button>
          </div>

          {confirmPasswordError && (
            <p className="forgot-error">{confirmPasswordError}</p>
          )}
        </div>

        {/* Success message */}
        {successMessage && (
          <p className="forgot-success" role="status">
            {successMessage}
          </p>
        )}

        {/* Reset button */}
        <button
          type="submit"
          className="forgot-reset-btn"
          disabled={!otpVerified || resettingPassword}
        >
          {resettingPassword ? "Resetting password..." : "Reset password"}
        </button>

        {/* Login link */}
        <p className="forgot-login-text">
          Remember your password?{" "}
          <button
            type="button"
            className="forgot-login-link"
            onClick={() => navigate("/", { replace: true })}
          >
            Login
          </button>
        </p>
      </form>

      {/* Floating OTP verification modal */}
      {otpModalOpen && (
        <div
          className="forgot-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setOtpModalOpen(false);
            }
          }}
        >
          <div
            className="forgot-otp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-otp-title"
          >
            <button
              type="button"
              className="forgot-modal-close"
              onClick={() => setOtpModalOpen(false)}
              aria-label="Close OTP window"
            >
              ×
            </button>

            <div className="forgot-envelope-icon">✉️</div>

            <h2 id="forgot-otp-title">Verify OTP</h2>

            <p className="forgot-modal-description">
              Enter the 6-digit verification code for
              <br />
              <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp} noValidate>
              <label htmlFor="forgot-otp">Enter OTP</label>

              <input
                id="forgot-otp"
                className="forgot-otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="— — — — — —"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setOtpError("");
                }}
                autoFocus
              />

              {otpError && (
                <p className="forgot-error">{otpError}</p>
              )}

              <button type="submit" className="forgot-verify-btn">
                Verify OTP
              </button>
            </form>

            <p className="forgot-resend-text">
              Didn't receive the code?{" "}
              <button
                type="button"
                className="forgot-resend-link"
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
            </p>

            <p className="forgot-demo-otp">
              Demo only: OTP is <strong>414581</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
