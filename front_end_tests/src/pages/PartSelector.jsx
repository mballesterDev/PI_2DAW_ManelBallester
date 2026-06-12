import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PartSelector() {
  const { level, section } = useParams();
  const navigate = useNavigate();

  // Max scores by section and part
  const maxScoresBySection = {
    reading: { 1: 8, 5: 12, 6: 12, 7: 10 },
    use_of_english: { 2: 8, 3: 8, 4: 12 },
    listening: { 1: 8, 2: 10, 3: 5, 4: 7 },
    writing: { 1: 42 },
    speaking: { 1: 42 },
  };

  // Labels for each part
  const partNamesBySection = {
    reading: {
      1: "Multiple-choice cloze",
      5: "Multiple choice",
      6: "Gapped text",
      7: "Multiple matching",
    },
    use_of_english: {
      2: "Open cloze",
      3: "Word formation",
      4: "Key word transformations",
    },
    listening: {
      1: "Multiple choice – short recordings",
      2: "Matching – monologues",
      3: "Multiple choice – conversation",
      4: "Multiple choice – interview/monologue",
    },
    writing: {
      1: "Exam",
    },
    speaking: {
      1: "Exam",
    },
  };

  // Emojis for each section
  const sectionEmojis = {
    reading: "📖",
    use_of_english: "📝",
    listening: "🎧",
    writing: "✍️",
    speaking: "🎙️",
  };

  const maxScores = maxScoresBySection[section] || {};
  const partNames = partNamesBySection[section] || {};
  const parts = Object.keys(maxScores).map(Number);

  const [averages, setAverages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setAverages({});
      return;
    }

    fetch(
      `https://manelgram112.pythonanywhere.com/api/average_score_by_part/?level=${level}&section=${section}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching averages");
        return res.json();
      })
      .then((data) => {
        const averagesByPart = {};
        data.forEach(({ part, average_score }) => {
          averagesByPart[part] = average_score;
        });
        setAverages(averagesByPart);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching averages:", error);
        setLoading(false);
      });
  }, [level, section]);

  // Section-based colors (modernos)
  const isListening = section === "listening";
  const progressColor = isListening ? "from-orange-500 to-orange-600" : "from-blue-500 to-blue-600";
  const borderHoverColor = isListening ? "hover:border-orange-300" : "hover:border-blue-300";
  const textColor = isListening ? "text-orange-600" : "text-blue-600";

  const sectionTitle = section.replaceAll("_", " ");
  const sectionEmoji = sectionEmojis[section] || "📚";

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-100 mt-8 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          <span className="text-lg">←</span>
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 flex-grow">
          {sectionEmoji} Select the part ({sectionTitle})
        </h2>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2">Loading averages...</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {parts.map((partNumber) => {
            const average = averages[partNumber];
            const max = maxScores[partNumber];
            const isFail = average !== undefined && average < max * 0.6;
            const percentage = average !== undefined ? (average / max) * 100 : 0;
            const partLabel = partNames[partNumber] || "Unknown";

            return (
              <li key={partNumber}>
                <Link
                  to={`/${level}/${section}/part/${partNumber}`}
                  className={`block bg-white border border-gray-200 rounded-xl hover:shadow-lg ${borderHoverColor} transition-all duration-200 overflow-hidden group`}
                >
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-800">
                          Part {partNumber}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{partLabel}</span>
                      </div>
                    </div>
                    
                    {average !== undefined && max && (
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${
                            isFail ? "text-red-600" : "text-green-600"
                          }`}>
                            {average.toFixed(1)} / {max}
                          </span>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        {/* Progress bar */}
                        <div className="w-24 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFail ? "bg-red-500" : `bg-gradient-to-r ${progressColor}`
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {average === undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Not started</span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default PartSelector;