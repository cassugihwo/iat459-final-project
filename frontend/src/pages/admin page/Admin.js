import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import logo from "assets/logo/logo-noslogan-light.png";
import ConfirmDeleteForm from "components/confirm/ConfirmDeleteForm";
import "./Admin.css";

// Admin console for managing users and content
const VIEWS = {
  DASHBOARD: "dashboard",
  RECIPES: "recipes",
  MEMBERS: "members",
  SUSPENDED: "suspended",
};

// Helper to format time since a date (e.g. "5m ago")
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Simple initials generator for user avatars
function getInitials(username = "") {
  return username.slice(0, 2).toUpperCase();
}

export default function Admin() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [members, setMembers] = useState([]);
  const [content, setContent] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); 
  useEffect(() => {
    Promise.all([fetchMembers(), fetchContent()]).finally(() =>
      setLoading(false),
    );
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps


// Fetch all members from the server
  async function fetchMembers() {
    try {
      const res = await fetch("http://localhost:5001/api/admin/members", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setMembers([]);
    }
  }

  // Fetch all user-submitted recipes from the server
  async function fetchContent() {
    try {
      const res = await fetch("http://localhost:5001/api/admin/content", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setContent(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch content:", error);
      setContent([]);
    }
  }
// Suspend or unsuspend a user
  async function suspendUser(id, isSuspended) {
    try {
      const action = isSuspended ? "unsuspend" : "suspend";

      const res = await fetch(
        `http://localhost:5001/api/admin/members/${id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to ${action} user.`);
      }

      await fetchMembers();

      if (isSuspended && view === VIEWS.SUSPENDED) {
        setView(VIEWS.MEMBERS);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }
// Change a user's role between admin and user
  async function changeRole(id, currentRole) {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      if (!window.confirm(`Change this user's role to ${newRole}?`)) return;

      const res = await fetch(
        `http://localhost:5001/api/admin/members/${id}/role`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to change role.");
      }

      await fetchMembers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  // Permanently delete a user and all their content
  async function deleteUser(id) {
    try {
      const res = await fetch(`http://localhost:5001/api/admin/members/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete user.");

      await fetchMembers();
      await fetchContent();
      setConfirmDelete(null);

      if (view === VIEWS.SUSPENDED) setView(VIEWS.MEMBERS);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  // Permanently delete a user-submitted recipe
  async function deleteRecipe(id) {
    try {
      const res = await fetch(`http://localhost:5001/api/admin/content/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete recipe.");

      await fetchContent();
      setConfirmDelete(null);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  const suspendedCount = members.filter((m) => m.isSuspended).length;
  const recentRecipes = [...content].slice(0, 5);

  const filteredMembers = members.filter(
    (m) =>
      m.username?.toLowerCase().includes(search.toLowerCase()) ||
      m.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      m.lastName?.toLowerCase().includes(search.toLowerCase()),
  );

// Only show suspended members in the Suspended view
  const filteredSuspendedMembers = members.filter(
    (m) =>
      m.isSuspended &&
      (m.username?.toLowerCase().includes(search.toLowerCase()) ||
        m.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        m.lastName?.toLowerCase().includes(search.toLowerCase())),
  );

  const filteredRecipes = content.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.owner?.username?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src={logo} alt="YumMeal" className="admin-brand-logo" />
          <span className="admin-brand-sub">Admin Console</span>
          <span className="admin-role-badge">
            {user?.role === "admin" ? "SuperAdmin" : user?.role}
          </span>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section-label">Overview</div>
          <button
            className={`admin-nav-item ${view === VIEWS.DASHBOARD ? "active" : ""}`}
            onClick={() => setView(VIEWS.DASHBOARD)}
          >
            Dashboard
          </button>

          <div className="admin-nav-section-label">Content</div>
          <button
            className={`admin-nav-item ${view === VIEWS.RECIPES ? "active" : ""}`}
            onClick={() => setView(VIEWS.RECIPES)}
          >
            All Recipes
            <span className="admin-nav-badge">{content.length}</span>
          </button>

          <div className="admin-nav-section-label">Members</div>
          <button
            className={`admin-nav-item ${view === VIEWS.MEMBERS ? "active" : ""}`}
            onClick={() => setView(VIEWS.MEMBERS)}
          >
            All Members
            <span className="admin-nav-badge">{members.length}</span>
          </button>

          <button
            className={`admin-nav-item ${view === VIEWS.SUSPENDED ? "active" : ""}`}
            onClick={() => setView(VIEWS.SUSPENDED)}
          >
            Suspended
            <span className="admin-nav-badge red">{suspendedCount}</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-avatar">{getInitials(user?.username)}</div>
          <div className="admin-footer-info">
            <div className="admin-footer-name">{user?.username}</div>
            <div className="admin-footer-role">Super Admin</div>
          </div>
          <button
            className="admin-logout-btn"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {view === VIEWS.DASHBOARD && "Dashboard"}
              {view === VIEWS.RECIPES && "All Recipes"}
              {view === VIEWS.MEMBERS && "All Members"}
              {view === VIEWS.SUSPENDED && "Suspended Members"}
            </h1>
            <p className="admin-page-sub">
              {view === VIEWS.DASHBOARD && "Overview of all platform activity"}
              {view === VIEWS.RECIPES && "Manage user-submitted recipes"}
              {view === VIEWS.MEMBERS && "Manage registered members"}
              {view === VIEWS.SUSPENDED && "Manage suspended accounts"}
            </p>
          </div>

          <div className="admin-search-wrap">
            <span className="admin-search-icon">🔍</span>
            <input
              className="admin-search"
              placeholder="Search anything..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="admin-loading">Loading...</p>
        ) : (
          <>
            {view === VIEWS.DASHBOARD && (
              <div className="admin-dashboard">
                <div className="admin-stats">
                  <div className="stat-card">
                    <div className="stat-label">Total recipes</div>
                    <div className="stat-value">{content.length.toLocaleString()}</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-label">Total members</div>
                    <div className="stat-value">{members.length.toLocaleString()}</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-label">Suspended</div>
                    <div className="stat-value">{suspendedCount}</div>
                    {suspendedCount > 0 && (
                      <div className="stat-note red">Needs action</div>
                    )}
                  </div>

                  <div className="stat-card">
                    <div className="stat-label">Admins</div>
                    <div className="stat-value">
                      {members.filter((m) => m.role === "admin").length}
                    </div>
                  </div>
                </div>

                <div className="admin-panels">
                  <div className="admin-panel">
                    <div className="panel-header">
                      <span>Recent recipe submissions</span>
                      <button
                        className="view-all-btn"
                        onClick={() => setView(VIEWS.RECIPES)}
                      >
                        View all
                      </button>
                    </div>

                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Recipe</th>
                          <th>Submitted by</th>
                          <th>When</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRecipes.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="empty-row">
                              No recipes yet
                            </td>
                          </tr>
                        ) : (
                          recentRecipes.map((r) => (
                            <tr key={r._id}>
                              <td className="recipe-name-cell">{r.name}</td>
                              <td>@{r.owner?.username || "unknown"}</td>
                              <td className="muted">{timeAgo(r.createdAt)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-header">
                      <span>Suspended members</span>
                      <button
                        className="view-all-btn"
                        onClick={() => setView(VIEWS.SUSPENDED)}
                      >
                        View all
                      </button>
                    </div>

                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.filter((m) => m.isSuspended).length === 0 ? (
                          <tr>
                            <td colSpan={2} className="empty-row">
                              No suspended members
                            </td>
                          </tr>
                        ) : (
                          members
                            .filter((m) => m.isSuspended)
                            .map((m) => (
                              <tr key={m._id}>
                                <td>
                                  <div className="member-cell">
                                    <div className="member-avatar sm">
                                      {getInitials(m.username)}
                                    </div>
                                    <div>
                                      <div className="member-name">{m.username}</div>
                                      <div className="member-sub muted">
                                        {m.firstName} {m.lastName}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${m.role}`}>{m.role}</span>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {view === VIEWS.RECIPES && (
              <div className="admin-panel full">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Recipe</th>
                      <th>Owner</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecipes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty-row">
                          No recipes found
                        </td>
                      </tr>
                    ) : (
                      filteredRecipes.map((r) => (
                        <tr key={r._id}>
                          <td className="recipe-name-cell">{r.name}</td>
                          <td>@{r.owner?.username || "unknown"}</td>
                          <td className="muted">{timeAgo(r.createdAt)}</td>
                          <td className="actions-cell">
                            <button
                              className="action-btn view"
                              onClick={() => setSelectedRecipe(r)}
                            >
                              View
                            </button>
                            <button
                              className="action-btn danger"
                              onClick={() => setConfirmDelete({ id: r._id, name: r.name, type: "recipe" })}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {view === VIEWS.MEMBERS && (
              <div className="admin-panel full">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-row">
                          No members found
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((m) => (
                        <tr key={m._id}>
                          <td>
                            <div className="member-cell">
                              <div className="member-avatar sm">
                                {getInitials(m.username)}
                              </div>
                              <div>
                                <div className="member-name">{m.username}</div>
                                <div className="member-sub muted">
                                  {m.firstName} {m.lastName}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className={`badge ${m.role}`}>{m.role}</span>
                          </td>

                          <td>
                            <span
                              className={`badge ${m.isSuspended ? "suspended" : "active"}`}
                            >
                              {m.isSuspended ? "Suspended" : "Active"}
                            </span>
                          </td>

                          <td className="muted">{timeAgo(m.createdAt)}</td>

                          <td className="actions-cell">
                            <button
                              className={`action-btn ${m.role === "admin" ? "demote" : "promote"}`}
                              onClick={() => changeRole(m._id, m.role)}
                            >
                              {m.role === "admin" ? "Demote" : "Make Admin"}
                            </button>

                            <button
                              className={`action-btn ${m.isSuspended ? "unsuspend" : "suspend"}`}
                              onClick={() => suspendUser(m._id, m.isSuspended)}
                            >
                              {m.isSuspended ? "Unsuspend" : "Suspend"}
                            </button>

                            <button
                              className="action-btn danger"
                              onClick={() => setConfirmDelete({ id: m._id, name: m.username, type: "user" })}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {view === VIEWS.SUSPENDED && (
              <div className="admin-panel full">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuspendedMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-row">
                          No suspended members found
                        </td>
                      </tr>
                    ) : (
                      filteredSuspendedMembers.map((m) => (
                        <tr key={m._id}>
                          <td>
                            <div className="member-cell">
                              <div className="member-avatar sm">
                                {getInitials(m.username)}
                              </div>
                              <div>
                                <div className="member-name">{m.username}</div>
                                <div className="member-sub muted">
                                  {m.firstName} {m.lastName}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className={`badge ${m.role}`}>{m.role}</span>
                          </td>

                          <td>
                            <span className="badge suspended">Suspended</span>
                          </td>

                          <td className="muted">{timeAgo(m.createdAt)}</td>

                          <td className="actions-cell">
                            <button
                              className={`action-btn ${m.role === "admin" ? "demote" : "promote"}`}
                              onClick={() => changeRole(m._id, m.role)}
                            >
                              {m.role === "admin" ? "Demote" : "Make Admin"}
                            </button>

                            <button
                              className="action-btn unsuspend"
                              onClick={() => suspendUser(m._id, m.isSuspended)}
                            >
                              Unsuspend
                            </button>

                            <button
                              className="action-btn danger"
                              onClick={() => setConfirmDelete({ id: m._id, name: m.username, type: "user" })}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteForm
          title={confirmDelete.type === "recipe" ? "Delete Recipe" : "Delete Account"}
          message={
            confirmDelete.type === "recipe"
              ? <>Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This cannot be undone.</>
              : <>Are you sure you want to delete <strong>@{confirmDelete.name}</strong>? This will also remove all their recipes and cannot be undone.</>
          }
          onConfirm={() =>
            confirmDelete.type === "recipe"
              ? deleteRecipe(confirmDelete.id)
              : deleteUser(confirmDelete.id)
          }
          onCancel={() => setConfirmDelete(null)}
        />
      )}

    </div>
  );
}

function parseRecipe(recipe) {
  const lines = (recipe.instructions || "").split("\n");
  const metaLine = lines[0] || "";
  const servesMatch = metaLine.match(/Serves:\s*(\d+)/);
  const cookMatch = metaLine.match(/Cook:\s*(\d+)\s*min/);
  const tagMatch = metaLine.match(/Tags:\s*([^|]+)/);
  const serves = servesMatch ? servesMatch[1] : null;
  const cookTime = cookMatch ? cookMatch[1] : null;
  const tags = tagMatch ? tagMatch[1].split(",").map((t) => t.trim()).filter(Boolean) : [];
  const steps = lines.slice(2).map((l) => l.trim()).filter(Boolean);
  const ingredients = (recipe.ingredients || "").split(",").map((i) => i.trim()).filter(Boolean);
  return { serves, cookTime, tags, steps, ingredients };
}

function RecipeDetailModal({ recipe, onClose }) {
  const parsed = parseRecipe(recipe);
  const createdDate = recipe.createdAt
    ? new Date(recipe.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">{recipe.name}</h2>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>

        {recipe.image
          ? <img src={recipe.image} alt={recipe.name} className="admin-modal-img" />
          : <div className="admin-modal-img-placeholder"><span>No image</span></div>
        }

        <div className="admin-modal-meta">
          <span className={`badge ${recipe.isPublic ? "active" : "suspended"}`}>
            {recipe.isPublic ? "Public" : "Private"}
          </span>
          {parsed.serves && <span className="admin-modal-chip">Serves {parsed.serves}</span>}
          {parsed.cookTime && <span className="admin-modal-chip">{parsed.cookTime} min</span>}
          {parsed.tags.map((t) => <span key={t} className="admin-modal-chip">{t}</span>)}
        </div>

        <div className="admin-modal-owner">
          <strong>@{recipe.owner?.username || "unknown"}</strong>
          <span className="muted"> · {createdDate}</span>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-section">
            <h3>Ingredients</h3>
            <ul className="admin-modal-list">
              {parsed.ingredients.length === 0
                ? <li className="muted">No ingredients listed.</li>
                : parsed.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </div>

          <div className="admin-modal-section">
            <h3>Instructions</h3>
            {parsed.steps.length === 0
              ? <p className="muted">No instructions provided.</p>
              : parsed.steps.map((step, i) => (
                <div key={i} className="admin-modal-step">
                  <span className="admin-modal-step-num">{i + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}