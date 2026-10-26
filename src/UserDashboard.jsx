import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import logo from "./assets/yappy-logo.png";
import { API_URL } from "./api";

// ---------------- small helpers ----------------

// greeting text and emoji for the banner
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return { text: "Good Morning", emoji: "☀️" };
  }
  if (hour < 17) {
    return { text: "Good Afternoon", emoji: "🌤️" };
  }
  return { text: "Good Evening", emoji: "🌙" };
}

// plays a short "ding" sound (made by the browser, no sound file needed)
function playDing() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.7);
    setTimeout(() => ctx.close(), 1000);
  } catch (err) {
    // some browsers block sound until the user clicks something
  }
}

// icon box: light colour behind the emoji, so the emoji never merges
// with the background (works in light and dark theme)
function SoftIcon({ icon, color, className }) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: color + "26",
        border: "1.5px solid " + color + "66",
        color: color,
      }}
    >
      {icon}
    </div>
  );
}

// avatar circle: shows the picture from the backend (avatarUrl) if there is one,
// otherwise the first letter of the name
function Avatar({ url, name, className }) {
  return (
    <div className={className}>
      {url ? (
        <img
          src={url}
          alt={name}
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

// sends a GET request to the backend with the login token and gives back the data
async function getWithToken(path) {
  // API_URL is the address of the backend (api.js). All the routes start with /api
  const response = await fetch(API_URL + "/api" + path, {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  });
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED"); // the token is wrong or has expired
  }
  if (!response.ok) {
    throw new Error("REQUEST_FAILED");
  }
  return await response.json();
}
// Sends authenticated requests to the backend
async function serverRequest(path, method = "GET", body = null) {
  const response = await fetch(API_URL + "/api" + path, {
    method,
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
      ...(body !== null && {
        "Content-Type": "application/json",
      }),
    },
    ...(body !== null && {
      body: JSON.stringify(body),
    }),
  });
  // Handle expired or invalid login tokens
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  // Read the response if the backend returns JSON
  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await response.json();
  }
  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }
  return data;
}
// The backend calls communities "servers". This changes one server from the
// backend into the shape our cards use (name, icon, members, ...).
// TODO: if your backend teammate uses different field names, change them here.
function serverToCommunity(server) {
  let role = "Member";

  if (typeof server.role === "string" && server.role !== "") {
    role =
      server.role.charAt(0).toUpperCase() +
      server.role.slice(1).toLowerCase();
  }
  const members =
    typeof server.memberCount === "number"
      ? server.memberCount
      : Array.isArray(server.members)
        ? server.members.length
        : 0;

  return {
    id: server.id,
    name: server.name,
    icon: server.icon || "🌐",
    color: server.color || "#5b44d8",
    members,
    desc: server.description || "",
    joined: true,
    role,
    iconUrl: server.iconUrl || "",
  };
}
// menu shown in the left sidebar
const menuList = [
  { name: "Dashboard", icon: "🏠" },
  { name: "My community", icon: "👥" },
  { name: "Discover", icon: "🧭" },
  { name: "Create Community", icon: "➕" },
  { name: "Notifications", icon: "🔔" },
  { name: "Messages", icon: "💬" },
  { name: "Settings", icon: "⚙️" },
];

