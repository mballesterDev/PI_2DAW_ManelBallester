import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setGroups([]);
      setLoading(false);
      return;
    }

    fetch("https://manelgram112.pythonanywhere.com/api/groups/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching groups");
        return res.json();
      })
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [token]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    fetch("https://manelgram112.pythonanywhere.com/api/groups/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ name: groupName }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error creating group");
        return res.json();
      })
      .then((newGroup) => {
        setGroups((prev) => [...prev, newGroup]);
        setGroupName("");
      })
      .catch(console.error);
  };

  const goToGroupScores = (id, name) => {
    navigate(`/groups/${id}/scores`, { state: { groupName: name } });
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center max-w-md">
          <span className="text-3xl mb-2 block">🔒</span>
          <p className="text-yellow-700 text-sm font-medium">Please login to access groups.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen pt-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header blanco con borde inferior */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              <span className="text-lg">←</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800 tracking-wide flex-1 text-center">
              My Groups
            </h1>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-2 text-gray-500 text-sm">Loading groups...</p>
              </div>
            </div>
          ) : groups.length > 0 ? (
            <ul className="space-y-3 mb-6">
              {groups.map((group) => (
                <li
                  key={group.id}
                  onClick={() => goToGroupScores(group.id, group.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goToGroupScores(group.id, group.name);
                  }}
                  className="group bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👥</span>
                      <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {group.name}
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center mb-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500">You don't have any groups yet.</p>
            </div>
          )}

          {/* Crear nuevo grupo */}
          <div className="border-t border-gray-200 pt-5 mt-2">
            <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-lg">✨</span> Create a New Group
            </h3>
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateGroup;