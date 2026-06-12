import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExerciseInfo from "../../../pages/ExerciseInfo";

function RUOE_1_B1({ data, level, section, part, modelName, video, explanation }) {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!level || !section || !part || !modelName) return;
    if (!data) return;
    fetchBestScore();
  }, [level, section, part, modelName, data]);

  const fetchBestScore = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setBestScore(null);
      return;
    }

    fetch(
      `http://127.0.0.1:8000/api/testresults/best/?level=${level}&section=${section}&part=${part}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching best score");
        return res.json();
      })
      .then((results) => {
        const modelResult = results.find((r) => r.modelName === modelName);
        setBestScore(modelResult ? modelResult.best_score : null);
      })
      .catch(() => setBestScore(null));
  };

  if (!data) return <p className="text-center">...Loading</p>;

  const handleChange = (e, id) => {
    setAnswers((prev) => ({ ...prev, [id]: e.target.value }));
  };

    const checkAnswers = () => {
  let newScore = 0;
  data.text.forEach((part) => {
    if (typeof part !== "string") {
      const userAnswer = answers[part.id];
      if (
        userAnswer &&
        userAnswer.trim().toLowerCase() === part.answer.toLowerCase()
      ) {
        newScore++;
      }
    }
  });
  setScore(newScore);
  setShowResults(true);
  setShowExplanations(true);  // <-- Aquí lo añades para mostrar explicaciones automáticamente

  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("http://127.0.0.1:8000/api/testresults/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      level,
      section,
      part,
      model_name: modelName,
      score: newScore,
    }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
      fetchBestScore();
    })
    .catch(console.error);
};


  const showAnswers = () => {
    const correctAnswers = {};
    data.text.forEach((part) => {
      if (typeof part !== "string") correctAnswers[part.id] = part.answer;
    });
    setAnswers(correctAnswers);
    setShowCorrectAnswers(true);
  };

  const resetTest = () => {
    setAnswers({});
    setShowResults(false);
    setShowCorrectAnswers(false);
    setShowExplanations(false);
    setScore(0);
  };

  const renderText = () =>
    data.text.map((part) => {
      if (typeof part === "string") return <span key={part}>{part}</span>;

      const userAnswer = answers[part.id] || "";
      const correct =
        userAnswer.trim().toLowerCase() === part.answer.toLowerCase();

      return (
        <select
          key={part.id}
          value={userAnswer}
          onChange={(e) => handleChange(e, part.id)}
          className={`mx-1 p-1 cursor-pointer rounded-sm border text-sm
            ${
              showCorrectAnswers
                ? "border-green-500 bg-green-100"
                : showResults
                ? correct
                  ? "border-green-500 bg-green-100"
                  : "border-red-500 bg-red-100"
                : "border-gray-300 bg-white"
            }
          `}
        >
          <option value="" disabled hidden>
            Select
          </option>
          {part.options.map((option, i) => (
            <option key={i} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    });

  const renderExplanations = () => {
    if (!explanation) return null;

    return (
      <div
        className={`transition-all duration-500 overflow-hidden ${
          showExplanations ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-4 p-6 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm space-y-3">
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">
            Explanations
          </h3>
          {Object.entries(explanation).map(([word, text]) => (
            <p key={word} className="text-sm text-gray-700">
              <strong className="text-gray-900">{word}</strong> – {text}
            </p>
          ))}
        </div>
      </div>
    );
  };

  const total = data.text.filter((part) => typeof part !== "string").length;

  const tips = [
    "Read all the options carefully before choosing your answer.",
    "Pay attention to the grammar and collocations around the gap.",
    "Look out for common distractors like similar spellings or forms.",
    "Try to understand the overall meaning of the sentence or paragraph.",
    "Manage your time and don't spend too long on a single question.",
    "Eliminate clearly wrong answers to improve your chances.",
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main text + controls (2/3 width desktop) */}
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-7 bg-blue-400 rounded-md text-white shadow-sm cursor-pointer hover:bg-blue-500 active:shadow-inner transition"
          >
            <span className="text-lg">←</span>
          </button>
          <h1 className="text-2xl font-semibold">{data.title}</h1>
        </div>

        <p className="lg:text-md leading-loose"
        style={{
              textAlign: "justify",
             textJustify: "inter-word",
             hyphens: "auto"
            }}>{renderText()}</p>

        <div className="flex flex-wrap justify-start gap-4">
          {!showResults && (
            <button
              onClick={checkAnswers}
              className="px-5 py-2 bg-blue-500 cursor-pointer text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 active:shadow-inner transition"
            >
              Check answers
            </button>
          )}

          {showResults && (
            <>
              <p className="text-lg font-semibold">
                Your score: {score} / {total}
              </p>
              {bestScore !== null && (
                <p
                  className={`text-lg font-semibold ${
                    bestScore < total / 2 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Best score: {bestScore} / {total}
                </p>
              )}
              {!showCorrectAnswers && (
                <button
                  onClick={showAnswers}
                  className="px-5 py-2 bg-green-400 cursor-pointer text-gray-800 font-semibold rounded-md shadow-sm border border-gray-300 hover:bg-green-500 active:shadow-inner transition"
                >
                  Show Answers
                </button>
              )}
              <button
                onClick={() => setShowExplanations((prev) => !prev)}
                className="px-5 py-2 bg-blue-500 text-white cursor-pointer font-semibold rounded-md shadow-sm hover:bg-blue-600 active:shadow-inner transition"
              >
                {showExplanations ? "Hide Explanations" : "Show Explanations"}
              </button>
              <button
                onClick={resetTest}
                className="px-5 py-2 bg-white text-gray-800 cursor-pointer font-semibold rounded-md border-[0.2px] shadow-sm hover:bg-gray-100 active:shadow-inner transition"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {renderExplanations()}
      </div>

      {/* Sidebar */}
      <div>
        <ExerciseInfo timer={0.3} tips={tips} videoUrl={video} />
      </div>
    </div>
  );
}

export default RUOE_1_B1;