function UserDashboard() {
  const navigate = useNavigate();

  // ======================= USER DETAILS =======================
  // "profile" comes from the backend: GET /api/dashboard (see the useEffect below).
  // Until it arrives, the name saved at sign up (CreateAccount.jsx) is shown.
  const [profile, setProfile] = useState(null);
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");

  let userName = "User";
  if (profile && profile.name) {
    userName = profile.name;
  } else if (savedUser && savedUser.name) {
    userName = savedUser.name;
  }
  const firstName = userName.split(" ")[0];

  // the line under the name (it used to show the course, which was fake data)
  let userEmail = "";
  if (profile && profile.email) {
    userEmail = profile.email;
  } else if (savedUser && savedUser.email) {
    userEmail = savedUser.email;
  }

  // picture of the user (empty text = show the first letter of the name)
  const userAvatar = profile && profile.avatarUrl ? profile.avatarUrl : "";
  // ============================================================

  // ======================= BACKEND: GET DASHBOARD DATA =======================
  // The dashboard data comes from the backend: GET /api/dashboard
  // The useEffect below calls it one time when the page opens.
  // ===========================================================================

  // communities the user is in (the backend calls them "servers")
  const [communities, setCommunities] = useState([]);
  const [conversationCount, setConversationCount] = useState(0);
  const [loaded, setLoaded] = useState(false); // true when the dashboard data has arrived
  const [loadError, setLoadError] = useState("");

  // notifications (a new one is added when something happens, with a ding sound)
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0); // set from the backend: unreadNotificationCount

  // recent activities: members who joined communities and their experience
  const [activities, setActivities] = useState([]);

  // other things the page remembers
  const [theme, setTheme] = useState(localStorage.getItem("udTheme") || "light");
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [showAllDiscover, setShowAllDiscover] = useState(false);

  // profile window (opens when the profile in the top right is clicked)
  const [showProfile, setShowProfile] = useState(false);
  const [userDetails, setUserDetails] = useState(null); // from GET /api/users/me
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  // create community popup
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState("");

  // leave community popup
  const [showLeave, setShowLeave] = useState(false);

  // used to scroll to a section
  const myRef = useRef(null);
  const discoverRef = useRef(null);
  const notifRef = useRef(null);

  // details shown in the profile window: GET /api/users/me,
  // or the profile from the dashboard while it is loading
  const details = userDetails || profile;

  // ---------------- numbers for the banner and stats ----------------
  const myCommunities = communities.filter((c) => c.joined);
  const leavable = myCommunities.filter((c) => c.role !== "Owner");
  const totalMembers = communities.reduce((sum, c) => sum + c.members, 0);

  let yourRole = "Not joined yet";
  if (myCommunities.length > 0) {
    yourRole = "Member";
  }
  if (myCommunities.some((c) => c.role === "Owner")) {
    yourRole = "Owner";
  }

  // ---------------- notifications ----------------
  // use this every time a new notification comes. It adds it on top
  // of the list and plays the ding sound.
  function addNotification(n) {
    const newItem = { id: Date.now() + Math.random(), time: "Just now", ...n };
    setNotifications((old) => [newItem, ...old].slice(0, 6));
    setUnread((old) => old + 1);
    playDing();
  }

  // ======================= BACKEND: NEW NOTIFICATIONS =======================
  // TODO (backend): when the backend has a new notification for this user,
  // call addNotification({ icon, color, title, where }) and the ding plays.
  // Two ways to do it:
  //   1. Ask the backend every 30 seconds (polling):
  //      GET http://localhost:8080/api/notifications?unread=true
  //   2. Or use a WebSocket (the backend pushes it to you at once).
  // ===========================================================================

  // ======================= BACKEND: GET DASHBOARD DATA =======================
  // Runs one time when the page opens. It calls GET /api/dashboard and puts the
  // answer in the page:
  //   profile                 -> name, email and picture shown on the page
  //   servers                 -> communities (My community and the stats)
  //   conversationCount       -> shown in the profile window
  //   unreadNotificationCount -> the red number on the bell
    useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await serverRequest("/servers");

        const serverList = Array.isArray(data)
          ? data
          : data?.servers || [];

        setCommunities(serverList.map(serverToCommunity));
        setLoadError("");
      } catch (err) {
        if (err.message === "UNAUTHORIZED") {
          handleLogout();
          return;
        }

        setLoadError(
          err.message || "Could not load your communities."
        );
      } finally {
        setLoaded(true);
      }
    }

    loadDashboard();
    }, []);
  // ===========================================================================

  function addActivity(a) {
    const newItem = { id: Date.now() + Math.random(), color: "#5b44d8", ...a };
    setActivities((old) => [newItem, ...old].slice(0, 7));
  }

  // ---------------- scrolling ----------------
  function scrollToSection(ref) {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ---------------- sidebar menu click ----------------
  function handleMenuClick(name) {
    setActiveMenu(name);

    if (name === "Dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (name === "My community") {
      scrollToSection(myRef);
    }
    if (name === "Discover") {
      scrollToSection(discoverRef);
    }
    if (name === "Create Community") {
      setShowCreate(true);
    }
    if (name === "Notifications") {
      scrollToSection(notifRef);
      setUnread(0);
    }

    // TODO: when you make the pages for Messages and Settings, add the
    // routes in App.jsx and open them here, for example:
    // if (name === "Messages") { navigate("/messages"); }
  }

  // ---------------- theme (light / dark) ----------------
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("udTheme", next);
  }

  // ---------------- profile window ----------------
  // Opens when the profile in the top right is clicked. It calls
  // GET /api/users/me and shows: id, name, email, avatarUrl, emailVerified
  async function openProfile() {
    setShowProfile(true);
    setProfileLoading(true);
    setProfileError("");

    try {
      const data = await getWithToken("/users/me");
      setUserDetails(data);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout(); // the login has expired, go to the login page
        return;
      }
      setProfileError("Could not load your details. Please try again.");
    }

    setProfileLoading(false);
  }
  // ---------------- join a community ----------------
  async function handleJoin(id) {
    const community = communities.find(
      (c) => String(c.id) === String(id)
    );

    if (!community || community.joined) return;

    try {
      await serverRequest(
        `/servers/${encodeURIComponent(id)}/members`,
        "POST"
      );

      // Reload the user's communities from the backend after joining.
      const serverData = await serverRequest("/servers");
      const serverList = Array.isArray(serverData)
        ? serverData
        : serverData?.servers || [];

      setCommunities(serverList.map(serverToCommunity));

      addNotification({
        icon: "🎉",
        color: community.color,
        title: `You joined ${community.name}`,
        where: "Welcome to the community!",
      });

      addActivity({
        name: "You",
        color: community.color,
        community: community.name,
        text: "Excited to be here and meet everyone!",
        time: "Just now",
      });
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout();
        return;
      }
      window.alert(err.message || "Could not join the community. Please try again.");
    }
  }

  // ---------------- leave a community ----------------
  async function handleLeave(id) {
    const community = communities.find(
      (c) => String(c.id) === String(id)
    );

    if (!community || community.role === "Owner") return;
    if (!window.confirm(`Leave ${community.name}?`)) return;

    try {
      await serverRequest(
        `/servers/${encodeURIComponent(id)}/members/me`,
        "DELETE"
      );

      // Reload the user's communities from the backend after leaving.
      const serverData = await serverRequest("/servers");
      const serverList = Array.isArray(serverData)
        ? serverData
        : serverData?.servers || [];
      const updatedCommunities = serverList.map(serverToCommunity);

      setCommunities(updatedCommunities);
      addNotification({
        icon: "👋",
        color: community.color,
        title: `You left ${community.name}`,
        where: "You can join again anytime.",
      });

      const remainingLeavable = updatedCommunities.filter(
        (c) => c.role !== "Owner"
      );
      if (remainingLeavable.length === 0) setShowLeave(false);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout();
        return;
      }
      window.alert(err.message || "Could not leave the community. Please try again.");
    }
  }

  // ---------------- create a community ----------------
  async function handleCreate(e) {
    e.preventDefault();
    setCreateError("");

    const trimmedName = newName.trim();
    if (trimmedName.length < 3) {
      setCreateError("Community name must be at least 3 characters");
      return;
    }
    if (!/[a-z]/i.test(trimmedName)) {
      setCreateError("Community name must contain at least one letter");
      return;
    }
    if (communities.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      setCreateError("A community with this name already exists");
      return;
    }

    try {
      const savedServer = await serverRequest("/servers", "POST", {
        name: trimmedName,
        description: newDescription.trim(),
        iconUrl: "",
      });

      // Use the backend's real server ID and data.
      const serverData = await serverRequest("/servers");
      const serverList = Array.isArray(serverData)
        ? serverData
        : serverData?.servers || [];
      setCommunities(serverList.map(serverToCommunity));

      addNotification({
        icon: "🌟",
        color: "#5b44d8",
        title: "Community created",
        where: `${savedServer?.name || trimmedName} is ready!`,
      });

      setNewName("");
      setNewDescription("");
      setCreateError("");
      setShowCreate(false);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout();
        return;
      }
      setCreateError(err.message || "Could not create community. Please try again.");
    }
  }

  // ---------------- logout ----------------
  function handleLogout() {
    // TODO (backend): if your backend keeps login sessions, tell it here that
    // the user logged out
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  }

  // ---------------- search ----------------
  // TODO (backend): right now the search only filters the communities already on
  // this page. For a real search of all communities, members and topics, send
  // the text to the backend, for example:
  // GET http://localhost:8080/api/search?q=text
  const text = search.toLowerCase();
  const matches = (c) =>
    c.name.toLowerCase().includes(text) || c.desc.toLowerCase().includes(text);

  const shownMy = myCommunities.filter(matches);
  const shownDiscover = communities.filter((c) => !c.joined && matches(c));
  const visibleDiscover = showAllDiscover ? shownDiscover : shownDiscover.slice(0, 6);

  const greeting = getGreeting();
  const todayText = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className={theme === "dark" ? "ud-page ud-dark" : "ud-page"}>
      {/* ================= LEFT SIDEBAR ================= */}
      <div className="ud-sidebar">
        <div className="ud-brand">
          <img src={logo} alt="Yappy logo" />
          <h2>Yappy</h2>
        </div>

        {menuList.map((item) => (
          <p
            key={item.name}
            className={
              activeMenu === item.name
                ? "ud-menu-item ud-menu-active"
                : "ud-menu-item"
            }
            onClick={() => handleMenuClick(item.name)}
          >
            <span className="ud-menu-icon">{item.icon}</span> {item.name}
          </p>
        ))}

        <div className="ud-sidebar-profile">
          <Avatar url={userAvatar} name={userName} className="ud-avatar" />
          <div>
            <p className="ud-profile-name">{firstName}</p>
            <p className="ud-profile-course">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="ud-main">
        {/* ----- top bar ----- */}
        <div className="ud-topbar">
          <div className="ud-search-wrap">
            <span>🔍</span>
            <input
              type="text"
              className="ud-search"
              placeholder="Search communities, members, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ud-top-right">
            {/* theme button: switches light <-> dark */}
            <button
              type="button"
              className="ud-theme-btn"
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            <div
              className="ud-bell"
              onClick={() => handleMenuClick("Notifications")}
            >
              🔔
              {unread > 0 && <span className="ud-bell-badge">{unread}</span>}
            </div>

            <div className="ud-user-box" onClick={openProfile}>
              <Avatar url={userAvatar} name={userName} className="ud-avatar" />
              <div className="ud-user-info">
                <p className="ud-profile-name">{firstName}</p>
                <p className="ud-profile-course">{userEmail}</p>
              </div>
              <span>⌄</span>
            </div>
          </div>
        </div>

        {/* ----- page content ----- */}
        <div className="ud-body">
          {/* ===== left column ===== */}
          <div className="ud-left">
            {loadError !== "" && <p className="ud-error">{loadError}</p>}

            {/* ----- greeting banner ----- */}
            <div className="ud-banner">
              <div className="ud-banner-text">
                <p className="ud-banner-date">{todayText}</p>
                <h1>
                  {greeting.emoji} {greeting.text},
                  <br />
                  <span className="ud-banner-name">{firstName}!</span>
                </h1>
                <p className="ud-banner-sub">
                  Explore communities, stay updated and be a part of meaningful
                  discussions.
                </p>

                <div className="ud-banner-chips">
                  <span className="ud-chip">🏘️ {myCommunities.length} joined</span>
                  <span className="ud-chip">🌍 {communities.length} communities</span>
                  <span className="ud-chip">🔔 {unread} new</span>
                </div>

                <button
                  type="button"
                  className="ud-banner-btn"
                  onClick={() => handleMenuClick("Discover")}
                >
                  Explore communities →
                </button>
              </div>

              <div className="ud-banner-art">
                <span className="ud-bubble ud-bubble-1">🎮</span>
                <span className="ud-bubble ud-bubble-2">💬</span>
                <span className="ud-bubble ud-bubble-3">🚀</span>
              </div>
            </div>

            {/* ----- my community ----- */}
            <div className="ud-section" ref={myRef}>
              <div className="ud-section-head">
                <h2>My community</h2>
                <span className="ud-count-text">{myCommunities.length} joined</span>
              </div>

              {loaded && myCommunities.length === 0 && (
                <div className="ud-empty-box">
                  <p>You haven't joined any community yet 🌱</p>
                  <p className="ud-light-text">
                    Pick a community from Discover below and click Join.
                  </p>
                  <button
                    type="button"
                    className="ud-join-btn ud-empty-btn"
                    onClick={() => handleMenuClick("Discover")}
                  >
                    Explore communities
                  </button>
                </div>
              )}

              <div className="ud-card-grid">
                {shownMy.map((c) => (
                  <div className="ud-comm-card" key={c.id}>
                    <div className="ud-comm-top">
                      <SoftIcon icon={c.icon} color={c.color} className="ud-comm-icon" />
                      <span className="ud-members">👥 {c.members}</span>
                    </div>
                    <p className="ud-comm-name">{c.name}</p>
                    <p className="ud-comm-desc">{c.desc}</p>
                    <div className="ud-comm-bottom">
                      <span className="ud-badge-member">{c.role}</span>
                      {c.role !== "Owner" && (
                        <button
                          type="button"
                          className="ud-leave-btn"
                          onClick={() => handleLeave(c.id)}
                        >
                          Leave
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {myCommunities.length > 0 && shownMy.length === 0 && (
                <p className="ud-empty">No communities found</p>
              )}
            </div>

            {/* ----- discover communities ----- */}
            <div className="ud-section" ref={discoverRef}>
              <div className="ud-section-head">
                <h2>Discover Communities</h2>
                {shownDiscover.length > 6 && (
                  <span
                    className="ud-view-all"
                    onClick={() => setShowAllDiscover(!showAllDiscover)}
                  >
                    {showAllDiscover ? "Show Less ↑" : "View All →"}
                  </span>
                )}
              </div>

              <div className="ud-card-grid">
                {visibleDiscover.map((c) => (
                  <div className="ud-comm-card" key={c.id}>
                    <div className="ud-comm-top">
                      <SoftIcon icon={c.icon} color={c.color} className="ud-comm-icon" />
                      <span className="ud-members">👥 {c.members}</span>
                    </div>
                    <p className="ud-comm-name">{c.name}</p>
                    <p className="ud-comm-desc">{c.desc}</p>
                    <div className="ud-comm-bottom">
                      <button
                        type="button"
                        className="ud-join-btn"
                        onClick={() => handleJoin(c.id)}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {shownDiscover.length === 0 && search !== "" && (
                <p className="ud-empty">No communities found</p>
              )}
              {loaded && shownDiscover.length === 0 && search === "" && (
                <p className="ud-empty">You have joined every community 🎉</p>
              )}
            </div>

            {/* ----- recent activities ----- */}
            <div className="ud-section">
              <div className="ud-section-head">
                <h2>Recent activities</h2>
              </div>
              <div className="ud-panel">
                {activities.map((a) => (
                  <div className="ud-activity-item" key={a.id}>
                    <div
                      className="ud-avatar ud-avatar-small"
                      style={{ backgroundColor: a.color }}
                    >
                      {a.name.charAt(0)}
                    </div>
                    <div className="ud-activity-text">
                      <p>
                        <b>{a.name}</b> joined <b>{a.community}</b>
                      </p>
                      <p className="ud-light-text">"{a.text}"</p>
                    </div>
                    <span className="ud-light-text">{a.time}</span>
                    <span className="ud-dot"></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== right column ===== */}
          <div className="ud-right">
            {/* ----- quick actions ----- */}
            <div className="ud-panel">
              <h3 className="ud-panel-title">Quick Actions</h3>
              <button
                type="button"
                className="ud-quick-primary"
                onClick={() => handleMenuClick("Discover")}
              >
                ＋ Join Community
              </button>
              <button
                type="button"
                className="ud-quick-light"
                onClick={() => handleMenuClick("Create Community")}
              >
                ＋ Create Community
              </button>
              <button
                type="button"
                className="ud-quick-danger"
                disabled={leavable.length === 0}
                onClick={() => setShowLeave(true)}
              >
                − Leave Community
              </button>
            </div>

            {/* ----- recent notifications ----- */}
            <div className="ud-panel ud-section" ref={notifRef}>
              <div className="ud-panel-head">
                <h3 className="ud-panel-title">Recent Notifications</h3>
                {unread > 0 && (
                  <span className="ud-view-all" onClick={() => setUnread(0)}>
                    Mark all read
                  </span>
                )}
              </div>
              {notifications.map((n) => {
                // show a Join button on suggestions the user has not joined yet
                const suggested = communities.find((c) => c.id === n.communityId);
                return (
                  <div className="ud-notif-item" key={n.id}>
                    <SoftIcon icon={n.icon} color={n.color} className="ud-notif-icon" />
                    <div className="ud-notif-text">
                      <p>{n.title}</p>
                      <p className="ud-light-text">{n.where}</p>
                    </div>
                    <div className="ud-notif-right">
                      <span className="ud-notif-time">{n.time}</span>
                      {suggested && !suggested.joined && (
                        <button
                          type="button"
                          className="ud-notif-join"
                          onClick={() => handleJoin(suggested.id)}
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ----- community stats ----- */}
            {/* TODO (backend): these numbers are worked out from the list on this
                page. The backend can also send them directly, for example:
                GET http://localhost:8080/api/stats */}
            <div className="ud-panel">
              <div className="ud-panel-head">
                <h3 className="ud-panel-title">Community Stats</h3>
                <span
                  className="ud-view-all"
                  onClick={() => handleMenuClick("My community")}
                >
                  View All →
                </span>
              </div>
              <div className="ud-stat-row">
                <span>🏘️ Total Communities</span>
                <b>{communities.length}</b>
              </div>
              <div className="ud-stat-row">
                <span>✅ Communities Joined</span>
                <b>{myCommunities.length}</b>
              </div>
              <div className="ud-stat-row">
                <span>👥 Total Members</span>
                <b>{totalMembers}</b>
              </div>
              <div className="ud-stat-row">
                <span>🎖️ Your role</span>
                <span className="ud-badge-member">{yourRole}</span>
              </div>
            </div>

            <div className="ud-art-card">
              <span className="ud-bubble ud-bubble-1">💬</span>
              <span className="ud-bubble ud-bubble-2">👥</span>
              <span className="ud-bubble ud-bubble-3">✨</span>
              <p>Find your people on Yappy</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CREATE COMMUNITY POPUP ================= */}
      {showCreate && (
        <div className="ud-popup-bg" onClick={() => setShowCreate(false)}>
          <form
            className="ud-popup"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
          >
            <h3>Create Community</h3>

            <input
              type="text"
              placeholder="Community name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <textarea
              placeholder="What is this community about?"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            ></textarea>

            <p className="ud-error">{createError}</p>

            <button type="submit" className="ud-quick-primary">
              Create
            </button>
            <button
              type="button"
              className="ud-quick-light"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* ================= LEAVE COMMUNITY POPUP ================= */}
      {showLeave && (
        <div className="ud-popup-bg" onClick={() => setShowLeave(false)}>
          <div className="ud-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Leave a community</h3>

            {leavable.length === 0 && (
              <p className="ud-light-text">
                You haven't joined any community you can leave.
              </p>
            )}

            {leavable.map((c) => (
              <div className="ud-leave-row" key={c.id}>
                <SoftIcon icon={c.icon} color={c.color} className="ud-notif-icon" />
                <span className="ud-leave-name">{c.name}</span>
                <button
                  type="button"
                  className="ud-leave-btn"
                  onClick={() => handleLeave(c.id)}
                >
                  Leave
                </button>
              </div>
            ))}

            <button
              type="button"
              className="ud-quick-light"
              onClick={() => setShowLeave(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= PROFILE WINDOW ================= */}
      {showProfile && (
        <div className="ud-popup-bg" onClick={() => setShowProfile(false)}>
          <div className="ud-popup" onClick={(e) => e.stopPropagation()}>
            <h3>My Profile</h3>

            {profileLoading && <p className="ud-light-text">Loading your details...</p>}
            {profileError !== "" && <p className="ud-error">{profileError}</p>}

            {details && (
              <div>
                <div className="ud-pw-top">
                  <Avatar
                    url={details.avatarUrl}
                    name={details.name || userName}
                    className="ud-avatar ud-pw-avatar"
                  />
                  <div>
                    <p className="ud-pw-name">{details.name || userName}</p>
                    <p className="ud-pw-email">{details.email}</p>
                  </div>
                </div>

                <div className="ud-pw-list">
                  <div className="ud-pw-row">
                    <span>Email status</span>
                    {details.emailVerified ? (
                      <span className="ud-pw-badge ud-pw-badge-ok">✅ Verified</span>
                    ) : (
                      <span className="ud-pw-badge ud-pw-badge-no">⚠️ Not verified</span>
                    )}
                  </div>
                  <div className="ud-pw-row">
                    <span>User ID</span>
                    <span className="ud-pw-value">{details.id}</span>
                  </div>
                  <div className="ud-pw-row">
                    <span>Communities joined</span>
                    <b>{myCommunities.length}</b>
                  </div>
                  <div className="ud-pw-row">
                    <span>Conversations</span>
                    <b>{conversationCount}</b>
                  </div>
                </div>
              </div>
            )}

            <button type="button" className="ud-quick-danger" onClick={handleLogout}>
              🚪 Logout
            </button>
            <button
              type="button"
              className="ud-quick-light"
              onClick={() => setShowProfile(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
