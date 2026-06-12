import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function SectionSelector() {
  const { level } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");

  const sections = [
    { key: "reading", label: "Reading", emoji: "📖", available: true },
    { key: "use_of_english", label: "Use of English", emoji: "📝", available: true },
    { key: "listening", label: "Listening", emoji: "🎧", available: true },
    { key: "writing", label: "Writing", emoji: "✍️", available: false },
    { key: "speaking", label: "Speaking", emoji: "🎙️", available: false },
  ];

  // Max scores per section
  const maxScoresBySection = {
    reading: 42,
    use_of_english: 28,
    listening: 30,
    writing: 42,
    speaking: 42,
  };

  const [averages, setAverages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setAverages({});
      return;
    }

    fetch(`https://manelgram112.pythonanywhere.com/api/average_score_by_section/?level=${level}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching averages");
        return res.json();
      })
      .then((data) => {
        const averagesBySection = {};
        data.forEach(({ section, average_score }) => {
          averagesBySection[section] = average_score;
        });
        setAverages(averagesBySection);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching averages:", error);
        setLoading(false);
      });
  }, [level]);

  const handleComingSoon = (sectionLabel) => {
    setSelectedSection(sectionLabel);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSection("");
  };

  const renderSectionContent = (section) => {
    const { key, label, emoji, available } = section;
    const average = averages[key];
    const max = maxScoresBySection[key];
    const isFail = average !== undefined && average < max * 0.6;
    const percentage = average !== undefined ? (average / max) * 100 : 0;

    if (!available) {
      return (
        <div
          onClick={() => handleComingSoon(label)}
          className="block bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{emoji}</span>
              <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                {label}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                🚀 Coming Soon
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        to={`/${level}/${key}`}
        className="block bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden group"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
              {label}
            </span>
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
                    isFail ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {average === undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Not started</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
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
            Choose a section ({level.toUpperCase()})
          </h2>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2">Loading averages...</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sections.map((section) => (
              <li key={section.key}>
                {renderSectionContent(section)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal Coming Soon */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
              <div className="text-6xl mb-3">
                {selectedSection === "Writing" ? "✍️" : "🎙️"}
              </div>
              <h3 className="text-3xl font-bold text-white">
                {selectedSection}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {level.toUpperCase()} Level
              </p>
            </div>
            
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M12 8v4l3 3" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">
                🚀 Coming Soon!
              </h4>
              <p className="text-gray-600 mb-6">
                We're working hard to prepare the {selectedSection} section for {level.toUpperCase()} level. 
                It will be available soon. Stay tuned!
              </p>
              <button
                onClick={closeModal}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg transition-all transform hover:scale-[1.02]"
              >
                Got it! 👌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default SectionSelector;