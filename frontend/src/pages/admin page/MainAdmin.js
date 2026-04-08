import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import "remixicon/fonts/remixicon.css";
import logo from "assets/logo/logo-noslogan-light.png";
import Confirmation from "components/confirm/Confirmation";
import { getInitials } from "./Utils";
import Dashboard from "./Dashboard";
import Recipes from "./UserRecipes";
import Members from "./Members";
import Admins from "./Admins";
import Suspended from "./Suspended";
import TeamRecipes from "./TeamRecipes";
import "./css/MainAdmin.css";

const VIEWS = {
  DASHBOARD: "dashboard",
  RECIPES: "recipes",
  TEAM_RECIPES: "team-recipes",
  MEMBERS: "members",
  ADMINS: "admins",
  SUSPENDED: "suspended",
};

export default function Admin() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [view, setViewState] = useState(
    () => localStorage.getItem("adminView") || VIEWS.DASHBOARD,
  );
  function setView(v) {
    setViewState(v);
    localStorage.setItem("adminView", v);
  }
  const [members, setMembers] = useState([]);
  const [content, setContent] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [teamRecipes, setTeamRecipes] = useState([]);

  useEffect(() => {
    Promise.all([fetchMembers(), fetchContent(), fetchTeamRecipes()]).finally(
      () => setLoading(false),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchTeamRecipes() {
    try {
      const res = await fetch("http://localhost:5001/api/team-recipes");
      const data = await res.json();
      setTeamRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch team recipes:", error);
      setTeamRecipes([]);
    }
  }

  async function deleteTeamRecipe(id) {
    try {
      const res = await fetch(`http://localhost:5001/api/team-recipes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete team recipe.");
      await fetchTeamRecipes();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

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

  async function suspendUser(id, isSuspended) {
    try {
      const action = isSuspended ? "unsuspend" : "suspend";
      const res = await fetch(
        `http://localhost:5001/api/admin/members/${id}/${action}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error(`Failed to ${action} user.`);
      await fetchMembers();
      if (isSuspended && view === VIEWS.SUSPENDED) setView(VIEWS.MEMBERS);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function changeRole(id, currentRole) {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
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
      if (!res.ok) throw new Error("Failed to change role.");
      await fetchMembers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function deleteUser(id) {
    try {
      const res = await fetch(`http://localhost:5001/api/admin/members/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user.");
      await fetchMembers();
      await fetchContent();
      setPendingAction(null);
      if (view === VIEWS.SUSPENDED) setView(VIEWS.MEMBERS);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function deleteRecipe(id) {
    try {
      const res = await fetch(`http://localhost:5001/api/admin/content/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete recipe.");
      await fetchContent();
      setPendingAction(null);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  const suspendedCount = members.filter((m) => m.isSuspended).length;
  const recentRecipes = [...content].slice(0, 5);

  function matchesSearch(m) {
    return (
      m.username?.toLowerCase().includes(search.toLowerCase()) ||
      m.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      m.lastName?.toLowerCase().includes(search.toLowerCase())
    );
  }

  const filteredMembers = members.filter(
    (m) => m.role !== "admin" && matchesSearch(m),
  );
  const filteredAdmins = members.filter(
    (m) => m.role === "admin" && matchesSearch(m),
  );
  const filteredSuspendedMembers = members.filter(
    (m) => m.isSuspended && matchesSearch(m),
  );
  const filteredRecipes = content.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.owner?.username?.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredTeamRecipes = teamRecipes.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase())),
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
            User Recipes
            <span className="admin-nav-badge">{content.length}</span>
          </button>
          <button
            className={`admin-nav-item ${view === VIEWS.TEAM_RECIPES ? "active" : ""}`}
            onClick={() => setView(VIEWS.TEAM_RECIPES)}
          >
            Team Recipes
            <span className="admin-nav-badge">{teamRecipes.length}</span>
          </button>

          <div className="admin-nav-section-label">Members</div>
          <button
            className={`admin-nav-item ${view === VIEWS.MEMBERS ? "active" : ""}`}
            onClick={() => setView(VIEWS.MEMBERS)}
          >
            All Members
            <span className="admin-nav-badge">
              {members.filter((m) => m.role !== "admin").length}
            </span>
          </button>

          <button
            className={`admin-nav-item ${view === VIEWS.ADMINS ? "active" : ""}`}
            onClick={() => setView(VIEWS.ADMINS)}
          >
            All Admins
            <span className="admin-nav-badge">
              {members.filter((m) => m.role === "admin").length}
            </span>
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
            <i className="ri-shut-down-line" />
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {view === VIEWS.DASHBOARD && "Dashboard"}
              {view === VIEWS.RECIPES && "User Recipes"}
              {view === VIEWS.TEAM_RECIPES && "Team Recipes"}
              {view === VIEWS.MEMBERS && "All Members"}
              {view === VIEWS.ADMINS && "All Admins"}
              {view === VIEWS.SUSPENDED && "Suspended Members"}
            </h1>
            <p className="admin-page-sub">
              {view === VIEWS.DASHBOARD && "Overview of all platform activity"}
              {view === VIEWS.RECIPES && "Manage user-submitted recipes"}
              {view === VIEWS.TEAM_RECIPES &&
                "Create and manage YumMeal team recipes"}
              {view === VIEWS.MEMBERS && "Manage registered members"}
              {view === VIEWS.ADMINS && "Manage admin accounts"}
              {view === VIEWS.SUSPENDED && "Manage suspended accounts"}
            </p>
          </div>

          {view !== VIEWS.DASHBOARD && (
            <div className="admin-search-wrap">
              <i className="ri-search-line admin-search-icon" />
              <input
                className="admin-search"
                placeholder="Search anything..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {loading ? (
          <p className="admin-loading">Loading...</p>
        ) : (
          <>
            {view === VIEWS.DASHBOARD && (
              <Dashboard
                content={content}
                members={members}
                suspendedCount={suspendedCount}
                recentRecipes={recentRecipes}
                setView={setView}
                VIEWS={VIEWS}
              />
            )}

            {view === VIEWS.TEAM_RECIPES && (
              <TeamRecipes
                teamRecipes={filteredTeamRecipes}
                token={token}
                onRefresh={fetchTeamRecipes}
                setPendingAction={setPendingAction}
                deleteTeamRecipe={deleteTeamRecipe}
              />
            )}

            {view === VIEWS.RECIPES && (
              <Recipes
                filteredRecipes={filteredRecipes}
                setPendingAction={setPendingAction}
                deleteRecipe={deleteRecipe}
                selectedRecipe={selectedRecipe}
                setSelectedRecipe={setSelectedRecipe}
              />
            )}

            {view === VIEWS.MEMBERS && (
              <Members
                filteredMembers={filteredMembers}
                setPendingAction={setPendingAction}
                changeRole={changeRole}
                suspendUser={suspendUser}
                deleteUser={deleteUser}
              />
            )}

            {view === VIEWS.ADMINS && (
              <Admins
                filteredAdmins={filteredAdmins}
                setPendingAction={setPendingAction}
                changeRole={changeRole}
                suspendUser={suspendUser}
                deleteUser={deleteUser}
              />
            )}

            {view === VIEWS.SUSPENDED && (
              <Suspended
                filteredSuspendedMembers={filteredSuspendedMembers}
                setPendingAction={setPendingAction}
                changeRole={changeRole}
                suspendUser={suspendUser}
                deleteUser={deleteUser}
              />
            )}
          </>
        )}
      </main>

      {pendingAction && (
        <Confirmation
          title={pendingAction.title}
          message={pendingAction.message}
          confirmLabel={pendingAction.confirmLabel}
          onConfirm={pendingAction.onConfirm}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
