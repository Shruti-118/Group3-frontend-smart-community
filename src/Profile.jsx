import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import logo from "./assets/yappy-logo1.png";


// If you have an api.js file, import API_URL when your backend is ready.
import { API_URL } from "./api";

function Profile() {
  const navigate = useNavigate();

  // Get user information saved during login or signup.
  function getSavedUser() {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }

  const [user, setUser] = useState(() => getSavedUser());

  const [name, setName] = useState(
    user?.name || user?.username || ""
  );

  const [email, setEmail] = useState(user?.email || "");

  const [avatar, setAvatar] = useState(
    user?.avatarUrl || user?.picture || user?.imageUrl || ""
  );

  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Additional profile information.
  const [userId, setUserId] = useState(user?.id || "");
  const [emailVerified, setEmailVerified] = useState(
    user?.emailVerified ?? null
  );

  // Fetch the authenticated user's profile from the backend.
  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      setError("");

      // Your login/signup page must save the token using one of these keys.
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in. Please log in and try again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://smartcommunity-2jf8.onrender.com/api/auth/me",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Your session has expired. Please log in again.");
          }
          throw new Error(`Unable to load profile (HTTP ${response.status}).`);
        }

        const data = await response.json();

        // API response shape: { accessToken, tokenType, user: { ... } }
        const profile = data?.user;
        if (!profile || typeof profile !== "object") {
          throw new Error("The server returned an unexpected profile response.");
        }

        if (cancelled) return;

        setUser(profile);
        setName(profile.name || "");
        setEmail(profile.email || "");
        setAvatar(profile.avatarUrl || "");
        setUserId(profile.id || "");
        setEmailVerified(profile.emailVerified ?? null);

        // Keep a local copy for display if the page is refreshed.
        localStorage.setItem("user", JSON.stringify(profile));

        // Keep the role in sync with the backend response.
        if (profile.platformRole) {
          localStorage.setItem("role", profile.platformRole);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Profile loading failed:", err);
          setError(err.message || "Unable to load profile details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle profile picture selection.
  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setError("");

    // Allow only image files.
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // Avoid very large images.
    if (file.size > 2 * 1024 * 1024) {
      setError("Please select an image smaller than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      if (typeof imageData === "string") {
        setAvatar(imageData);
        setMessage("Profile picture selected. Click Save Changes to save it.");
      }
    };

    reader.onerror = () => {
      setError("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);

    // Allow the same file to be selected again.
    e.target.value = "";
  }

  // Save profile changes locally.
  function handleSaveProfile(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    const updatedUser = {
      ...(user || {}),
      name: name.trim(),
      email,
      avatarUrl: avatar,
    };

    try {
      // Save the updated profile in the browser.
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);
      setName(updatedUser.name);
      setEditMode(false);
      setMessage("Profile updated successfully!");
    } catch {
      setError(
        "Unable to save your profile. The image may be too large."
      );
    }
  }

  /*
   * BACKEND INTEGRATION: UPDATE PROFILE
   *
   * When your backend supports profile editing, replace the localStorage
   * save operation with an API request.
   *
   * For example:
   *
   * const response = await fetch(`${API_URL}/api/users/me`, {
   *   method: "PUT",
   *   headers: {
   *     "Content-Type": "application/json",
   *     Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
   *   },
   *   body: JSON.stringify({
   *     name: name.trim(),
   *     avatarUrl: avatar,
   *   }),
   * });
   *
   * Check the actual API documentation before using this example.
   * Your backend may require a separate image-upload endpoint.
   */

  // Remove the profile picture.
  function handleRemoveImage() {
    setAvatar("");
    setMessage("Profile picture removed. Save changes to keep it.");
    setError("");
  }

  // Cancel editing and restore the saved profile.
  function handleCancelEdit() {
    const savedUser = getSavedUser();

    setName(savedUser?.name || savedUser?.username || "");
    setEmail(savedUser?.email || "");
    setAvatar(
      savedUser?.avatarUrl ||
      savedUser?.picture ||
      savedUser?.imageUrl ||
      ""
    );

    setEditMode(false);
    setMessage("");
    setError("");
  }

  // Create an initial for the avatar.
  const initial = (name.trim() || email.trim() || "U")
    .charAt(0)
    .toUpperCase();

  // Format the account creation date if available.
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : null;

  return (
    <div className="profile-page">

      {/* Top navigation */}
      <header className="profile-topbar">
        <button
          className="profile-brand"
          onClick={() => navigate("/home")}
          aria-label="Go to dashboard"
        >
          <img src={logo} alt="Yappy logo" />
          <span>Yappy</span>
        </button>

        <button
          className="profile-back-btn"
          onClick={() => navigate("/home")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="profile-main">

        {/* Page heading */}
        <div className="profile-page-heading">
          <p className="profile-eyebrow">YOUR ACCOUNT</p>
          <h1>My Profile</h1>
          <p>Manage your personal information and profile picture.</p>
          {loading && <p role="status">Loading your profile...</p>}
        </div>

        <div className="profile-layout">

          {/* Left profile card */}
          <section className="profile-card profile-summary-card">

            <div className="profile-avatar-area">

              <div className="profile-avatar">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={`${name || "User"}'s profile`}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>

              {editMode && (
                <label
                  className="profile-upload-btn"
                  htmlFor="profile-image-upload"
                >
                  📷 Change Photo
                </label>
              )}

              <input
                id="profile-image-upload"
                className="profile-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {editMode && avatar && (
                <button
                  type="button"
                  className="profile-remove-photo"
                  onClick={handleRemoveImage}
                >
                  Remove photo
                </button>
              )}
            </div>

            <h2 className="profile-display-name">
              {name || "Your Name"}
            </h2>

            <p className="profile-display-email">
              {email || "Your email address"}
            </p>

            <span className="profile-member-badge">
              ✦ Yappy Member
            </span>

            <div className="profile-summary-divider" />

            <div className="profile-summary-item">
              <span className="profile-summary-icon">👤</span>
              <div>
                <small>Account Type</small>
                <strong>
                  {(user?.platformRole === "ADMIN" || localStorage.getItem("role")?.toUpperCase() === "ADMIN")
                    ? "Administrator"
                    : "Community Member"}
                </strong>
              </div>
            </div>

            <div className="profile-summary-item">
              <span className="profile-summary-icon">✉</span>
              <div>
                <small>Email Status</small>

                <strong>
                  {emailVerified === true
                    ? "Verified"
                    : emailVerified === false
                    ? "Not verified"
                    : "Not available"}
                </strong>
              </div>
            </div>

          </section>

          {/* Right profile details card */}
          <section className="profile-card profile-details-card">

            <div className="profile-section-heading">
              <div>
                <h2>Personal Information</h2>
                <p>Your account details</p>
              </div>

              {!editMode && (
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={() => {
                    setMessage("");
                    setError("");
                    setEditMode(true);
                  }}
                >
                  ✎ Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile}>

              <div className="profile-form-grid">

                {/* Full name */}
                <div className="profile-field">
                  <label htmlFor="profile-name">Full Name</label>

                  <input
                    id="profile-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!editMode}
                  />
                </div>

                {/* Email */}
                <div className="profile-field">
                  <label htmlFor="profile-email">Email Address</label>

                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    disabled
                    readOnly
                  />

                  <small className="profile-field-hint">
                    Your registered email address
                  </small>
                </div>

                {/* User ID */}
                <div className="profile-field">
                  <label htmlFor="profile-user-id">User ID</label>

                  <input
                    id="profile-user-id"
                    type="text"
                    value={userId || "Not available"}
                    disabled
                    readOnly
                  />
                </div>

                {/* Account role */}
                <div className="profile-field">
                  <label htmlFor="profile-role">Account Role</label>

                  <input
                    id="profile-role"
                    type="text"
                    value={
                      (user?.platformRole === "ADMIN" || localStorage.getItem("role")?.toUpperCase() === "ADMIN")
                        ? "Administrator"
                        : "User"
                    }
                    disabled
                    readOnly
                  />
                </div>

                {/* Join date, if available */}
                {joinedDate && (
                  <div className="profile-field">
                    <label htmlFor="profile-joined">Member Since</label>

                    <input
                      id="profile-joined"
                      type="text"
                      value={joinedDate}
                      disabled
                      readOnly
                    />
                  </div>
                )}

              </div>

              {error && (
                <p className="profile-message profile-error">
                  {error}
                </p>
              )}

              {message && (
                <p className="profile-message profile-success">
                  {message}
                </p>
              )}

              {editMode && (
                <div className="profile-form-actions">

                  <button
                    type="button"
                    className="profile-cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-save-btn"
                  >
                    Save Changes
                  </button>

                </div>
              )}

            </form>

          </section>

        </div>

        {/* Bottom navigation */}
        <div className="profile-bottom-actions">
          <button
            type="button"
            className="profile-dashboard-btn"
            onClick={() => navigate("/home")}
          >
            ← Return to Dashboard
          </button>
        </div>

      </main>
    </div>
  );
}

export default Profile;