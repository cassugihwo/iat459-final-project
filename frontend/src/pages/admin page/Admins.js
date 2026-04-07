import { timeAgo, getInitials } from "./Utils";
import "./css/Admins.css";

export default function AdminAdmins({
  filteredAdmins,
  setPendingAction,
  changeRole,
  suspendUser,
  deleteUser,
}) {
  return (
    <div className="admin-panel full">
      <table className="admin-table members-table">
        <colgroup>
          <col className="admins-col-member" />
          <col className="admins-col-role" />
          <col className="admins-col-status" />
          <col className="admins-col-joined" />
          <col className="admins-col-actions" />
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
          {filteredAdmins.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-row">
                No admins found
              </td>
            </tr>
          ) : (
            filteredAdmins.map((m) => (
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
                    className="action-btn demote"
                    onClick={() =>
                      setPendingAction({
                        title: "Demote to Member",
                        message: (
                          <>
                            Demote <strong>@{m.username}</strong> from admin to
                            regular member?
                          </>
                        ),
                        confirmLabel: "Demote",
                        onConfirm: () => changeRole(m._id, m.role),
                      })
                    }
                  >
                    Demote
                  </button>

                  <button
                    className={`action-btn ${m.isSuspended ? "unsuspend" : "suspend"}`}
                    onClick={() =>
                      setPendingAction({
                        title: m.isSuspended
                          ? "Unsuspend User"
                          : "Suspend User",
                        message: m.isSuspended ? (
                          <>
                            Unsuspend <strong>@{m.username}</strong>? They will
                            regain access to the platform.
                          </>
                        ) : (
                          <>
                            Suspend <strong>@{m.username}</strong>? They will
                            lose access to the platform.
                          </>
                        ),
                        confirmLabel: m.isSuspended ? "Unsuspend" : "Suspend",
                        onConfirm: () => suspendUser(m._id, m.isSuspended),
                      })
                    }
                  >
                    {m.isSuspended ? "Unsuspend" : "Suspend"}
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
