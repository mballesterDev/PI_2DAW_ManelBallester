import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import ExerciseInfo from "../../../pages/ExerciseInfo";

function RUOE_5_C1({ data, level, section, part, modelName, video, explanation }) {
  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);

  const navigate = useNavigate();
  const { register, handleSubmit, getValues, setValue, reset, watch } = useForm();

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
      `https://manelgram112.pythonanywhere.com/api/testresults/best/?level=${level}&section=${section}&part=${part}`,
      {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
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

  if (!data) return <p className="text-center">Loading test...</p>;

  const total = data.questions.length;

  const onSubmit = () => {
    let newScore = 0;
    data.questions.forEach((q) => {
      const userAnswer = getValues(`q${q.id}`);
      if (userAnswer === q.answer) newScore++;
    });
    setScore(newScore);
    setShowResults(true);
    setShowExplanations(true);

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
        fetchBestScore();
      })
      .catch(console.error);
  };

  const showAnswers = () => {
    data.questions.forEach((q) => {
      setValue(`q${q.id}`, q.answer);
    });
    setShowCorrectAnswers(true);
    setShowResults(true);
    setShowExplanations(true);
  };

  const resetTest = () => {
    reset(); // elimina todas las selecciones (igual que UOE_7)
    setShowResults(false);
    setShowCorrectAnswers(false);
    setShowExplanations(false);
    setScore(0);
  };

  const renderQuestions = () =>
    data.questions.map((q, index) => {
      const current = watch(`q${q.id}`);
      const isCorrect = current === q.answer;

      let optionStyle = "border-gray-300 bg-white";
      if (showCorrectAnswers) {
        optionStyle = "border-green-600 bg-green-100";
      } else if (showResults) {
        optionStyle = isCorrect
          ? "border-green-600 bg-green-100"
          : current
          ? "border-red-500 bg-red-100"
          : "border-gray-300 bg-white";
      }

      return (
        <div key={q.id} className="mt-4 p-4 border rounded-md bg-white shadow-sm">
          <div className="font-bold text-gray-700 mb-2">
            {index + 1}) {q.question}
          </div>
          <div className="space-y-2">
            {q.options.map((option) => (
              <label
                key={option}
                className={`block px-2 py-1 rounded-md cursor-pointer border ${
                  current === option ? optionStyle : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  value={option}
                  {...register(`q${q.id}`)}
                  disabled={showResults}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
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

  const tips = [
    "Read the text carefully before answering.",
    "Look for keywords in both the text and the options.",
    "Eliminate obviously wrong answers first.",
    "Base your choice only on the text, not your prior knowledge.",
    "Be careful with distractors that seem correct but are not stated in the text.",
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        {/* Flecha atrás y título */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-7 bg-blue-400 rounded-md text-white shadow-sm cursor-pointer hover:bg-blue-500 active:shadow-inner transition"
            aria-label="Volver atrás"
          >
            <span className="text-lg select-none">←</span>
          </button>
          <h2 className="text-2xl font-bold">{data.title}</h2>
        </div>

        
        {/* Texto principal */}
        <div className="p-4 space-y-2">
          {data.text.map((paragraph, i) => (
            <p
             key={i} className="text-gray-700 text-md leading-relaxed"
             style={{
              textAlign: "justify",
             textJustify: "inter-word",
             hyphens: "auto"
            }}>

              {paragraph}
            </p>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {renderQuestions()}

          <div className="mt-6 flex flex-wrap justify-start gap-4">
            {!showResults && (
              <button
                type="submit"
                className="px-5 py-2 bg-blue-500 cursor-pointer text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 active:shadow-inner transition"
              >
                Check Answers
              </button>
            )}

            {showResults && (
              <>
                {!showCorrectAnswers && (
                  <>
                  <p className="text-lg font-semibold">
                  Your score: {score} / {total}
                 </p>
                  <button
                    type="button"
                    onClick={showAnswers}
                    className="px-5 py-2 bg-green-400 cursor-pointer text-gray-800 font-semibold rounded-md shadow-sm border border-gray-300 hover:bg-green-500 active:shadow-inner transition"
                  >
                    Show Answers
                  </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowExplanations((v) => !v)}
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

      {/* Sidebar */}
      <div>
        <ExerciseInfo timer={10} tips={tips} videoUrl={video} />
      </div>
    </div>
  );
}

export default RUOE_5_C1;
