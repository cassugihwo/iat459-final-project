import { timeAgo, getInitials } from "./Utils";
import "./css/Dashboard.css";

export default function AdminDashboard({
  content,
  members,
  suspendedCount,
  recentRecipes,
  setView,
  VIEWS,
}) {
  const newUsers = [...members]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="admin-dashboard">
      <div className="admin-stats">
        <div className="stat-card" onClick={() => setView(VIEWS.RECIPES)}>
          <div className="stat-label">Total recipes</div>
          <div className="stat-value">{content.length.toLocaleString()}</div>
        </div>

        <div className="stat-card" onClick={() => setView(VIEWS.MEMBERS)}>
          <div className="stat-label">Total members</div>
          <div className="stat-value">{members.length.toLocaleString()}</div>
        </div>

        <div className="stat-card" onClick={() => setView(VIEWS.SUSPENDED)}>
          <div className="stat-label">Suspended</div>
          <div className="stat-value">{suspendedCount}</div>
          {suspendedCount > 0 && (
            <div className="stat-note red">Needs action</div>
          )}
        </div>

        <div className="stat-card" onClick={() => setView(VIEWS.ADMINS)}>
          <div className="stat-label">Admins</div>
          <div className="stat-value">
            {members.filter((m) => m.role === "admin").length}
          </div>
        </div>
      </div>

      <div className="admin-panels">
        <div className="admin-panel">
          <div className="panel-header">
            <span>New Members</span>
            <button
              className="view-all-btn"
              onClick={() => setView(VIEWS.MEMBERS)}
            >
              View all
            </button>
          </div>
          <table className="admin-table">
            <colgroup>
              <col className="dash-col-user" />
              <col className="dash-col-role" />
              <col className="dash-col-joined" />
            </colgroup>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {newUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-row">
                    No members yet
                  </td>
                </tr>
              ) : (
                newUsers.map((m) => (
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
                    <td className="muted">{timeAgo(m.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-panel">
          <div className="panel-header">
            <span>Suspended Members</span>
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

      <div className="admin-panel dash-full-panel">
        <div className="panel-header">
          <span>Recent Recipe Submissions</span>
          <button
            className="view-all-btn"
            onClick={() => setView(VIEWS.RECIPES)}
          >
            View all
          </button>
        </div>
        <table className="admin-table">
          <colgroup>
            <col className="dash-col-recipe" />
            <col className="dash-col-owner" />
            <col className="dash-col-when" />
          </colgroup>
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
    </div>
  );
}
