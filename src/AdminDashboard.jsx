import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import logo from "./assets/yappy-logo.jpeg";

function AdminDashboard() {
  const navigate = useNavigate();

  // which section is open: "overview", "users" or "admins"
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");

  // ======================= BACKEND: GET USERS =======================
  // TODO (backend): these are FAKE users just for the design.
  // When the API is ready, get the real users from the backend, for example:
  // useEffect(() => {
  //   fetch("http://localhost:5000/api/admin/users", {
  //     headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => setUsers(data));
  // }, []);
  // (also add useEffect in the import at the top)
  // ==================================================================
  const [users, setUsers] = useState([
    { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", status: "Active" },
    { id: 2, name: "Priya Singh", email: "priya@gmail.com", status: "Active" },
    { id: 3, name: "Amit Verma", email: "amit@gmail.com", status: "Blocked" },
    { id: 4, name: "Neha Gupta", email: "neha@gmail.com", status: "Active" },
    { id: 5, name: "Karan Mehta", email: "karan@gmail.com", status: "Active" },
  ]);

  // ======================= BACKEND: GET ADMINS =======================
  // TODO (backend): these are FAKE admins. Get the real list from the backend.
  // ===================================================================
  const [admins, setAdmins] = useState([
    { id: 1, name: "Main Admin", email: "admin@yappy.com" },
  ]);

  // add admin form
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // ---------------- logout ----------------
  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  }

  // ---------------- block / unblock user ----------------
  function toggleBlock(id) {
    // ======================= BACKEND: BLOCK USER =======================
    // TODO (backend): tell the backend to block / unblock this user, for example:
    // await fetch("http://localhost:5000/api/admin/users/" + id + "/block", {
    //   method: "PUT",
    //   headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    // });
    // ===================================================================

    const newList = users.map((user) => {
      if (user.id === id) {
        const newStatus = user.status === "Active" ? "Blocked" : "Active";
        return { ...user, status: newStatus };
      }
      return user;
    });
    setUsers(newList);
  }

  // ---------------- delete user ----------------
  function deleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    // ======================= BACKEND: DELETE USER =======================
    // TODO (backend): tell the backend to delete this user, for example:
    // await fetch("http://localhost:5000/api/admin/users/" + id, {
    //   method: "DELETE",
    //   headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    // });
    // ====================================================================

    setUsers(users.filter((user) => user.id !== id));
  }

  // ---------------- add admin ----------------
  function handleAddAdmin(e) {
    e.preventDefault();
    setFormSuccess("");

    // same rules as the login page
    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    if (adminName.trim().length < 3) {
      setFormError("Name must be at least 3 characters");
      return;
    }
    if (!emailPattern.test(adminEmail)) {
      setFormError("Enter a valid email like name@example.com");
      return;
    }
    if (!/[a-z]/i.test(adminEmail.split("@")[0])) {
      setFormError("Email name must contain at least one letter");
      return;
    }
    if (adminPassword.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }
    if (!/[a-z]/.test(adminPassword)) {
      setFormError("Password must have a lowercase letter");
      return;
    }
    if (!/[A-Z]/.test(adminPassword)) {
      setFormError("Password must have an uppercase letter");
      return;
    }
    if (!/[0-9]/.test(adminPassword)) {
      setFormError("Password must have a number");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(adminPassword)) {
      setFormError("Password must have a symbol like @ # $ !");
      return;
    }

    // ======================= BACKEND: ADD ADMIN =======================
    // TODO (backend): send the new admin to the backend. The backend must
    // save it with role = "admin" and store the password hashed. Example:
    // const response = await fetch("http://localhost:5000/api/admin/add-admin", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: "Bearer " + localStorage.getItem("token"),
    //   },
    //   body: JSON.stringify({
    //     name: adminName.trim(),
    //     email: adminEmail,
    //     password: adminPassword,
    //   }),
    // });
    // if (!response.ok) { setFormError("Could not add admin"); return; }
    // (to use await, write: async function handleAddAdmin(e) )
    // ==================================================================

    const newAdmin = {
      id: Date.now(),
      name: adminName.trim(),
      email: adminEmail,
    };
    setAdmins([...admins, newAdmin]);

    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
    setFormError("");
    setFormSuccess("New admin added successfully");
  }

  // ---------------- remove admin ----------------
  function removeAdmin(id) {
    if (admins.length === 1) {
      alert("There must be at least one admin");
      return;
    }
    if (!window.confirm("Remove this admin?")) {
      return;
    }

    // ======================= BACKEND: REMOVE ADMIN =======================
    // TODO (backend): tell the backend to remove this admin
    // (or change this person's role back to "user").
    // =====================================================================

    setAdmins(admins.filter((admin) => admin.id !== id));
  }

  // users shown in the table after searching
  const shownUsers = users.filter((user) => {
    const text = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(text) ||
      user.email.toLowerCase().includes(text)
    );
  });

  // numbers for the overview cards
  // TODO (backend): the backend can send these numbers directly
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const blockedUsers = users.filter((u) => u.status === "Blocked").length;

  return (
    <div className="ad-page">
      {/* ---------- left side menu ---------- */}
      <div className="ad-sidebar">
        <div className="ad-sidebar-brand">
          <img src={logo} alt="Yappy logo" />
          <h2>Yappy</h2>
        </div>

        <p
          className={tab === "overview" ? "ad-menu-item ad-active" : "ad-menu-item"}
          onClick={() => setTab("overview")}
        >
          📊 Overview
        </p>
        <p
          className={tab === "users" ? "ad-menu-item ad-active" : "ad-menu-item"}
          onClick={() => setTab("users")}
        >
          👥 Manage Users
        </p>
        <p
          className={tab === "admins" ? "ad-menu-item ad-active" : "ad-menu-item"}
          onClick={() => setTab("admins")}
        >
          🛡️ Manage Admins
        </p>

        <p className="ad-menu-item ad-logout" onClick={handleLogout}>
          🚪 Logout
        </p>
      </div>

      {/* ---------- right side content ---------- */}
      <div className="ad-content">
        <div className="ad-top-bar">
          <h1>Admin Dashboard</h1>
          <span className="ad-badge">Admin</span>
        </div>

        {/* ----- overview ----- */}
        {tab === "overview" && (
          <div>
            <h2>Overview</h2>
            <div className="ad-cards">
              <div className="ad-card">
                <p>Total users</p>
                <h3>{totalUsers}</h3>
              </div>
              <div className="ad-card">
                <p>Active users</p>
                <h3>{activeUsers}</h3>
              </div>
              <div className="ad-card">
                <p>Blocked users</p>
                <h3>{blockedUsers}</h3>
              </div>
              <div className="ad-card">
                <p>Total admins</p>
                <h3>{admins.length}</h3>
              </div>
            </div>
          </div>
        )}

        {/* ----- manage users ----- */}
        {tab === "users" && (
          <div>
            <h2>Manage Users</h2>
            <input
              type="text"
              className="ad-search"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <table className="ad-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shownUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={
                          user.status === "Active"
                            ? "ad-status ad-status-active"
                            : "ad-status ad-status-blocked"
                        }
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="ad-small-btn"
                        onClick={() => toggleBlock(user.id)}
                      >
                        {user.status === "Active" ? "Block" : "Unblock"}
                      </button>
                      <button
                        className="ad-small-btn ad-delete-btn"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {shownUsers.length === 0 && (
              <p className="ad-no-data">No users found</p>
            )}
          </div>
        )}

        {/* ----- manage admins ----- */}
        {tab === "admins" && (
          <div>
            <h2>Manage Admins</h2>

            <table className="ad-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>
                      <button
                        className="ad-small-btn ad-delete-btn"
                        onClick={() => removeAdmin(admin.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <form className="ad-add-box" onSubmit={handleAddAdmin}>
              <h3>Add a new admin</h3>

              <input
                type="text"
                placeholder="Admin name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Admin email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Temporary password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />

              <p className="error">{formError}</p>
              <p className="ad-success">{formSuccess}</p>

              <button type="submit" className="ad-add-btn">
                Add admin
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
