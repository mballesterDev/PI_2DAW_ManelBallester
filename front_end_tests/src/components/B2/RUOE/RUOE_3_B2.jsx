import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ExerciseInfo from "../../../pages/ExerciseInfo";

function RUOE_3_B2({ level, section, part, modelName, video, explanation }) {
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);

  const { register, handleSubmit, setValue, reset } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (!level || !section || !part || !modelName) return;
    
    fetch(
      `https://manelgram112.pythonanywhere.com/api/exercises/?level=${level}&section=${section}&part=${part}&model_name=${modelName}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setData(data[0].content);
          reset();
          setAnswers({});
          setShowResults(false);
          setShowCorrectAnswers(false);
          setShowExplanations(false);
          setScore(0);
          fetchBestScore(); // Fetch best score when data loads
        }
      })
      .catch((err) => {
        console.error("Error loading exercise:", err);
      });
  }, [level, section, part, modelName, reset]);

  const fetchBestScore = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setBestScore(null);
      return;
    }

    fetch(
      `https://manelgram112.pythonanywhere.com/api/testresults/best/?level=${level}&section=${section}&part=${part}`,
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

  if (!data) return <p className="text-center">Cargando test...</p>;

  const total = data.text.filter((part) => typeof part !== "string").length;

  const handleChange = (e, id) => {
    setAnswers((prev) => ({ ...prev, [id]: e.target.value }));
    setShowCorrectAnswers(false);
  };

  const onSubmit = () => {
    let newScore = 0;
    data.text.forEach((part) => {
      if (typeof part !== "string") {
        const userAnswer = answers[part.id] || "";
        if (userAnswer.trim().toLowerCase() === part.answer.toLowerCase()) {
          newScore++;
        }
      }
    });
    setScore(newScore);
    setShowResults(true);
    setShowExplanations(true); // Show explanations automatically

    // Send score to backend
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("https://manelgram112.pythonanywhere.com/api/testresults/", {
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
        fetchBestScore(); // Refresh best score after submitting
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
    setShowResults(true);
  };

  const resetTest = () => {
    setAnswers({});
    reset();
    setShowResults(false);
    setShowCorrectAnswers(false);
    setShowExplanations(false);
    setScore(0);
  };

  let gapCounter = 0;
  const renderText = () => {
    const elements = [];
    let currentParagraph = [];

    data.text.forEach((part, index) => {
      if (typeof part === "string") {
        // Split by double newlines to create paragraphs
        const paragraphs = part.split('\n\n');
        
        paragraphs.forEach((paragraph, pIndex) => {
          if (pIndex > 0) {
            // Push current paragraph if it has content
            if (currentParagraph.length > 0) {
              elements.push(
                <p key={`p-${elements.length}`} className="mb-4">
                  {currentParagraph}
                </p>
              );
              currentParagraph = [];
            }
          }
          
          // Split by single newlines within paragraph
          const lines = paragraph.split('\n');
          lines.forEach((line, lIndex) => {
            if (lIndex > 0) {
              currentParagraph.push(<br key={`br-${index}-${pIndex}-${lIndex}`} />);
            }
            if (line.trim()) {
              currentParagraph.push(
                <span key={`text-${index}-${pIndex}-${lIndex}`}>{line}</span>
              );
            }
          });
        });
      } else {
        gapCounter++;
        const userAnswer = answers[part.id] || "";
        const correct = userAnswer.trim().toLowerCase() === part.answer.toLowerCase();

        currentParagraph.push(
          <span key={part.id} className="inline-flex items-center mx-1">
            <span className="mr-1 font-semibold text-gray-700">({gapCounter})</span>
            <input
              type="text"
              {...register(part.id)}
              value={userAnswer}
              onChange={(e) => handleChange(e, part.id)}
              className={`mx-1 p-1 cursor-pointer rounded-sm border w-24 text-sm
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
              placeholder=""
            />
            <strong className="ml-2 uppercase text-sm">{part.base}</strong>
          </span>
        );
      }
    });

    // Push the last paragraph
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-4">
          {currentParagraph}
        </p>
      );
    }

    return elements;
  };

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

  const tips = [
    "Pay attention to word formation and grammar context.",
    "Look for collocations and fixed expressions.",
    "Consider parts of speech carefully.",
    "Check spelling and verb forms.",
    "Manage your time wisely for each gap.",
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left side: Exercise + inputs */}
      <div className="md:col-span-2 space-y-6 lg:text-md leading-loose">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-7 bg-blue-400 rounded-md text-white shadow-sm cursor-pointer hover:bg-blue-500 active:shadow-inner transition"
          >
            <span className="text-lg">←</span>
          </button>
          <h1 className="text-2xl font-semibold">{data.title}</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className=" leading-relaxed space-y-4"
          style={{
              textAlign: "justify",
             textJustify: "inter-word",
             hyphens: "auto"
            }}>
            {renderText()}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 justify-start">
            {!showResults && (
              <button
                type="submit"
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
                    type="button"
                    onClick={showAnswers}
                    className="px-5 py-2 bg-green-400 cursor-pointer text-gray-800 font-semibold rounded-md shadow-sm border border-gray-300 hover:bg-green-500 active:shadow-inner transition"
                  >
                    Show Answers
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowExplanations((prev) => !prev)}
                  className="px-5 py-2 bg-blue-500 text-white cursor-pointer font-semibold rounded-md shadow-sm hover:bg-blue-600 active:shadow-inner transition"
                >
                  {showExplanations ? "Hide Explanations" : "Show Explanations"}
                </button>
                <button
                  type="button"
                  onClick={resetTest}
                  className="px-5 py-2 bg-white text-gray-800 cursor-pointer font-semibold rounded-md border-[0.2px] shadow-sm hover:bg-gray-100 active:shadow-inner transition"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </form>

        {renderExplanations()}
      </div>

      {/* Right side: ExerciseInfo */}
      <div>
        <ExerciseInfo timer={6} tips={tips} videoUrl={video} />
      </div>
    </div>
  );
}

export default RUOE_3_B2;