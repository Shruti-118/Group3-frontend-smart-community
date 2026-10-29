
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Servers.css";
import { API_URL } from "./api";

const icons = {
  home: "⌂",
  server: "♧",
  messages: "✉︎",
  explore: "⌕",
  plus: "+",
  users: "♧",
  close: "×",
  upload: "↑",
  globe: "◎",
  lock: "▣",
  search: "⌕",
  check: "✓",
  loading: "◌",
  arrow: "→",
};

function Icon({ name, className = "" }) {
  return (
    <span
      className={`servers-icon ${className}`}
      aria-hidden="true"
    >
      {icons[name] || "•"}
    </span>
  );
}

const DEMO_SERVERS = [
  {
    id: "demo-design",
    name: "Creative Minds",
    description: "Share designs, ideas, and creative projects.",
    category: "Design",
    members: 128,
    icon: "✎",
  },
  {
    id: "demo-developers",
    name: "Developers Hub",
    description: "Connect with developers and learn together.",
    category: "Technology",
    members: 245,
    icon: "</>",
  },
  {
    id: "demo-gaming",
    name: "Gaming Zone",
    description: "Find teammates and talk about your favorite games.",
    category: "Gaming",
    members: 186,
    icon: "◇",
  },
  {
    id: "demo-students",
    name: "Student Corner",
    description: "Study groups, notes, and student discussions.",
    category: "Education",
    members: 94,
    icon: "▤",
  },
];

function readStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function Servers() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePopup, setActivePopup] = useState("");
  const [createdServers, setCreatedServers] = useState(() =>
    readStorage("myCreatedServers")
  );
  const [joinedServers, setJoinedServers] = useState(() =>
    readStorage("myJoinedServers")
  );

  const [serverName, setServerName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [iconPreview, setIconPreview] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServers, setSelectedServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function saveCreatedServers(servers) {
    setCreatedServers(servers);
    localStorage.setItem("myCreatedServers", JSON.stringify(servers));
  }

  function saveJoinedServers(servers) {
    setJoinedServers(servers);
    localStorage.setItem("myJoinedServers", JSON.stringify(servers));
  }

  function openPopup(type) {
    setActivePopup(type);
    setError("");
    setNotice("");
  }

  function closePopup() {
    if (loading) return;
    setActivePopup("");
    setError("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please select an image smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setIconPreview(String(reader.result || ""));
      setError("");
    };

    reader.onerror = () => {
      setError("Unable to read the selected image.");
      setIconPreview("");
    };

    reader.readAsDataURL(file);
  }

  async function handleCreateServer(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const name = serverName.trim();
    const details = description.trim();

    if (!name || !details) {
      setError("Please enter both a server name and description.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in first. Authentication token not found.");
      return;
    }

    setLoading(true);

    try {
      /*
        CREATE SERVER API

        POST https://smartcommunity-2jf8.onrender.com/api/servers

        Headers:
          Authorization: Bearer <token>
          Content-Type: application/json

        The supplied API accepts:
          name, description, iconUrl

        Visibility is selected in the UI, but the supplied API
        does not document a visibility field.
      */

      const response = await fetch(`${API_URL}/api/servers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: details,
          iconUrl: iconPreview || "",
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create server."
        );
      }

      const newServer = {
        ...data,
        id: data.id || `local-${Date.now()}`,
        name: data.name || name,
        description: data.description || details,
        iconUrl: data.iconUrl || iconPreview || "",
        visibility,
      };

      const updatedServers = [
        newServer,
        ...createdServers.filter(
          (server) => server.id !== newServer.id
        ),
      ];

      saveCreatedServers(updatedServers);

      setServerName("");
      setDescription("");
      setVisibility("public");
      setIconPreview("");
      setActivePopup("");
      setNotice(`"${newServer.name}" was created successfully.`);
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleServerSelection(server) {
    const alreadyJoined = joinedServers.some(
      (item) => item.id === server.id
    );

    if (alreadyJoined) return;

    setSelectedServers((current) =>
      current.includes(server.id)
        ? current.filter((id) => id !== server.id)
        : [...current, server.id]
    );
  }

  function handleJoinDone() {
    const newlyJoined = DEMO_SERVERS.filter((server) =>
      selectedServers.includes(server.id)
    );

    const updatedServers = [
      ...joinedServers,
      ...newlyJoined.filter(
        (server) =>
          !joinedServers.some((item) => item.id === server.id)
      ),
    ];

    saveJoinedServers(updatedServers);
    setSelectedServers([]);
    setActivePopup("");

    setNotice(
      newlyJoined.length
        ? "Your joined communities have been updated."
        : "Your joined communities are unchanged."
    );
  }

  const filteredServers = DEMO_SERVERS.filter((server) => {
    const search = searchTerm.toLowerCase();

    return (
      server.name.toLowerCase().includes(search) ||
      server.description.toLowerCase().includes(search) ||
      server.category.toLowerCase().includes(search)
    );
  });

  return (
    <div className="servers-layout">
      {/* SIDEBAR */}
      <aside className="servers-sidebar">
        <button
          type="button"
          className="servers-brand"
          onClick={() => navigate("/servers")}
        >
          <span className="servers-brand-icon"><img src="/assets/yappy-logo.png"  alt="Yappy logo" className="brand-logo" /></span>

          <span>
            <strong>Yappy</strong>
          </span>
        </button>

        <nav className="servers-navigation">
          <button
            type="button"
            className={`servers-nav-link ${
              location.pathname === "/" ? "active" : ""
            }`}
            onClick={() => navigate("/")}
          >
            <Icon name="home" />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`servers-nav-link ${
              location.pathname === "/servers" ? "active" : ""
            }`}
            onClick={() => navigate("/servers")}
          >
            <Icon name="server" />
            <span>Servers</span>
          </button>

          <button
            type="button"
            className={`servers-nav-link ${
              location.pathname === "/messages" ? "active" : ""
            }`}
            onClick={() => navigate("/messages")}
          >
            <Icon name="messages" />
            <span>Messages</span>
          </button>

          <button
            type="button"
            className={`servers-nav-link ${
              location.pathname === "/explore" ? "active" : ""
            }`}
            onClick={() => navigate("/explore")}
          >
            <Icon name="explore" />
            <span>Explore</span>
          </button>
        </nav>

        <div className="servers-sidebar-divider" />

        <p className="servers-sidebar-label">QUICK ACTIONS</p>

        <button
          type="button"
          className="servers-quick-link"
          onClick={() => openPopup("create")}
        >
          <Icon name="plus" />
          <span>Create Server</span>
        </button>

        <button
          type="button"
          className="servers-quick-link"
          onClick={() => openPopup("join")}
        >
          <Icon name="users" />
          <span>Join Servers</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="servers-main">
        <header className="servers-topbar">
          <div>
            <span className="servers-breadcrumb">
              Workspace / Servers
            </span>
            <h1>Servers</h1>
          </div>

          <button
            type="button"
            className="servers-explore-top-button"
            onClick={() => openPopup("join")}
          >
            <Icon name="explore" />
            Explore communities
          </button>
        </header>

        {/* HERO / BACKGROUND IMAGE AREA */}
        <section className="servers-hero">
          <div className="servers-hero-content">
            <span className="servers-eyebrow">
              YOUR COMMUNITY STARTS HERE
            </span>

            <h2>Find your people.</h2>

            <p>
              Create a space of your own or join communities
              where conversations come to life.
            </p>

            <div className="servers-hero-actions">
              <button
                type="button"
                className="servers-primary-button"
                onClick={() => openPopup("create")}
              >
                <Icon name="plus" />
                Create server
              </button>

              <button
                type="button"
                className="servers-secondary-button"
                onClick={() => openPopup("join")}
              >
                <Icon name="users" />
                Join servers
              </button>
            </div>
          </div>

          {/* OPTIONAL BACKGROUND ILLUSTRATION:
              Add your image using .servers-hero::before in Servers.css.
          */}
        </section>

        {notice && (
          <div className="servers-notice" role="status">
            <Icon name="check" />
            <span>{notice}</span>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <Icon name="close" />
            </button>
          </div>
        )}

        {/* MY CREATED SERVERS */}
        <section className="servers-list-section">
          <div className="servers-section-heading">
            <div>
              <h2>My Servers</h2>
              <p>Communities you've created</p>
            </div>

            <span className="servers-count">
              {createdServers.length}
            </span>
          </div>

          {createdServers.length === 0 ? (
            <div className="servers-empty-state">
              <div className="servers-empty-icon">
                <Icon name="server" />
              </div>

              <h3>No servers created yet</h3>
              <p>
                Create your own community and invite people to join.
              </p>

              <button
                type="button"
                className="servers-text-button"
                onClick={() => openPopup("create")}
              >
                <Icon name="plus" />
                Create your first server
              </button>
            </div>
          ) : (
            <div className="servers-card-grid">
              {createdServers.map((server) => (
                <article
                  className="servers-community-card"
                  key={server.id}
                >
                  <div className="servers-community-card-top">
                    {server.iconUrl ? (
                      <img
                        className="servers-community-avatar"
                        src={server.iconUrl}
                        alt={`${server.name} icon`}
                      />
                    ) : (
                      <div className="servers-community-avatar servers-avatar-placeholder">
                        <Icon name="server" />
                      </div>
                    )}

                    <span className="servers-visibility-tag">
                      <Icon
                        name={
                          server.visibility === "private"
                            ? "lock"
                            : "globe"
                        }
                      />
                      {server.visibility || "public"}
                    </span>
                  </div>

                  <h3>{server.name}</h3>
                  <p>{server.description}</p>
                  <span className="servers-card-caption">
                    Created by you
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* JOINED SERVERS */}
        <section className="servers-list-section">
          <div className="servers-section-heading">
            <div>
              <h2>Joined Servers</h2>
              <p>Communities you're a part of</p>
            </div>

            <span className="servers-count">
              {joinedServers.length}
            </span>
          </div>

          {joinedServers.length === 0 ? (
            <div className="servers-empty-state">
              <div className="servers-empty-icon">
                <Icon name="users" />
              </div>

              <h3>You haven't joined any servers</h3>
              <p>
                Explore communities and find one that interests you.
              </p>

              <button
                type="button"
                className="servers-text-button"
                onClick={() => openPopup("join")}
              >
                <Icon name="explore" />
                Explore communities
              </button>
            </div>
          ) : (
            <div className="servers-card-grid">
              {joinedServers.map((server) => (
                <article
                  className="servers-community-card"
                  key={server.id}
                >
                  <div className="servers-community-card-top">
                    <div className="servers-community-avatar servers-avatar-placeholder">
                      {server.icon || <Icon name="users" />}
                    </div>

                    <span className="servers-joined-tag">
                      <Icon name="check" />
                      Joined
                    </span>
                  </div>

                  <h3>{server.name}</h3>
                  <p>{server.description}</p>

                  <span className="servers-card-caption">
                    {server.category || "Community"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* BACKEND INTEGRATION TODO:
            Connect your actual list-servers endpoint here when available.
            Do not assume an endpoint exists until confirmed by your backend.
            Then load the user's created and joined server arrays from it.
        */}
      </main>

      {/* CREATE SERVER POPUP */}
      {activePopup === "create" && (
        <div
          className="servers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePopup();
          }}
        >
          <section
            className="servers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-server-title"
          >
            <div className="servers-modal-header">
              <div>
                <span className="servers-modal-kicker">
                  NEW COMMUNITY
                </span>

                <h2 id="create-server-title">
                  Create your server
                </h2>

                <p>
                  Build a place for your community to connect.
                </p>
              </div>

              <button
                type="button"
                className="servers-modal-close"
                onClick={closePopup}
                disabled={loading}
                aria-label="Close popup"
              >
                <Icon name="close" />
              </button>
            </div>

            <form
              className="servers-modal-form"
              onSubmit={handleCreateServer}
            >
              <label htmlFor="server-name">Server name</label>

              <input
                id="server-name"
                type="text"
                placeholder="e.g. Dance and Music Hub"
                value={serverName}
                onChange={(event) =>
                  setServerName(event.target.value)
                }
                maxLength={80}
                required
              />

              <label htmlFor="server-description">
                Description
              </label>

              <textarea
                id="server-description"
                placeholder="What is your community about?"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                maxLength={500}
                rows={3}
                required
              />

              <label htmlFor="server-icon">Server icon</label>

              <label
                className="servers-upload-box"
                htmlFor="server-icon"
              >
                {iconPreview ? (
                  <img
                    className="servers-upload-preview"
                    src={iconPreview}
                    alt="Selected server icon"
                  />
                ) : (
                  <span className="servers-upload-icon">
                    <Icon name="upload" />
                  </span>
                )}

                <span className="servers-upload-copy">
                  <strong>Choose an image</strong>
                  <small>
                    Browse your gallery · Maximum 2 MB
                  </small>
                </span>

                <span className="servers-upload-action">
                  Browse
                </span>
              </label>

              <input
                id="server-icon"
                className="servers-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {iconPreview && (
                <button
                  type="button"
                  className="servers-remove-image"
                  onClick={() => setIconPreview("")}
                >
                  Remove selected image
                </button>
              )}

              <label>Who can join?</label>

              <div className="servers-visibility-options">
                <button
                  type="button"
                  className={`servers-visibility-option ${
                    visibility === "public" ? "selected" : ""
                  }`}
                  onClick={() => setVisibility("public")}
                  aria-pressed={visibility === "public"}
                >
                  <Icon name="globe" />

                  <span>
                    <strong>Public</strong>
                    <small>Discoverable by everyone</small>
                  </span>

                  <span className="servers-radio-dot" />
                </button>

                <button
                  type="button"
                  className={`servers-visibility-option ${
                    visibility === "private" ? "selected" : ""
                  }`}
                  onClick={() => setVisibility("private")}
                  aria-pressed={visibility === "private"}
                >
                  <Icon name="lock" />

                  <span>
                    <strong>Private</strong>
                    <small>For invited members</small>
                  </span>

                  <span className="servers-radio-dot" />
                </button>
              </div>

              {error && (
                <p className="servers-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="servers-modal-actions">
                <button
                  type="button"
                  className="servers-modal-cancel"
                  onClick={closePopup}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="servers-modal-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Icon
                        name="loading"
                        className="servers-spinner"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Icon name="plus" />
                      Create server
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* EXPLORE / JOIN SERVER POPUP */}
      {activePopup === "join" && (
        <div
          className="servers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePopup();
          }}
        >
          <section
            className="servers-modal servers-explore-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="explore-servers-title"
          >
            <div className="servers-modal-header">
              <div>
                <span className="servers-modal-kicker">
                  FIND YOUR COMMUNITY
                </span>

                <h2 id="explore-servers-title">
                  Explore servers
                </h2>

                <p>
                  Discover a community and join the conversation.
                </p>
              </div>

              <button
                type="button"
                className="servers-modal-close"
                onClick={closePopup}
                aria-label="Close popup"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="servers-search-box">
              <Icon name="search" />

              <input
                type="search"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="servers-explore-list">
              {filteredServers.map((server) => {
                const isJoined = joinedServers.some(
                  (item) => item.id === server.id
                );

                const isSelected = selectedServers.includes(
                  server.id
                );

                return (
                  <article
                    className="servers-explore-card"
                    key={server.id}
                  >
                    <div className="servers-explore-avatar">
                      {server.icon}
                    </div>

                    <div className="servers-explore-info">
                      <h3>{server.name}</h3>
                      <p>{server.description}</p>

                      <small>
                        {server.category} · {server.members} members
                      </small>
                    </div>

                    <button
                      type="button"
                      className={`servers-join-button ${
                        isJoined || isSelected ? "is-joined" : ""
                      }`}
                      onClick={() =>
                        toggleServerSelection(server)
                      }
                      disabled={isJoined}
                    >
                      {isJoined ? (
                        <>
                          <Icon name="check" />
                          Joined
                        </>
                      ) : isSelected ? (
                        <>
                          <Icon name="check" />
                          Selected
                        </>
                      ) : (
                        "Join"
                      )}
                    </button>
                  </article>
                );
              })}

              {filteredServers.length === 0 && (
                <div className="servers-no-results">
                  <Icon name="search" />
                  <p>No communities match your search.</p>
                </div>
              )}
            </div>

            <p className="servers-demo-note">
              Demo communities are displayed until a join-servers
              API is available.
            </p>

            <div className="servers-modal-actions">
              <button
                type="button"
                className="servers-modal-cancel"
                onClick={closePopup}
              >
                Cancel
              </button>

              <button
                type="button"
                className="servers-modal-submit"
                onClick={handleJoinDone}
              >
                <Icon name="check" />
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Servers;
