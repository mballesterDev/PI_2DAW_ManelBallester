import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const GRADE_THRESHOLDS = {
  A: { min: 90, text: "A (Distinction)" },
  B: { min: 80, text: "B (Merit)" },
  C: { min: 60, text: "C (Pass)" },
};

function getGrade(percentage) {
  if (percentage >= GRADE_THRESHOLDS.A.min) return GRADE_THRESHOLDS.A;
  if (percentage >= GRADE_THRESHOLDS.B.min) return GRADE_THRESHOLDS.B;
  if (percentage >= GRADE_THRESHOLDS.C.min) return GRADE_THRESHOLDS.C;
  return { min: 0, text: "Fail" };
}

function scoreColor(score, max) {
  if (!score || max === 0) return "text-gray-500";
  return score / max >= 0.5 ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
}

function formatScore(score, max) {
  if (score === null || score === undefined || max === 0) return "No data";
  return `${score.toFixed(1)} / ${max}`;
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
  const [selectedLevel, setSelectedLevel] = useState("all");

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

  // Calcular nota global para un nivel específico de un usuario
  const calculateGlobalScore = (levelData) => {
    let totalPercentage = 0;
    let validSections = 0;
    
    for (const [section, sectionData] of Object.entries(levelData)) {
      const score = sectionData.score;
      const max = sectionData.max_score;
      if (score !== undefined && max > 0) {
        const percentage = (score / max) * 100;
        totalPercentage += percentage;
        validSections++;
      }
    }
    
    if (validSections === 0) return null;
    
    const globalPercentage = totalPercentage / validSections;
    const gradeInfo = getGrade(globalPercentage);
    
    return {
      percentage: globalPercentage.toFixed(1),
      grade: gradeInfo.text,
      isPass: globalPercentage >= 60
    };
  };

  // Filtrar usuarios por nombre
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

          {/* Filtro y selector de nivel */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="🔍 Filter by username..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            >
              <option value="all">All Levels</option>
              <option value="B1">Level B1</option>
              <option value="B2">Level B2</option>
              <option value="C1">Level C1</option>
              <option value="C2">Level C2</option>
            </select>
          </div>

          {filteredData.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500">No scores available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((member) => {
                // Obtener los niveles del usuario (scores_by_level es un objeto)
                const userLevels = member.scores_by_level || {};
                const availableLevels = Object.keys(userLevels);
                const hasResults = availableLevels.length > 0;
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
                        <div className="p-4 pt-0 space-y-6">
                          {availableLevels.map((level) => {
                            // Si hay un filtro de nivel, solo mostrar ese nivel
                            if (selectedLevel !== "all" && level !== selectedLevel) return null;
                            
                            const levelData = userLevels[level];
                            const globalScore = calculateGlobalScore(levelData);
                            
                            return (
                              <div key={level} className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 border-b border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                      <span className="text-xl">📚</span>
                                      Level {level}
                                    </h3>
                                    {globalScore && (
                                      <div className={`px-3 py-1 rounded-lg text-center ${
                                        globalScore.isPass ? 'bg-green-100' : 'bg-red-100'
                                      }`}>
                                        <div className={`text-sm font-bold ${globalScore.isPass ? 'text-green-700' : 'text-red-700'}`}>
                                          {globalScore.percentage}%
                                        </div>
                                        <div className={`text-xs font-semibold ${globalScore.isPass ? 'text-green-600' : 'text-red-600'}`}>
                                          {globalScore.grade}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="p-4 space-y-4">
                                  {Object.entries(levelData).map(([sectionName, sectionData]) => {
                                    const sectionScore = sectionData.score;
                                    const sectionMax = sectionData.max_score;
                                    const passedSection = sectionMax > 0 ? sectionScore / sectionMax >= 0.5 : false;

                                    return (
                                      <div key={sectionName} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="flex justify-between items-center mb-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xl">
                                              {sectionName === "reading" && "📖"}
                                              {sectionName === "listening" && "🎧"}
                                              {sectionName === "writing" && "✍️"}
                                              {sectionName === "speaking" && "🎙️"}
                                              {sectionName === "use_of_english" && "📝"}
                                            </span>
                                            <h4 className="text-md font-bold text-gray-800 capitalize">
                                              {sectionName.replace("_", " ")}
                                            </h4>
                                          </div>
                                          <div className="text-right">
                                            <span className={`text-sm font-bold ${scoreColor(sectionScore, sectionMax)}`}>
                                              {formatScore(sectionScore, sectionMax)}
                                            </span>
                                            <span className="ml-2">
                                              {passedSection ? "✅" : "❌"}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                          <div 
                                            className={`h-2 rounded-full transition-all duration-500 ${passedSection ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${sectionMax > 0 ? (sectionScore / sectionMax) * 100 : 0}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
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