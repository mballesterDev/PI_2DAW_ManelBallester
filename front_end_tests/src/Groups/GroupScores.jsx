import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const maxScoresBySection = {
  reading: 62,
  listening: 30,
  writing: 20,
  speaking: 20,
};

const maxScoresByPart = {
  reading: { 1: 8, 2: 8, 3: 8, 4: 12, 5: 12, 6: 8, 7: 6 },
  listening: { 1: 6, 2: 8, 3: 6, 4: 10 },
  writing: { 1: 10, 2: 10 },
  speaking: { 1: 10, 2: 10 },
};

function scoreColor(score, max) {
  if (!score || max === 0) return "text-gray-500";
  return score / max >= 0.6 ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
}

function formatScore(score, max) {
  if (score === null || score === undefined || max === 0) return "No data";
  return `${score.toFixed(2)} / ${max}`;
}

export default function GroupScores() {
  const { group_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const groupName = location.state?.groupName || `Group #${group_id}`;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUsers, setOpenUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [addUserMessage, setAddUserMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authorized");
      setLoading(false);
      return;
    }

    fetch(`https://manelgram112.pythonanywhere.com/api/groups/${group_id}/scores/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Error loading data");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [group_id]);

  const toggleUser = (username) => {
    setOpenUsers((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    );
  };

  const handleAddUser = () => {
    const token = localStorage.getItem("token");
    if (!newUsername.trim()) return;

    fetch(`https://manelgram112.pythonanywhere.com/api/groups/${group_id}/add-user/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ username: newUsername }),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          setAddUserMessage(`✅ ${data.success}`);
          setNewUsername("");
          setLoading(true);
          fetch(`https://manelgram112.pythonanywhere.com/api/groups/${group_id}/scores/`, {
            headers: { Authorization: `Token ${token}` },
          })
            .then((res) => res.json())
            .then((json) => {
              setData(json);
              setLoading(false);
            });
        } else {
          setAddUserMessage(`❌ ${data.error}`);
        }
      })
      .catch(() => setAddUserMessage("❌ Error adding user"));
  };

  const filteredData =
    data?.filter((member) =>
      member.username.toLowerCase().includes(searchUser.toLowerCase())
    ) || [];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-3 text-gray-500 text-base">Loading data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
          <span className="text-3xl mb-2 block">⚠️</span>
          <p className="text-red-600 text-sm font-medium">Error: {error}</p>
        </div>
      </div>
    );

  return (
    <div className="flex justify-center items-start min-h-screen pt-12 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              <span className="text-lg">←</span>
            </button>
            <h1 className="text-xl font-bold text-white tracking-wide flex-1 text-center">
              Scores for {groupName}
            </h1>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Añadir usuario */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="text"
              placeholder="Username to add"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
            <button
              onClick={handleAddUser}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              + Add User
            </button>
          </div>
          {addUserMessage && (
            <p className="mb-4 text-sm text-center">{addUserMessage}</p>
          )}

          {/* Filtro */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Filter by username..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>

          {filteredData.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500">No scores available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((member) => {
                const hasResults = member.sections && Object.keys(member.sections).length > 0;
                const isOpen = openUsers.includes(member.username);

                return (
                  <div
                    key={member.username}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    <div
                      onClick={() => hasResults && toggleUser(member.username)}
                      className={`flex justify-between items-center p-4 ${
                        hasResults ? "cursor-pointer hover:bg-gray-50 transition-colors" : "cursor-default"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👤</span>
                        <h3 className="text-lg font-bold text-gray-800">
                          {member.username}
                        </h3>
                      </div>
                      {hasResults && (
                        <span className="text-gray-400 text-lg">
                          {isOpen ? "▲" : "▼"}
                        </span>
                      )}
                    </div>

                    {!hasResults && (
                      <p className="text-sm text-gray-400 italic px-4 pb-4">
                        No results recorded.
                      </p>
                    )}

                    {hasResults && (
                      <div
                        className={`overflow-hidden transition-all duration-500 ${
                          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-4 pt-0 space-y-4">
                          {Object.entries(member.sections).map(([sectionName, sectionData]) => {
                            const sectionScore = sectionData?.score ?? null;
                            const sectionMax = maxScoresBySection[sectionName.toLowerCase()] ?? 0;

                            return (
                              <div
                                key={sectionName}
                                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                              >
                                <h4 className="text-md font-bold text-gray-800 mb-3 flex items-center justify-between">
                                  <span className="capitalize flex items-center gap-2">
                                    {sectionName === "reading" && "📖"}
                                    {sectionName === "listening" && "🎧"}
                                    {sectionName === "writing" && "✍️"}
                                    {sectionName === "speaking" && "🎙️"}
                                    {sectionName}
                                  </span>
                                  <span className={scoreColor(sectionScore, sectionMax)}>
                                    {formatScore(sectionScore, sectionMax)}
                                  </span>
                                </h4>

                                <ul className="space-y-2">
                                  {sectionData?.parts ? (
                                    Object.entries(sectionData.parts).map(([part, partData]) => {
                                      const partScore = partData?.score ?? null;
                                      const partMax = maxScoresByPart[sectionName.toLowerCase()]?.[part] ?? 0;
                                      const passed = partScore / partMax >= 0.6;

                                      return (
                                        <li key={part} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                                          <span className="text-sm text-gray-600">
                                            Part {part}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className={scoreColor(partScore, partMax)}>
                                              {partScore?.toFixed(2) ?? "0.00"} / {partMax}
                                            </span>
                                            <span className="text-base">
                                              {passed ? "✅" : "❌"}
                                            </span>
                                          </div>
                                        </li>
                                      );
                                    })
                                  ) : (
                                    <p className="text-xs text-gray-400 italic">No parts recorded.</p>
                                  )}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}