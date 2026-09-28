import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const isStaff = user?.role === "Admin" || user?.role === "ITEngineer";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          IT<span>Agent</span>
        </div>
        <NavLink to="/chat" className={({ isActive }) => (isActive ? "active" : "")}>
          Help Desk Chat
        </NavLink>
        <NavLink to="/tickets" className={({ isActive }) => (isActive ? "active" : "")}>
          {isStaff ? "All Tickets" : "My Tickets"}
        </NavLink>

        <div className="user-box">
          <div style={{ color: "#fff", fontWeight: 600, marginBottom: 2 }}>{user?.name}</div>
          <div>{user?.role}</div>
          <button className="navlink" style={{ marginTop: 10, padding: "6px 0" }} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
