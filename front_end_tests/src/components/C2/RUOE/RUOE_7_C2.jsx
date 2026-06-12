import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import ExerciseInfo from "../../../pages/ExerciseInfo";

function RUOE_7_C2({ data, level, section, part, modelName, video, explanation, enunciado }) {
  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);

  const navigate = useNavigate();
  const { register, handleSubmit, setValue, getValues, reset, watch } = useForm();

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
      const userAnswer = getValues(q.id.toString());
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
      setValue(q.id.toString(), q.answer);
    });
    setShowCorrectAnswers(true);
    setShowResults(true);
    setShowExplanations(true);
  };

  const resetTest = () => {
    reset();
    setShowResults(false);
    setShowCorrectAnswers(false);
    setShowExplanations(false);
    setScore(0);
  };

  const renderQuestions = () =>
    data.questions.map((q) => {
      const current = watch(q.id.toString());
      const isCorrect = current === q.answer;

      let selectStyle = "border-gray-300 bg-white";
      if (showCorrectAnswers) {
        selectStyle = "border-green-600 bg-green-200";
      } else if (showResults) {
        selectStyle = isCorrect
          ? "border-green-600 bg-green-200"
          : "border-red-500 bg-red-100";
      }

      return (
        <div key={q.id} className="flex items-start gap-3 mt-3">
          <div className="w-[5%] font-bold text-gray-700">{q.id})</div>
          <div className="flex-1">
            <p className="mb-1">{q.text}</p>
            <select
              {...register(q.id.toString())}
              className={`px-3 py-2 rounded-md border text-sm ${selectStyle}`}
              defaultValue=""
            >
              <option value="" disabled>
                ---
              </option>
              {["A", "B", "C", "D"].map((letter) => (
                <option key={letter} value={letter}>
                  {letter}
                </option>
              ))}
            </select>
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
    "Read all passages carefully before answering.",
    "Look for synonyms or paraphrasing between the texts and the questions.",
    "Don’t overthink; choose the option that directly matches the text.",
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

        

        {showResults && (
          <p className="text-lg font-semibold">
            Score: {score} / {total}
          </p>
        )}

        {bestScore !== null && (
          <p
            className={`text-lg font-semibold ${
              bestScore < total / 2 ? "text-red-600" : "text-green-600"
            }`}
          >
            Best score: {bestScore} / {total}
          </p>
        )}

        {/* Pasajes arriba */}
        <div className="mt-2 space-y-6">
          {data.passages.map((p, idx) => (
            <div key={idx}>
              <h4 className="font-bold mb-1">
                {String.fromCharCode(65 + idx)}) {p.name}
              </h4>
              <p className=" leading-6"
              
              style={{
              textAlign: "justify",
             textJustify: "inter-word",
             hyphens: "auto"
            }}>{p.text}</p>
            </div>
          ))}
        </div>

        {enunciado && (
          <div className="font-bold mt-10">
            {enunciado}
          </div>
        )}

        {/* Preguntas */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
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
        <ExerciseInfo timer={12} tips={tips} videoUrl={video} />
      </div>
    </div>
  );
}

export default RUOE_7_C2;
