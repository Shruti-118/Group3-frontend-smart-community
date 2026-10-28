
import { useCallback, useEffect, useState } from "react";
import { Navlink } from "react-router-dom";
import "./Chat.css";

const API_BASE = "https://smartcommunity-2jf8.onrender.com";

const CHANNEL_ID = "68b16109-4c80-439d-ad43-3eb6f3a033f1";

// These keys must match the keys used by your login code.
const TOKEN_KEY = "token";
const USER_NAME_KEY = "userName";
const USER_ID_KEY = "userId";

export default function Chat() {
  const [isOpen, setIsOpen] = useState(true);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  const token = localStorage.getItem(TOKEN_KEY);
  const currentUserName =
    localStorage.getItem(USER_NAME_KEY) || "";
  const currentUserId =
    localStorage.getItem(USER_ID_KEY) || "";

  // Common headers for authenticated API requests
  const getHeaders = useCallback(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (!savedToken) {
      throw new Error(
        "You are not logged in. Please log in first."
      );
    }

    return {
      Authorization: `Bearer ${savedToken}`,
      "Content-Type": "application/json",
    };
  }, []);

  // GET: fetch channel message history
  const loadMessages = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/api/channels/${CHANNEL_ID}/messages?page=0&size=30`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Could not load messages (${response.status}).`
        );
      }

      const data = await response.json();

      // Your API returns an object containing an items array.
      if (!Array.isArray(data.items)) {
        throw new Error(
          "Unexpected response: message items were not found."
        );
      }

      setMessages(data.items);
    } catch (err) {
      setError(err.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  // Load history when the component starts.
  // Refresh every 10 seconds to check for new messages.
  useEffect(() => {
    setLoading(true);
    loadMessages();

    const intervalId = window.setInterval(() => {
      loadMessages();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [loadMessages]);

  // POST: create a message in the selected channel
  async function sendMessage(event) {
    event.preventDefault();

    const content = text.trim();

    if (!content || sending) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/channels/${CHANNEL_ID}/messages`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const details = await response.text();

        throw new Error(
          `Message could not be sent (${response.status}). ${
            details || ""
          }`
        );
      }

      // The API returns the created message.
      const createdMessage = await response.json();

      // Use the server response as the source of truth.
      setMessages((previous) => {
        const alreadyExists = previous.some(
          (message) => message.id === createdMessage.id
        );

        if (alreadyExists) return previous;

        return [...previous, createdMessage];
      });

      setText("");

      // Refresh history to keep the UI in sync with the server.
      await loadMessages();
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  // Delete from this browser's current view only.
  // A real server-side deletion endpoint is not provided.
  function deleteMessageLocally(messageId) {
    const confirmed = window.confirm(
      "Hide this message from your current chat view?"
    );

    if (!confirmed) return;

    setMessages((previous) =>
      previous.filter((message) => message.id !== messageId)
    );
  }

  // Identify which messages belong to the logged-in user.
  function isMyMessage(message) {
    if (
      currentUserId &&
      message.senderId &&
      currentUserId === message.senderId
    ) {
      return true;
    }

    if (currentUserName && message.senderName) {
      return currentUserName === message.senderName;
    }

    return false;
  }

  function formatTime(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!token) {
    return (
      <div className="chat-app">
        <div className="chat-empty">
          <h2>Please log in</h2>
          <p>You need an authentication token to access chat.</p>
        </div>
      </div>
    );
  }

  
return (
  <div className="community-layout">
    {/* Dashboard sidebar */}
    <aside className="community-sidebar">
      <Navlink to="/home" className="community-brand">
        <span className="brand-symbol"><img src="/assets/yappy-logo.png" alt="Yappy logo" className="sc-brand-logo" /></span>
        <span className="brand-text">Yappy</span>
      </Navlink>

      <div className="sidebar-navigation">
        <Navlink
          to="/home"
          end
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">⌂</span>
          Home
        </Navlink>

        <Navlink
          to="/servers"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">♧</span>
          Servers
        </Navlink>

        <Navlink
          to="/chat"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">✉︎</span>
          Messages
        </Navlink>

        <Navlink
          to="/explore"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">⌕</span>
          Explore
        </Navlink>
      </div>

      <div className="sidebar-divider" />

      <p className="quick-actions-title">Quick Actions</p>

      <Navlink to="/servers" className="sidebar-quick-link">
        <span className="nav-icon">＋</span>
        Create Server
      </Navlink>

      <Navlink to="/servers" className="sidebar-quick-link">
        <span className="nav-icon">♧</span>
        Join with Code
      </Navlink>

      <div className="sidebar-bottom">
        <div className="sidebar-decoration">✦</div>
        <div className="sidebar-avatar">●</div>
        <p>Connect. Chat. Build.</p>
      </div>
    </aside>

    {/* Main chat content */}
    <main className="community-content">
      <header className="community-topbar">
        <div>
          <p className="topbar-eyebrow">YOUR COMMUNITY</p>
          <h1>Messages</h1>
          <p className="topbar-description">
            Connect and keep the conversation going.
          </p>
        </div>

        <button
          type="button"
          className="chat-close-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Close chat ×" : "Open chat +"}
        </button>
      </header>
              
        {/* Invite friends button */}
        <div className="invite-friends-row">
          <button
            type="button"
            className="invite-friends-button"
            onClick={() => {
              setInviteSent(false);
              setInviteEmail("");
              setInviteOpen(true);
            }}
          >
            👥 Join Your Friends
            <span>↗</span>
          </button>
        </div>

        {/* Invite friends popup */}
        {inviteOpen && (
          <div
            className="invite-overlay"
            onClick={() => setInviteOpen(false)}
          >
            <div
              className="invite-popup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="invite-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="invite-close"
                aria-label="Close invitation popup"
                onClick={() => setInviteOpen(false)}
              >
                ×
              </button>

              <div className="invite-icon">👥</div>

              <h2 id="invite-title">Join Your Friends</h2>

              <p className="invite-description">
                Good conversations are better with friends.
                Invite someone to join your community!
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  if (!inviteEmail.trim()) return;

                  setInviteSent(true);
                  setInviteEmail("");
                }}
              >
                <label htmlFor="invite-email">
                  Friend's email address
                </label>

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
                  Send invitation ↗
                </button>
              </form>

              {inviteSent && (
                <p className="invite-success" role="status">
                  ✓ Invitation sent!
                </p>
              )}

              <p className="invite-footer">
                Bring your people together.
              </p>
            </div>
          </div>
        )}


      {!isOpen ? (
        <section className="chat-closed-card">
          <div className="closed-chat-icon">◉</div>
          <h2>Your conversations are waiting</h2>
          <p>Open your chat to view messages and continue talking.</p>
          <button
            type="button"
            className="black-button"
            onClick={() => setIsOpen(true)}
          >
            Open chat
          </button>
        </section>
      ) : (
        <section className="chat-panel">
          <header className="chat-panel-header">
            <div className="channel-avatar">●</div>

            <div className="channel-heading">
              <h2>Smart Community Chat</h2>
              <p>
                <span className="status-dot" />
                Channel messages
              </p>
            </div>

            <button
              type="button"
              className="outline-button"
              onClick={loadMessages}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </header>

          {error && (
            <div className="chat-error" role="alert">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <div className="chat-messages">
            {loading && messages.length === 0 ? (
              <div className="chat-empty-state">
                <div className="empty-state-icon">◌</div>
                <h3>Loading messages</h3>
                <p>Please wait while your history loads.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="chat-empty-state">
                <div className="empty-state-icon">◉</div>
                <h3>No messages yet</h3>
                <p>Start a conversation with your community.</p>
              </div>
            ) : (
              messages.map((message) => {
                const mine = isMyMessage(message);

                return (
                  <div
                    key={message.id}
                    className={`message-row ${
                      mine ? "my-row" : "their-row"
                    }`}
                  >
                    <div className="message-bubble">
                      <strong className="message-sender">
                        {mine
                          ? "You"
                          : message.senderName || "Community member"}
                      </strong>

                      <p>{message.content}</p>

                      <div className="message-meta">
                        <small>
                          {formatTime(
                            message.createdAt || message.updatedAt
                          )}
                        </small>

                        <button
                          type="button"
                          className="delete-message"
                          onClick={() =>
                            deleteMessageLocally(message.id)
                          }
                        >
                          Hide
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            className="chat-input-area"
            onSubmit={sendMessage}
          >
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Write a message..."
              aria-label="Write a message"
              disabled={sending}
            />

            <button
              type="submit"
              className="send-button"
              disabled={sending || !text.trim()}
            >
              {sending ? "Sending..." : "Send ↑"}
            </button>
          </form>

          <p className="chat-footer-note">
            Be kind. Build stronger communities.
          </p>
        </section>
      )}
    </main>
  </div>
);

}
