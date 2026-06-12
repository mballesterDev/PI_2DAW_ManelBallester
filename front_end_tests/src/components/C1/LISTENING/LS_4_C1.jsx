import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ExerciseInfo from "../../../pages/ExerciseInfo";

function LS_4_C1({ data, level, section, part, modelName, video, explanation, enunciado }) {
  const navigate = useNavigate();

  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(null);
  const [bestScore, setBestScore] = useState(null);

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

  if (!data) return <p className="text-center">Loading audio...</p>;

  const allQuestions = [...data.task1.questions, ...data.task2.questions];

  const onSubmit = () => {
    const result = allQuestions.reduce(
      (acc, q) => (getValues(q.id) === q.answer ? acc + 1 : acc),
      0
    );
    setScore(result);
    setShowResults(true);
    setShowExplanation(true);
    saveScore(result);
  };

  const saveScore = (newScore) => {
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
  };

  const showAnswers = () => {
    allQuestions.forEach((q) => {
      setValue(q.id, q.answer);
    });
    setShowCorrectAnswers(true);
    setShowResults(true);
    setShowExplanation(true);
  };

  const resetTest = () => {
    reset();
    setShowResults(false);
    setShowCorrectAnswers(false);
    setShowExplanation(false);
    setScore(null);
  };

  const renderSelect = (q, options) => {
    const selected = watch(q.id);
    const isCorrect = selected === q.answer;

    let selectStyle = "w-[50px] border px-2 py-1 rounded transition ";

    if (showCorrectAnswers) {
      selectStyle +=
        q.answer === selected
          ? "border-green-600 bg-green-200"
          : "border-red-600 bg-red-200";
    } else if (showResults) {
      selectStyle += isCorrect
        ? "border-green-600 bg-green-200"
        : selected
        ? "border-red-600 bg-red-200"
        : "border-gray-400";
    } else {
      selectStyle += selected
        ? "border-blue-500 bg-blue-100"
        : "border-gray-400 bg-white";
    }

    return (
      <div key={q.id} className="space-y-1 flex gap-2 items-center">
        <p className="font-medium">
          {q.id}. {q.speaker}
        </p>
        <select
          {...register(q.id)}
          className={selectStyle}
          defaultValue=""
          disabled={showCorrectAnswers || showResults}
        >
          <option value="" disabled></option>
          {options.map((opt, i) => (
            <option key={i} value={opt[0]}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderExplanation = () => {
    if (!explanation || !explanation.explanation) return null;
    const text = explanation.explanation;
    const parts = text.split(/(".*?")/g);

    return (
      <div
        className={`transition-all duration-500 overflow-hidden ${
          showExplanation ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-4 p-6 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm space-y-3">
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">
            Transcription
          </h3>
          <p className="text-sm text-gray-700">
            {parts.map((part, i) =>
              part.startsWith('"') && part.endsWith('"') ? (
                <strong key={i} className="text-gray-900">
                  {part.slice(1, -1)}
                </strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        </div>
      </div>
    );
  };

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
          <h2 className="text-2xl font-bold text-center">{data.title}</h2>
        </div>

        {enunciado && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 my-4 text-yellow-800 text-center font-medium">
            {enunciado}
          </div>
        )}

        <audio controls className="w-full rounded-md shadow-sm">
          <source src={data.audio} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {score !== null && (
          <p className="text-lg font-semibold text-center">
            Score: {score} / {allQuestions.length}
          </p>
        )}

        {bestScore !== null && (
          <p
            className={`text-lg font-semibold text-center ${
              bestScore < allQuestions.length / 2
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            Best score: {bestScore} / {allQuestions.length}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-bold text-lg mb-2">Task One</h3>
              <p className="mb-4 text-sm">{data.task1.instructions}</p>
              <div className="space-y-3">
                {data.task1.questions.map((q) =>
                  renderSelect(q, data.task1.options)
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Task Two</h3>
              <p className="mb-4 text-sm">{data.task2.instructions}</p>
              <div className="space-y-3">
                {data.task2.questions.map((q) =>
                  renderSelect(q, data.task2.options)
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-start gap-4 mt-8">
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
                  onClick={() => setShowExplanation((v) => !v)}
                  className="px-5 py-2 bg-blue-500 text-white cursor-pointer font-semibold rounded-md shadow-sm hover:bg-blue-600 active:shadow-inner transition"
                >
                  {showExplanation ? "Hide Explanation" : "Show Explanation"}
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

        {renderExplanation()}
      </div>

      <div>
        <ExerciseInfo
          timer={12}
          tips={[
            "Read the options before listening.",
            "Focus on details like numbers and names.",
            "Cross-check answers before submitting.",
          ]}
          videoUrl={video}
        />
      </div>
    </div>
  );
}

export default LS_4_C1;
