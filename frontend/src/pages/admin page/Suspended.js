import { timeAgo, getInitials } from "./Utils";
import "./css/Suspended.css";

export default function AdminSuspended({
  filteredSuspendedMembers,
  setPendingAction,
  changeRole,
  suspendUser,
  deleteUser,
}) {
  return (
    <div className="admin-panel full">
      <table className="admin-table members-table">
        <colgroup>
          <col className="suspended-col-member" />
          <col className="suspended-col-role" />
          <col className="suspended-col-status" />
          <col className="suspended-col-joined" />
          <col className="suspended-col-actions" />
        </colgroup>
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
                    onClick={() =>
                      setPendingAction({
                        title:
                          m.role === "admin"
                            ? "Demote to Member"
                            : "Make Admin",
                        message:
                          m.role === "admin" ? (
                            <>
                              Demote <strong>@{m.username}</strong> from admin
                              to regular member?
                            </>
                          ) : (
                            <>
                              Give <strong>@{m.username}</strong> admin
                              privileges?
                            </>
                          ),
                        confirmLabel:
                          m.role === "admin" ? "Demote" : "Make Admin",
                        onConfirm: () => changeRole(m._id, m.role),
                      })
                    }
                  >
                    {m.role === "admin" ? "Demote" : "Make Admin"}
                  </button>

                  <button
                    className="action-btn unsuspend"
                    onClick={() =>
                      setPendingAction({
                        title: "Unsuspend User",
                        message: (
                          <>
                            Unsuspend <strong>@{m.username}</strong>? They will
                            regain access to the platform.
                          </>
                        ),
                        confirmLabel: "Unsuspend",
                        onConfirm: () => suspendUser(m._id, m.isSuspended),
                      })
                    }
                  >
                    Unsuspend
                  </button>

                  <button
                    className="action-btn danger"
                    onClick={() =>
                      setPendingAction({
                        title: "Delete Account",
                        message: (
                          <>
                            Permanently delete <strong>@{m.username}</strong>?
                            This will also remove all their recipes and cannot
                            be undone.
                          </>
                        ),
                        confirmLabel: "Delete",
                        onConfirm: () => deleteUser(m._id),
                      })
                    }
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
  );
}
