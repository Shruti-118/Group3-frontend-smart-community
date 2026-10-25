import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
function ForgotPassword() {
  const navigate = useNavigate();

  // get the email the user entered when they made their account
  // (saved in CreateAccount.jsx)
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const email = savedUser ? savedUser.email : "";

  // step 1 = enter otp
  // step 2 = enter new password
  // step 3 = password changed
  const [step, setStep] = useState(1);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  // DEMO ONLY: the otp is made here in the frontend just for testing.
  // When backend is ready, delete this state, the backend will keep the otp.
  const [demoOtp, setDemoOtp] = useState("");

  // used so the otp is sent only one time when the page opens
  const alreadySent = useRef(false);

  // send the otp as soon as the page opens
  useEffect(() => {
    if (email !== "" && !alreadySent.current) {
      alreadySent.current = true;
      sendOtp();
    }
  }, []);

  function checkPassword() {
    if (newPassword === "") {
      return "Password is required";
    }
    if (newPassword.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[a-z]/.test(newPassword)) {
      return "Password must have a lowercase letter";
    }
    if (!/[A-Z]/.test(newPassword)) {
      return "Password must have an uppercase letter";
    }
    if (!/[0-9]/.test(newPassword)) {
      return "Password must have a number";
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return "Password must have a symbol like @ # $ !";
    }
    return "";
  }

  function checkConfirm() {
    if (confirmPassword === "") {
      return "Please confirm your password";
    }
    if (confirmPassword !== newPassword) {
      return "Passwords do not match";
    }
    return "";
  }

  // ---------------- send otp (used when page opens and on resend) ----------------
  function sendOtp() {
    // ======================= BACKEND PART 1 =======================
    // Send the registered email to your backend. The backend should:
    //   1. make a random otp and save it (with an expiry time)
    //   2. send the otp to this email
    // The same api is used for "Resend email" (the old otp stops working).
    //
    // Example (use your own api link):
    // await fetch("http://localhost:5000/api/send-otp", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email: email }),
    // });
    // (to use await, write: async function sendOtp() )
    // ===============================================================

    // ---- DEMO CODE (delete this block when backend is ready) ----
    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    setDemoOtp(newOtp);
    console.log("Demo OTP:", newOtp);
    // -------------------------------------------------------------
  }

  function handleResend() {
    sendOtp();
    setOtp("");
    setOtpError("");
    setOtpSuccess("A new OTP has been sent to your email");
  }

  // ---------------- check otp ----------------
  function checkOtp(enteredOtp) {
    // ======================= BACKEND PART 2 =======================
    // Send the email and the otp to your backend. The backend checks
    // if the otp is correct and not expired, and replies yes or no.
    //
    // const response = await fetch("http://localhost:5000/api/verify-otp", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email: email, otp: enteredOtp }),
    // });
    // const isCorrect = response.ok;
    // ===============================================================

    // ---- DEMO CODE (delete when backend is ready) ----
    const isCorrect = enteredOtp === demoOtp;
    // --------------------------------------------------

    if (isCorrect) {
      setOtpError("");
      setOtpSuccess("");
      setStep(2);
    } else {
      setOtpSuccess("");
      setOtpError("Wrong OTP, email authentication failed");
    }
  }

  // runs every time the user types in the otp box
  function handleOtpChange(e) {
    // keep only numbers, maximum 6 digits
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
    setOtpError("");
    setOtpSuccess("");

    // check automatically when 6 digits are typed
    if (value.length === 6) {
      checkOtp(value);
    }
  }

  // ---------------- new password ----------------
  function handleResetPassword(e) {
    e.preventDefault();

    const passwordMsg = checkPassword();
    const confirmMsg = checkConfirm();

    setPasswordError(passwordMsg);
    setConfirmError(confirmMsg);

    if (passwordMsg !== "" || confirmMsg !== "") {
      return;
    }

    // ======================= BACKEND PART 3 =======================
    // Send the email and the new password to your backend. The backend
    // saves the new password (it must store it hashed, not as plain text).
    //
    // await fetch("http://localhost:5000/api/reset-password", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email: email, newPassword: newPassword }),
    // });
    // ===============================================================

    setStep(3);
  }

  return (
    <div className="login-page">
      <div className="login-box">
        {/* no account saved in this browser */}
        {email === "" && (
          <div>
            <h2 className="reset-title">
              <span>🔐</span> Reset password
            </h2>
            <p className="error">
              No registered email found. Please create an account first.
            </p>
            <button
              type="button"
              className="login-btn"
              onClick={() => navigate("/create-account")}
            >
              Create account
            </button>
          </div>
        )}

        {/* ---------- STEP 1 : otp ---------- */}
        {email !== "" && step === 1 && (
          <div>
            <h2 className="reset-title">
              <span>🔐</span> Reset password
            </h2>
            <p className="small-text">
              We have sent an OTP to your registered email, fill it here for
              verification
            </p>

            <div className="email-icon">✉️</div>

            <label>Enter OTP</label>
            <input
              type="text"
              className="otp-input"
              placeholder="------"
              value={otp}
              onChange={handleOtpChange}
            />
            <p className="error">{otpError}</p>
            <p className="success">{otpSuccess}</p>

            <p className="bottom-text">Didn't receive the email?</p>
            <button
              type="button"
              className="create-btn"
              onClick={handleResend}
            >
              Resend email
            </button>

            {/* DEMO ONLY: delete this line when backend is ready */}
            <p className="demo-note">Demo only: your OTP is {demoOtp}</p>
          </div>
        )}

        {/* ---------- STEP 2 : new password ---------- */}
        {email !== "" && step === 2 && (
          <form onSubmit={handleResetPassword}>
            <h2 className="reset-title">
              <span>🔐</span> Reset password
            </h2>
            <p className="success">✔ Email verified</p>
            <p className="small-text">Now enter your new password</p>

            <label>New password</label>
            <div className="password-row">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🔒" : "🔓"}
              </span>
            </div>
            <p className="error">{passwordError}</p>

            <label>Confirm new password</label>
            <div className="password-row">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Enter new password again"
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

            <button type="submit" className="login-btn">
              Reset password
            </button>
          </form>
        )}

        {/* ---------- STEP 3 : done ---------- */}
        {email !== "" && step === 3 && (
          <div>
            <h2 className="reset-title">
              <span>✅</span> All done
            </h2>
            <p className="success">Your password was changed successfully</p>

            <button
              type="button"
              className="login-btn"
              onClick={() => navigate("/")}
            >
              Back to login
            </button>
          </div>
        )}

        {step !== 3 && (
          <p className="bottom-text">
            Remember your password?{" "}
            <span className="terms-link" onClick={() => navigate("/")}>
              Login
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
