import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

function Layout({ children }) {
  const { currentUser } = useAuth();

  return (
    <div className="app-layout">
      <Navbar />

      <div className="layout-body">
        {currentUser && <Sidebar />}

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;