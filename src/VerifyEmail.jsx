import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./styles.css";
import logo from "./assets/yappy-logo.png";
import { API_URL } from "./api";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  // the email comes from the Create Account page
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  let email = "";
  if (location.state && location.state.email) {
    email = location.state.email;
  } else if (savedUser) {
    email = savedUser.email;
  }

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verified, setVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const verificationInProgress = useRef(false);


  // ---------------- check the otp with the backend ----------------
  async function checkOtp(enteredOtp) {
    if (
      verificationInProgress.current ||
      enteredOtp.length !== 6 ||
      !email
    ) {
      return;
    }

    verificationInProgress.current = true;
    setIsVerifying(true);
    setOtpError("");
    // ================= BACKEND: VERIFY OTP (START) =================
    try {
      const response = await fetch("https://smartcommunity-2jf8.onrender.com/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          otp: enteredOtp 
        }),
      });
      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        data={};
      }
      if (response.ok) {
        setOtpError("");
        setVerified(true);
      } else {
        // TODO (backend): if you want to show the backend's own message
        // (example: "OTP expired"), read it with response.json() here
        setOtpError(data.message || "Email verification failed. Please try again");
      }
    } catch (err) {
      setOtpError("Cannot connect to the server. Please try again.");
    } finally {
      verificationInProgress.current = false;
      setIsVerifying(false);
    }
    // ================= BACKEND: VERIFY OTP (END) ===================
  }

  // runs every time the user types in the otp box
  function handleOtpChange(e) {
    // keep only numbers, maximum 6 digits
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
    setOtpError("");

    // check automatically when 6 digits are typed
    if (value.length === 6) {
      checkOtp(value);
    }
  }

  return (
    <div className="verify-email-page">
      <div className="verify-email-box">
        <div className="verify-brand">
          <img src={logo} alt="Yappy logo" className="verify-brand-logo" />
          <h1>Yappy</h1>
        </div>

        {/* no email found */}
        {email === "" && (
          <div>
            <h2 className="verify-reset-title">
              <span>✉️</span> Verify email
            </h2>
            <p className="verify-error">
              No email found. Please create an account first.
            </p>
            <button
              type="button"
              className="verify-btn"
              onClick={() => navigate("/create-account")}
            >
              Create account
            </button>
          </div>
        )}

        {/* enter otp */}
        {email !== "" && !verified && (
          <div>
            <h2 className="verify-reset-title">
              <span>✉️</span> Verify email
            </h2>
            <p className="verify-small-text">
              We have sent an OTP to {email}, fill it here for verification
            </p>

            <label>Enter OTP</label>
            <input
              type="text"
              className="verify-otp-input"
              placeholder="------"
              value={otp}
              onChange={handleOtpChange}
              inputMode="numeric"
              maxLength={6}
              disabled={isVerifying}
            />
            {isVerifying && (
              <p className="verify-small-text">
                Verifying your OTP...
              </p>
            )}
            <p className="verify-error">{otpError}</p>

            {/* TODO (backend): a "Resend email" button can be added here when
                the backend gives an api for sending a new otp */}

            <p className="verify-bottom-text">
              Wrong email?{" "}
              <span
                className="verify-terms-link"
                onClick={() => navigate("/create-account")}
              >
                Create account again
              </span>
            </p>
          </div>
        )}

        {/* verified */}
        {email !== "" && verified && (
          <div>
            <h2 className="verify-reset-title">
              <span>✅</span> All done
            </h2>
            <p className="verify-success">✔ Email verified</p>
            <p className="verify-small-text">Your account is ready. Please log in.</p>
            <button
              type="button"
              className="verify-btn"
              onClick={() => navigate("/")}
            >
              Go to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
