import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LEVELS = ["B1", "B2", "C1", "C2"];

// Umbrales para calificación (sin usar la API)
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
  if (max === 0) return "text-gray-500";
  return score / max >= 0.5 ? "text-green-600" : "text-red-600";
}

export default function AverageScores() {
  const [data, setData] = useState({});
  const [globalScores, setGlobalScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAllLevels() {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found, please login");
        setLoading(false);
        return;
      }

      try {
        const newData = {};
        const newGlobalScores = {};

        for (const level of LEVELS) {
          // 1. Obtener promedios por sección (con sus máximos desde API)
          const resSection = await fetch(
            `https://manelgram112.pythonanywhere.com/api/average_score_by_section/?level=${level}`,
            { headers: { Authorization: `Token ${token}` } }
          );
          if (!resSection.ok) throw new Error(`Error fetching sections for level ${level}`);
          const sectionsData = await resSection.json();

          // Guardar secciones con sus máximos (vienen de la API)
          const sections = {};
          const maxSections = {};
          for (const s of sectionsData) {
            sections[s.section] = s.average_score;
            maxSections[s.section] = s.max_score;
          }

          // 2. Obtener promedios por parte
          const parts = {};
          for (const s of sectionsData) {
            const sectionKey = s.section;
            const resParts = await fetch(
              `https://manelgram112.pythonanywhere.com/api/average_score_by_part/?level=${level}&section=${sectionKey}`,
              { headers: { Authorization: `Token ${token}` } }
            );
            if (!resParts.ok) throw new Error(`Error fetching parts for ${level} - ${sectionKey}`);
            const partsData = await resParts.json();

            parts[sectionKey] = {};
            for (const p of partsData) {
              parts[sectionKey][p.part] = {
                avg: p.average_score,
                max: p.max_score
              };
            }
          }

          newData[level] = { sections, maxSections, parts };

          // 3. Calcular nota global (promedio de porcentajes)
          let totalPercentage = 0;
          let validSections = 0;
          
          for (const [section, avg] of Object.entries(sections)) {
            const maxVal = maxSections[section];
            if (maxVal > 0) {
              const percentage = (avg / maxVal) * 100;
              totalPercentage += percentage;
              validSections++;
            }
          }
          
          const globalPercentage = validSections > 0 ? totalPercentage / validSections : 0;
          const gradeInfo = getGrade(globalPercentage);
          
          newGlobalScores[level] = {
            percentage: globalPercentage.toFixed(1),
            grade: gradeInfo.text,
            isPass: globalPercentage >= 60
          };
        }

        // Filtrar solo niveles con datos
        const filteredData = Object.fromEntries(
          Object.entries(newData).filter(([_, obj]) =>
            Object.values(obj.sections).some(score => score > 0)
          )
        );

        setData(filteredData);
        setGlobalScores(newGlobalScores);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAllLevels();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-3 text-gray-500 text-base">Loading average scores...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
          <span className="text-3xl mb-2 block">⚠️</span>
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );

  if (Object.keys(data).length === 0)
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center max-w-md">
          <span className="text-3xl mb-2 block">📊</span>
          <p className="text-yellow-700 text-sm font-medium">No average scores found.</p>
        </div>
      </div>
    );

  return (
    <div className="flex justify-center items-start min-h-screen pt-12 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header con gradiente */}
        <div className="px-6 py-5 border-b mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              <span className="text-lg">←</span>
            </button>
            <h1 className="text-2xl font-bold  tracking-wide flex-1 text-center">
              Average Scores
            </h1>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-8">
          {Object.entries(data).map(([level, { sections, maxSections, parts }]) => {
            const global = globalScores[level];
            return (
              <section key={level} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-3xl">📚</span>
                    Level {level}
                  </h2>
                  {global && (
                    <div className={`px-4 py-2 rounded-lg text-center ${
                      global.isPass ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <div className={`text-sm font-bold ${global.isPass ? 'text-green-700' : 'text-red-700'}`}>
                        Global: {global.percentage}%
                      </div>
                      <div className={`text-xs font-semibold ${global.isPass ? 'text-green-600' : 'text-red-600'}`}>
                        {global.grade}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {Object.entries(sections).map(([section, avgScore]) => {
                    const maxSection = maxSections[section] || 0;
                    const passedSection = avgScore / maxSection >= 0.5;

                    return (
                      <div key={section} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {section === "reading" && "📖"}
                              {section === "listening" && "🎧"}
                              {section === "writing" && "✍️"}
                              {section === "speaking" && "🎙️"}
                              {section === "use_of_english" && "📝"}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-800 capitalize">
                              {section.replace("_", " ")}
                            </h3>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-bold ${passedSection ? 'text-green-600' : 'text-red-600'}`}>
                              {avgScore.toFixed(1)} / {maxSection}
                            </span>
                            <span className="ml-2">
                              {passedSection ? "✅" : "❌"}
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${passedSection ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${(avgScore / maxSection) * 100}%` }}
                          ></div>
                        </div>

                        <ul className="space-y-2">
                          {parts[section] &&
                            Object.entries(parts[section]).map(([part, partData]) => {
                              const avgPartScore = partData.avg;
                              const maxPart = partData.max;
                              const passedPart = maxPart > 0 ? avgPartScore / maxPart >= 0.5 : false;

                              return (
                                <li key={part} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">
                                    Part {part}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className={passedPart ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                      {avgPartScore.toFixed(1)} / {maxPart}
                                    </span>
                                    <span className="text-base">
                                      {passedPart ? "✓" : "✗"}
                                    </span>
                                  </div>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}