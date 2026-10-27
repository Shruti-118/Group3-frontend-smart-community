import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import logo from "./assets/yappy-logo.png";

/*
 * BACKGROUND IMAGE AREA:
 * The hero illustration is intentionally blank. Add your PNG later in the
 * .sc-hero-art CSS background, or place an <img> inside .sc-hero-art.
 */
const features = [
  { icon: "♟", color: "purple", title: "Create or Join Servers", text: "Find your people or build your own community.", route: "/servers" },
  { icon: "•••", color: "green", title: "Real-Time Chat", text: "Stay connected with channels and direct messages.", route: "/chat" },
  { icon: "✓", color: "yellow", title: "Safe & Friendly", text: "AI-powered moderation helps keep our community positive.", route: "/explore" },
  { icon: "ϟ", color: "pink", title: "More Features", text: "Files, reactions, roles and more — all in one place.", route: "/explore" },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [active, setActive] = useState("Home");

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);
  const name = user?.name || user?.username || user?.email?.split("@")[0] || "Your Profile";
  const avatar = user?.avatarUrl || user?.picture || user?.imageUrl;

  function go(label, route) {
    setActive(label);
    setProfileOpen(false);
    navigate(route);
  }

  function submitSearch(e) {
    e.preventDefault();
    navigate(`/explore?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div className={`sc-dashboard ${darkMode ? "sc-dashboard--dark" : ""}`}>
      <aside className="sc-sidebar">
        <button className="sc-brand" onClick={() => go("Home", "/home")} aria-label="Smart Community home">
          <span className="sc-brand-mark"><img src={logo} alt="Yappy logo" className="brand-logo" /></span>
          <span className="yappy-text">Yappy</span>
        </button>

        <nav className="sc-nav" aria-label="Main navigation">
          <button className={active === "Home" ? "active" : ""} onClick={() => go("Home", "/home")}><span>⌂</span>Home</button>
          <button className={active === "Servers" ? "active" : ""} onClick={() => go("Servers", "/servers")}><span>♧</span>Servers</button>
          <button className={active === "Messages" ? "active" : ""} onClick={() => go("Messages", "/chat")}><span>▢</span>Messages</button>
          <button className={active === "Explore" ? "active" : ""} onClick={() => go("Explore", "/explore")}><span>⌕</span>Explore</button>
        </nav>

        <div className="sc-side-divider" />
        <p className="sc-side-label">Quick Actions</p>
        <div className="sc-quick">
          <button onClick={() => go("Create Server", "/servers/create")}><span>＋</span>Create Server</button>
          <button onClick={() => go("Join Server", "/servers/join")}><span>♧</span>Join with Code</button>
        </div>
        <div className="sc-side-decoration" aria-hidden="true"><span>✦</span><i>◕</i></div>
      </aside>

      <main className="sc-main">
        <header className="sc-topbar">
          <form className="sc-search" onSubmit={submitSearch}>
            <button type="submit" aria-label="Search">⌕</button>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search communities..." aria-label="Search communities" />
          </form>
          <button className="sc-theme" onClick={() => setDarkMode(v => !v)} title={darkMode ? "Switch to light mode" : "Switch to dark mode"} aria-label="Toggle theme">{darkMode ? "☀" : "☼"}</button>
          <div className="sc-profile-wrap">
            <button className="sc-profile" onClick={() => setProfileOpen(v => !v)} aria-expanded={profileOpen}>
              {avatar ? <img src={avatar} alt="" /> : <span className="sc-avatar-initial">{name[0]?.toUpperCase()}</span>}
              <i className="sc-online-dot" /><span className="sc-profile-name">{name}</span><span>⌄</span>
            </button>
            {profileOpen && <div className="sc-profile-menu">
              <strong>{name}</strong><small>{user?.email || "Signed-in account"}</small>
              <button onClick={() => go("Profile", "/profile")}>View Profile</button>
              <button onClick={() => go("Settings", "/settings")}>Settings</button>
              <button onClick={() => {
                localStorage.removeItem("user");
                localStorage.removeItem("role");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("token");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");setProfileOpen(false); navigate("/", { replace: true });}}>Log out</button>
            </div>}
          </div>
        </header>

        <div className="sc-content">
          <section className="sc-hero">
            <div className="sc-hero-copy">
              <p className="sc-eyebrow">YOUR PEOPLE. YOUR COMMUNITY.</p>
              <h1>Welcome to<br />Smart Community</h1>
              <p className="sc-hero-description">Connect, chat, and build something great together. Create your own community or join one today!</p>
              <div className="sc-hero-actions">
                <button className="sc-btn sc-btn-primary" onClick={() => go("Servers", "/servers")}>Get Started <span>→</span></button>
                <button className="sc-btn sc-btn-secondary" onClick={() => go("Explore", "/explore")}>Explore Communities</button>
              </div>
            </div>
            {/* BACKGROUND IMAGE AREA — intentionally blank for your PNG.
                Later: add <img src="/images/community-background.png" alt="" />
                or set background-image on .sc-hero-art in UserDashboard.css. */}
            <div className="sc-hero-art" aria-label="Reserved space for dashboard background image" />
          </section>

          <section className="sc-features" aria-label="Community features">
            {features.map(f => <button className="sc-feature-card" key={f.title} onClick={() => go(f.title, f.route)}>
              <span className={`sc-feature-icon ${f.color}`}>{f.icon}</span>
              <strong>{f.title}</strong><span className="sc-feature-text">{f.text}</span>
            </button>)}
          </section>

          <footer className="sc-footer">
            <span>Better Conversations</span><b>✦</b><span>Stronger Communities</span><b>✦</b><span>Together</span><b>✦</b>
          </footer>
        </div>
      </main>
    </div>
  );
}
