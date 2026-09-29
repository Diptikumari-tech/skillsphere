import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Matches.css";

function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/requests");
      if (res.data && res.data.success) {
        setIncoming(res.data.incoming || []);
        setOutgoing(res.data.outgoing || []);
      }
    } catch (err) {
      console.error("Error loading requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResponse = async (requestId, status) => {
    try {
      setProcessingId(requestId);
      setMessage("");

      const res = await api.put(`/requests/${requestId}`, { status });
      if (res.data && res.data.success) {
        setMessage(res.data.message);
        if (status === "accepted" && res.data.chatId) {
          navigate(`/chat/${res.data.chatId}`);
        } else {
          fetchRequests();
        }
      }
    } catch (err) {
      console.error("Error processing request:", err);
      setMessage(err.response?.data?.message || "Failed to update request");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading requests...</div>;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem" }}>
      <h2>Skill Swap Requests 📨</h2>
      <p style={{ color: "#64748b" }}>Manage incoming invitations and your sent requests.</p>

      {message && (
        <div style={{ padding: "0.75rem 1rem", background: "#e0e7ff", color: "#3730a3", borderRadius: "8px", marginBottom: "1rem" }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <h3>Incoming Requests ({incoming.length})</h3>
        {incoming.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No pending incoming requests.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
            {incoming.map((req) => (
              <div key={req._id} style={{ background: "white", padding: "1.2rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: 0 }}>From: {req.sender?.name}</h4>
                  <p style={{ margin: "0.25rem 0", color: "#475569", fontSize: "0.9rem" }}>
                    Wants to trade <strong>{req.offeredSkill}</strong> for <strong>{req.wantedSkill}</strong>
                  </p>
                  {req.note && <small style={{ color: "#64748b" }}>"{req.note}"</small>}
                </div>
                {req.status === "pending" ? (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleResponse(req._id, "accepted")}
                      disabled={processingId === req._id}
                      style={{ padding: "0.5rem 1rem", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Accept & Chat
                    </button>
                    <button
                      onClick={() => handleResponse(req._id, "rejected")}
                      disabled={processingId === req._id}
                      style={{ padding: "0.5rem 1rem", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <span style={{ fontWeight: "bold", textTransform: "capitalize", color: req.status === "accepted" ? "#10b981" : "#ef4444" }}>
                    {req.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3>Sent Requests ({outgoing.length})</h3>
        {outgoing.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No sent requests.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
            {outgoing.map((req) => (
              <div key={req._id} style={{ background: "white", padding: "1.2rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: 0 }}>To: {req.receiver?.name}</h4>
                  <p style={{ margin: "0.25rem 0", color: "#475569", fontSize: "0.9rem" }}>
                    Offering <strong>{req.offeredSkill}</strong> for <strong>{req.wantedSkill}</strong>
                  </p>
                </div>
                <span style={{ padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold", background: req.status === "pending" ? "#fef3c7" : req.status === "accepted" ? "#dcfce7" : "#fee2e2" }}>
                  {req.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Requests;