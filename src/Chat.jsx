
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Chat.css";

const API_BASE_URL = "https://smartcommunity-2jf8.onrender.com";

// Replace this with your actual channel ID if it is different.
const CHANNEL_ID = "68b16109-4c80-439d-ad43-3eb6f3a033f1";

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const currentUserName = localStorage.getItem("userName") || "You";

  const [isOpen, setIsOpen] = useState(true);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Join Your Friends popup state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  const isActive = (path) => location.pathname === path;

  const loadMessages = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Please log in to view your messages.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/channels/${CHANNEL_ID}/messages?page=0&size=30`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session may have expired. Please log in again."
            : "Unable to load messages. Please try again."
        );
      }

      const data = await response.json();

      // Support either an array or a paginated response.
      const fetchedMessages = Array.isArray(data)
        ? data
        : data.content || data.messages || [];

      setMessages(
        [...fetchedMessages].sort(
          (a, b) =>
            new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        )
      );
    } catch (err) {
      setError(err.message || "Something went wrong while loading messages.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMessages();

    if (!token) return undefined;

    const intervalId = setInterval(loadMessages, 10000);

    return () => clearInterval(intervalId);
  }, [loadMessages, token]);

  const sendMessage = async (event) => {
    event.preventDefault();

    const content = text.trim();

    if (!content || sending) return;

    if (!token) {
      setError("Please log in before sending a message.");
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/channels/${CHANNEL_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to send your message. Please try again.");
      }

      setText("");
      await loadMessages();
    } catch (err) {
      setError(err.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  const deleteMessageLocally = (messageId) => {
    // This only hides the message in this browser's current UI.
    // It does not delete the message from the server.
    setMessages((previousMessages) =>
      previousMessages.filter((message) => message.id !== messageId)
    );
  };

  const isMyMessage = (message) => {
    return (
      currentUserId &&
      message.senderId &&
      String(message.senderId) === String(currentUserId)
    );
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleInviteSubmit = (event) => {
    event.preventDefault();

    if (!inviteEmail.trim()) return;

    // Front-end demonstration only; no email is sent by this handler.
    setInviteSent(true);
    setInviteEmail("");
  };

  const closeInvitePopup = () => {
    setInviteOpen(false);
    setInviteSent(false);
    setInviteEmail("");
  };

  return (
    <div className="community-layout">
      {/* Sidebar */}
      <aside className="community-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><img src="/assets/yappy-logo.png" alt="Yappy logo" className="sc-brand-logo" /></div>
          <span>Yappy</span>
        </div>

        <p className="sidebar-section-label">MENU</p>

        <nav className="sidebar-navigation">
          <button
            type="button"
            className={`sidebar-link ${isActive("/home") ? "active" : ""}`}
            onClick={() => navigate("/home")}
          >
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${
              isActive("/servers") ? "active" : ""
            }`}
            onClick={() => navigate("/servers")}
          >
            <span className="nav-icon">▦</span>
            <span>Servers</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${
              isActive("/chat") ? "active" : ""
            }`}
            onClick={() => navigate("/chat")}
          >
            <span className="nav-icon">✉</span>
            <span>Messages</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${
              isActive("/explore") ? "active" : ""
            }`}
            onClick={() => navigate("/explore")}
          >
            <span className="nav-icon">⌕</span>
            <span>Explore</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user-avatar">
            {currentUserName.charAt(0).toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{currentUserName}</span>
            <span className="sidebar-user-status">Community member</span>
          </div>
        </div>
      </aside>

      {/* Main page */}
      <main className="community-content">
        <header className="community-topbar">
          <div>
            <h1 className="page-title">Messages</h1>
            <p className="page-subtitle">
              Connect and keep the conversation going.
            </p>
          </div>

          <button
            type="button"
            className="topbar-profile"
            onClick={() => navigate("/profile")}
            aria-label="Open profile"
            title="Profile"
          >
            {currentUserName.charAt(0).toUpperCase()}
          </button>
        </header>

        {/* Join Your Friends button */}
        <div className="invite-friends-row">
          <button
            type="button"
            className="invite-friends-button"
            onClick={() => {
              setInviteOpen(true);
              setInviteSent(false);
            }}
          >
            <span>👥</span>
            Join Your Friends
          </button>
        </div>

        {/* Invitation popup */}
        {inviteOpen && (
          <div
            className="invite-overlay"
            onClick={closeInvitePopup}
          >
            <section
              className="invite-popup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="invite-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="invite-close"
                onClick={closeInvitePopup}
                aria-label="Close invitation popup"
              >
                ×
              </button>

              <div className="invite-icon">👥</div>

              <h2 id="invite-title">Join Your Friends</h2>

              <p className="invite-description">
                Invite a friend to connect with you on Smart Community.
              </p>

              <form onSubmit={handleInviteSubmit}>
                <label htmlFor="invite-email">Friend's email address</label>

                <input
                  id="invite-email"
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(event) => {
                    setInviteEmail(event.target.value);
                    setInviteSent(false);
                  }}
                  required
                />

                <button
                  type="submit"
                  className="invite-send-button"
                >
                  Send Invitation
                </button>
              </form>

              {inviteSent && (
                <p className="invite-success" role="status">
                  ✓ Invitation sent!
                </p>
              )}

              <p className="invite-footer">
                Bring your friends into the conversation.
              </p>
            </section>
          </div>
        )}

        {/* Chat area */}
        <section className="chat-section">
          <div className="chat-heading">
            <div>
              <h2>Conversation</h2>
              <p>Your community messages in one place.</p>
            </div>

            <div className="chat-heading-actions">
              <button
                type="button"
                className="chat-action-button"
                onClick={loadMessages}
                disabled={loading}
              >
                {loading ? "Loading..." : "↻ Refresh"}
              </button>

              <button
                type="button"
                className="chat-action-button"
                onClick={() => setIsOpen((previous) => !previous)}
              >
                {isOpen ? "− Hide chat" : "+ Open chat"}
              </button>
            </div>
          </div>

          {error && (
            <div className="chat-error" role="alert">
              {error}

              {!token && (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  Go to login
                </button>
              )}
            </div>
          )}

          {isOpen && (
            <div className="chat-panel">
              <div className="chat-panel-header">
                <div className="chat-status-dot" />
                <div>
                  <h3>Community Chat</h3>
                  <p>Messages refresh automatically</p>
                </div>
              </div>

              <div className="chat-messages">
                {loading && messages.length === 0 ? (
                  <div className="chat-empty-state">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty-state">
                    <span className="empty-chat-icon">✉</span>
                    <h3>No messages yet</h3>
                    <p>Start the conversation with your community.</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = isMyMessage(message);

                    return (
                      <article
                        className={`message-row ${
                          mine ? "my-message-row" : ""
                        }`}
                        key={message.id}
                      >
                        <div className="message-avatar">
                          {(message.senderName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="message-content">
                          <div className="message-meta">
                            <span className="message-sender">
                              {mine
                                ? "You"
                                : message.senderName || "Community member"}
                            </span>

                            <time className="message-time">
                              {formatTime(
                                message.createdAt || message.updatedAt
                              )}
                            </time>

                            {mine && (
                              <button
                                type="button"
                                className="message-hide-button"
                                onClick={() =>
                                  deleteMessageLocally(message.id)
                                }
                                title="Hide this message from your view"
                                aria-label="Hide message"
                              >
                                ×
                              </button>
                            )}
                          </div>

                          <div className="message-bubble">
                            {message.content}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              <form className="chat-input-area" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Write a message..."
                  aria-label="Write a message"
                  disabled={!token || sending}
                />

                <button
                  type="submit"
                  className="chat-send-button"
                  disabled={!text.trim() || sending || !token}
                >
                  {sending ? "Sending..." : "Send ➤"}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
