import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ExerciseInfo from "../../../pages/ExerciseInfo";

function RUOE_1_B2({ data, level, section, part, modelName, video, explanation }) {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);
  
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!level || !section || !part || !modelName || !data) return;
    fetchBestScore();
  }, [level, section, part, modelName, data]);

  const fetchBestScore = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setBestScore(null);
      return;
    }

    fetch(
      `http://manelgram112.pythonanywhere.com/api/testresults/best/?level=${level}&section=${section}&part=${part}`,
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
    setShowExplanations(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://manelgram112.pythonanywhere.com/api/testresults/", {
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
    
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 150);
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

  let inputCounter = 0;

  const renderText = () =>
    data.text.map((part, idx) => {
      if (typeof part === "string") return <span key={idx}>{part}</span>;

      inputCounter++;
      const inputNumber = inputCounter;
      const userAnswer = answers[part.id] || "";
      const correct =
        userAnswer.trim().toLowerCase() === part.answer.toLowerCase();

      return (
        <span key={part.id} className="inline-flex items-center mx-1 my-1">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-sm mr-1">
            {inputNumber}
          </span>
          <select
            value={userAnswer}
            onChange={(e) => handleChange(e, part.id)}
            className={`p-1 cursor-pointer rounded-md border text-sm transition-all duration-300
              ${
                showCorrectAnswers
                  ? "border-green-500 bg-green-100"
                  : showResults
                  ? correct
                    ? "border-green-500 bg-green-100"
                    : "border-red-500 bg-red-100"
                  : "border-gray-300 bg-white hover:border-blue-400"
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
        </span>
      );
    });

  const renderExplanations = () => {
    if (!explanation) return null;

    const explanationEntries = Object.entries(explanation);
    let explanationCounter = 0;

    return (
      <div
        className={`transition-all duration-1000 ease-in-out overflow-hidden ${
          showExplanations ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 border-b border-amber-100">
            <h3 className="text-base font-semibold text-amber-700 uppercase tracking-wide">
              Explanations
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {explanationEntries.map(([word, text]) => {
                explanationCounter++;
                return (
                  <p key={word} className="text-gray-700 text-base leading-loose">
                    <strong className="font-bold text-gray-900 mr-2">
                      {explanationCounter}.
                    </strong>
                    <strong className="font-semibold text-gray-900 bg-amber-50 px-0.5 rounded">
                      {word}
                    </strong>
                    <span className="text-gray-700"> – {text}</span>
                  </p>
                );
              })}
            </div>
          </div>
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
    <div className="max-w-7xl mx-auto p-7">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          <span className="text-xl">←</span>
        </button>
        <h2 className="text-3xl font-bold text-center text-gray-800 flex-grow whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
          {data.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <p 
                className="text-gray-700 text-base leading-loose"
                style={{
                  textAlign: "justify",
                  textJustify: "inter-word",
                  hyphens: "auto"
                }}
              >
                {renderText()}
              </p>
            </div>
          </div>

          <div ref={resultsRef}>
            {showResults && (
              <div className="text-center mb-7">
                <p className="text-xl font-medium">
                  Score: {score} / {total}
                </p>
                {bestScore !== null && (
                  <p className={`text-lg font-semibold ${
                    bestScore < total / 2 ? "text-red-600" : "text-green-600"
                  }`}>
                    Best score: {bestScore} / {total}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-start">
            {!showResults ? (
              <button
                onClick={checkAnswers}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-base"
              >
                Check Answers
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowExplanations((prev) => !prev)}
                  className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200 text-base"
                >
                  {showExplanations ? "Hide Explanations" : "Show Explanations"}
                </button>
                {!showCorrectAnswers && (
                  <button
                    onClick={showAnswers}
                    className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200 text-base"
                  >
                    Show Answers
                  </button>
                )}
                <button
                  onClick={resetTest}
                  className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200 text-base"
                >
                  Reset
                </button>
              </>
            )}
          </div>

          {renderExplanations()}
        </div>

        <div className="lg:col-span-1">
          <ExerciseInfo timer={0.3} tips={tips} videoUrl={video} />
        </div>
      </div>
    </div>
  );
}

export default RUOE_1_B2;