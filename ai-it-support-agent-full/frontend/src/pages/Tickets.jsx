import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import Layout from "../components/Layout";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export default function Tickets() {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isStaff = user?.role === "Admin" || user?.role === "ITEngineer";

  async function load() {
    setLoading(true);
    try {
      const data = await api.listTickets(token);
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStatusChange(ticketId, status) {
    try {
      await api.updateTicket(token, ticketId, { status });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Layout>
      <h1 className="page-title">{isStaff ? "All Tickets" : "My Tickets"}</h1>
      <p className="page-sub">
        {isStaff
          ? "Tickets auto-created by the chatbot, classified by priority and category."
          : "Tickets raised from your chat conversations."}
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">No tickets yet. Ask the chatbot something it can't solve to see one appear here.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                {isStaff && <th>Employee</th>}
                <th>Bulk Incident</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id}>
                  <td>{t.title}</td>
                  <td>{t.category}</td>
                  <td><span className={`badge ${t.priority}`}>{t.priority}</span></td>
                  {isStaff && <td>{t.employee?.name}</td>}
                  <td>{t.bulkIncident ? t.bulkIncident.title : "—"}</td>
                  <td>
                    {isStaff ? (
                      <select
                        className="status-select"
                        value={t.status}
                        onChange={(e) => handleStatusChange(t._id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`badge ${t.status.replace(" ", "-")}`}>{t.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
