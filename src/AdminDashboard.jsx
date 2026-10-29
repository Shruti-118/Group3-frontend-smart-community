import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const initialModerators = [
  "alex@example.com",
  "priya@example.com",
];

const initialStats = {
  activeServers: 12,
  pendingMessages: 8,
  totalMembers: 156,
};

const menuItems = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "servers", icon: "▤", label: "Active Servers" },
  { id: "moderators", icon: "♙", label: "Appointed Moderators" },
  { id: "messages", icon: "✉", label: "Pending Messages" },
  { id: "members", icon: "♧", label: "Members" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [moderators, setModerators] = useState(() => {
    try {
      const saved = localStorage.getItem("adminModerators");
      return saved ? JSON.parse(saved) : initialModerators;
    } catch {
      return initialModerators;
    }
  });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [moderatorEmail, setModeratorEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    localStorage.setItem("adminModerators", JSON.stringify(moderators));
  }, [moderators]);

  const appointModerator = (event) => {
    event.preventDefault();

    const email = moderatorEmail.trim().toLowerCase();

    if (!email) {
      setFormError("Please enter an email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (moderators.some((item) => item.toLowerCase() === email)) {
      setFormError("This member is already an appointed moderator.");
      return;
    }

    setModerators((previous) => [...previous, email]);
    setModeratorEmail("");
    setFormError("");
    setSuccessMessage(`${email} has been added to the moderator list.`);

    // Close the popup after adding the email.
    setInviteOpen(false);
  };

  const removeModerator = (emailToRemove) => {
    setModerators((previous) =>
      previous.filter((email) => email !== emailToRemove)
    );
    setSuccessMessage(`${emailToRemove} was removed from the list.`);
  };

  const openModeratorPopup = () => {
    setModeratorEmail("");
    setFormError("");
    setSuccessMessage("");
    setInviteOpen(true);
  };

  const closeModeratorPopup = () => {
    setInviteOpen(false);
    setModeratorEmail("");
    setFormError("");
  };

  const renderDashboardContent = () => {
    switch (activeSection) {
      case "servers":
        return (
          <section className="admin-content-card">
            <div className="admin-section-heading">
              <div>
                <h2>Active Servers</h2>
                <p>Overview of your community servers.</p>
              </div>
              <span className="admin-count-badge">
                {initialStats.activeServers} active
              </span>
            </div>

            <div className="admin-server-list">
              {[
                "General Community",
                "Developers Hub",
                "Student Corner",
                "Gaming Community",
              ].map((server, index) => (
                <div className="admin-list-item" key={server}>
                  <div className="admin-list-icon">▤</div>
                  <div className="admin-list-text">
                    <strong>{server}</strong>
                    <span>
                      {index % 2 === 0 ? "Community server" : "Interest group"}
                    </span>
                  </div>
                  <span className="admin-status">
                    <span className="admin-status-dot" />
                    Active
                  </span>
                </div>
              ))}
            </div>
            <p className="admin-demo-note">
              Example server entries. Connect your servers API to show live data.
            </p>
          </section>
        );

      case "moderators":
        return (
          <section className="admin-content-card">
            <div className="admin-section-heading">
              <div>
                <h2>Appointed Moderators</h2>
                <p>Manage the members appointed as moderators.</p>
              </div>
              <button
                className="admin-primary-button"
                onClick={openModeratorPopup}
              >
                + Appoint Moderator
              </button>
            </div>

            {renderModeratorList()}
          </section>
        );

      case "messages":
        return (
          <section className="admin-content-card">
            <div className="admin-section-heading">
              <div>
                <h2>Pending Messages</h2>
                <p>Messages that may require administrator attention.</p>
              </div>
              <span className="admin-count-badge">
                {initialStats.pendingMessages} pending
              </span>
            </div>

            <div className="admin-empty-state">
              <div className="admin-empty-icon">✉</div>
              <h3>Message moderation overview</h3>
              <p>
                Connect your message moderation API here to review, approve,
                or remove pending messages.
              </p>
            </div>
          </section>
        );

      case "members":
        return (
          <section className="admin-content-card">
            <div className="admin-section-heading">
              <div>
                <h2>Community Members</h2>
                <p>Overview of registered community members.</p>
              </div>
              <span className="admin-count-badge">
                {initialStats.totalMembers} members
              </span>
            </div>

            <div className="admin-empty-state">
              <div className="admin-empty-icon">♧</div>
              <h3>Member management</h3>
              <p>
                Connect your members API to search members and manage their
                community roles.
              </p>
            </div>
          </section>
        );

      case "settings":
        return (
          <section className="admin-content-card">
            <div className="admin-section-heading">
              <div>
                <h2>Admin Settings</h2>
                <p>Dashboard preferences and administration tools.</p>
              </div>
            </div>

            <div className="admin-setting-row">
              <div>
                <strong>Dashboard appearance</strong>
                <p>Black, white, and grey theme</p>
              </div>
              <span className="admin-setting-value">Default</span>
            </div>

            <div className="admin-setting-row">
              <div>
                <strong>Moderator management</strong>
                <p>View and manage the current moderator list.</p>
              </div>
              <button
                className="admin-secondary-button"
                onClick={() => setActiveSection("moderators")}
              >
                Manage
              </button>
            </div>
          </section>
        );

      default:
        return (
          <>
            <section className="admin-content-card">
              <div className="admin-section-heading">
                <div>
                  <h2>Appointed Moderators</h2>
                  <p>Members responsible for helping manage the community.</p>
                </div>
                <button
                  className="admin-primary-button"
                  onClick={openModeratorPopup}
                >
                  + Appoint Moderators
                </button>
              </div>

              {renderModeratorList()}
            </section>

            <section className="admin-content-card admin-activity-card">
              <div className="admin-section-heading">
                <div>
                  <h2>Community Overview</h2>
                  <p>A quick look at your community management.</p>
                </div>
              </div>

              <div className="admin-overview-grid">
                <button
                  className="admin-overview-item"
                  onClick={() => setActiveSection("servers")}
                >
                  <span className="admin-overview-icon">▤</span>
                  <span>
                    <strong>Manage servers</strong>
                    <small>View active community servers</small>
                  </span>
                  <span className="admin-arrow">→</span>
                </button>

                <button
                  className="admin-overview-item"
                  onClick={() => setActiveSection("messages")}
                >
                  <span className="admin-overview-icon">✉</span>
                  <span>
                    <strong>Review messages</strong>
                    <small>Check pending messages</small>
                  </span>
                  <span className="admin-arrow">→</span>
                </button>

                <button
                  className="admin-overview-item"
                  onClick={() => setActiveSection("members")}
                >
                  <span className="admin-overview-icon">♧</span>
                  <span>
                    <strong>View members</strong>
                    <small>Review community membership</small>
                  </span>
                  <span className="admin-arrow">→</span>
                </button>
              </div>
            </section>
          </>
        );
    }
  };

  function renderModeratorList() {
    if (moderators.length === 0) {
      return (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">♙</div>
          <h3>No moderators appointed yet</h3>
          <p>
            Use the button above to appoint members as community moderators.
          </p>
        </div>
      );
    }

    return (
      <div className="admin-moderator-list">
        {moderators.map((email) => (
          <div className="admin-list-item" key={email}>
            <div className="admin-moderator-avatar">
              {email.charAt(0).toUpperCase()}
            </div>

            <div className="admin-list-text">
              <strong>{email}</strong>
              <span>Community moderator</span>
            </div>

            <span className="admin-role-badge">Moderator</span>

            <button
              type="button"
              className="admin-remove-button"
              onClick={() => removeModerator(email)}
              aria-label={`Remove ${email} from moderators`}
              title="Remove moderator"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon"><img src="/assets/yappy-logo.png" alt="Yappy logo" className="brand-logo" /></div>
          <div>
            <strong>Yappy</strong>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <div className="admin-menu-label">MAIN MENU</div>

        <nav className="admin-navigation" aria-label="Admin dashboard">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`admin-nav-link ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => {
                setActiveSection(item.id);
                setSuccessMessage("");
              }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>

              {item.id === "messages" && (
                <span className="admin-nav-count">
                  {initialStats.pendingMessages}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-avatar">A</div>
          <div className="admin-user-info">
            <strong>Administrator</strong>
            <span>Community Admin</span>
          </div>
          <span className="admin-footer-dots">•••</span>
        </div>
      </aside>

      {/* Main dashboard */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="admin-breadcrumb">
              Workspace <span>/</span> Admin
            </div>
            <h1>
              {menuItems.find((item) => item.id === activeSection)?.label ||
                "Dashboard"}
            </h1>
            <p>Manage your community from one place.</p>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-topbar-status">
              <span className="admin-status-dot" />
              Admin workspace
            </span>
            <div className="admin-topbar-avatar">A</div>
          </div>
        </header>

        {successMessage && (
          <div className="admin-success-banner" role="status">
            <span>✓</span>
            {successMessage}
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics cards */}
        <section className="admin-stats-grid" aria-label="Community statistics">
          <button
            type="button"
            className="admin-stat-card"
            onClick={() => setActiveSection("servers")}
          >
            <div className="admin-stat-top">
              <span className="admin-stat-label">Active Servers</span>
              <span className="admin-stat-icon">▤</span>
            </div>
            <div className="admin-stat-number">{initialStats.activeServers}</div>
            <div className="admin-stat-foot">Community servers</div>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() => setActiveSection("moderators")}
          >
            <div className="admin-stat-top">
              <span className="admin-stat-label">Appointed Moderators</span>
              <span className="admin-stat-icon">♙</span>
            </div>
            <div className="admin-stat-number">{moderators.length}</div>
            <div className="admin-stat-foot">Current moderators</div>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() => setActiveSection("messages")}
          >
            <div className="admin-stat-top">
              <span className="admin-stat-label">Pending Messages</span>
              <span className="admin-stat-icon">✉</span>
            </div>
            <div className="admin-stat-number">
              {initialStats.pendingMessages}
            </div>
            <div className="admin-stat-foot">Awaiting review</div>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() => setActiveSection("members")}
          >
            <div className="admin-stat-top">
              <span className="admin-stat-label">Total Members</span>
              <span className="admin-stat-icon">♧</span>
            </div>
            <div className="admin-stat-number">{initialStats.totalMembers}</div>
            <div className="admin-stat-foot">Registered members</div>
          </button>
        </section>

        {/* Main content changes without navigating to another route */}
        <div className="admin-section-content">
          {renderDashboardContent()}
        </div>

        <footer className="admin-page-footer">
          Smart Community Admin Dashboard
          <span>Black · White · Grey</span>
        </footer>
      </main>

      {/* Appoint moderator popup */}
      {inviteOpen && (
        <div className="admin-modal-overlay" onClick={closeModeratorPopup}>
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appoint-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="admin-modal-close"
              onClick={closeModeratorPopup}
              aria-label="Close popup"
            >
              ×
            </button>

            <div className="admin-modal-icon">♙</div>

            <h2 id="appoint-modal-title">Appoint a Moderator</h2>
            <p className="admin-modal-description">
              Enter the email address of the community member you want to
              appoint as a moderator.
            </p>

            <form onSubmit={appointModerator}>
              <label htmlFor="moderator-email">Member email address</label>
              <input
                id="moderator-email"
                type="email"
                placeholder="member@example.com"
                value={moderatorEmail}
                onChange={(event) => {
                  setModeratorEmail(event.target.value);
                  setFormError("");
                }}
                autoFocus
                required
              />

              {formError && (
                <p className="admin-form-error" role="alert">
                  {formError}
                </p>
              )}

              <button type="submit" className="admin-primary-button admin-modal-submit">
                Appoint Moderator
              </button>
            </form>

            <p className="admin-modal-footnote">
              The email will appear in the appointed moderators list.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}