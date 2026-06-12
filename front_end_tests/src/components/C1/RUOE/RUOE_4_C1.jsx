import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import ExerciseInfo from "../../../pages/ExerciseInfo";
import { useNavigate } from "react-router-dom";

function RUOE_4_C1({ data, level, section, part, modelName, video, explanation }) {
  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [score, setScore] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  useEffect(() => {
    reset();
    setShowResults(false);
    setShowCorrectAnswers(false);
    setShowExplanations(false);
    setScore(0);
  }, [data, reset]);

  if (!data) return <p className="text-center">Loading test...</p>;

  const total = data.gaps.length * 2; // ✅ Cada pregunta vale x2 puntos

  const onSubmit = () => {
    let newScore = 0;
    data.gaps.forEach((gap) => {
      const userAnswer = getValues(gap.id)?.trim().toLowerCase() || "";
      if (gap.answers.some((ans) => ans.toLowerCase() === userAnswer)) {
        newScore += 2; // ✅ Suma 2 puntos por respuesta correcta
      }
    });
    setScore(newScore);
    setShowResults(true);
    setShowExplanations(true);
  };

  const showAnswers = () => {
    data.gaps.forEach((gap) => {
      setValue(gap.id, gap.answers[0]);
      setTimeout(() => {
        const input = document.querySelector(`input[name="${gap.id}"]`);
        if (input) {
          input.classList.remove(
            "border-gray-300",
            "bg-white",
            "border-red-500",
            "bg-red-100"
          );
          input.classList.add("border-green-600", "bg-green-200");
        }
      }, 0);
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

   const renderGaps = () =>
  data.gaps.map((gap, index) => {
    const userAnswer = getValues(gap.id) || "";
    const userAnswerLower = userAnswer.trim().toLowerCase();
    const isCorrect = gap.answers.some(
      (ans) => ans.toLowerCase() === userAnswerLower
    );

    return (
      <div key={gap.id} className="mt-4">
        <div className="flex items-start gap-2">
          <div className="w-[5%] font-bold text-gray-700">{index + 1})</div>
          <div className="flex-1">
            <p className="mb-1 whitespace-pre-line">
              {gap.question.split("\n").map((line, i) =>
                line.trim().toUpperCase() === gap.keyword.toUpperCase() ? (
                  <span
                    key={i}
                    className="block font-semibold text-purple-700 mb-1 uppercase"
                  >
                    {line}
                  </span>
                ) : (
                  <span key={i} className="block">
                    {line}
                  </span>
                )
              )}
            </p>

            <input
              type="text"
              {...register(gap.id)}
              placeholder="Write between 3 and 6 words"
              className={`w-full px-3 py-2 rounded-md border
                ${
                  showCorrectAnswers
                    ? "border-green-600 bg-green-200"
                    : showResults
                    ? isCorrect
                      ? "border-green-600 bg-green-200"
                      : "border-red-500 bg-red-100"
                    : "border-gray-300 bg-white"
                }
              `}
            />
          </div>
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
    "Read the whole sentence before writing your answer.",
    "Think about grammar and verb forms required.",
    "Look for collocations or fixed expressions.",
    "Check spelling carefully before submitting.",
    "Use only between 3 and 6 words per gap.",
    "If unsure, try to deduce from context.",
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left: Exercise text + inputs */}
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
        

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {renderGaps()}

          <div className="mt-6 flex flex-wrap justify-start gap-4">
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
                {!showCorrectAnswers && (
                  <>
                  <p className="text-lg font-semibold">
                  Score: {score} / {total}
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

      {/* Right: ExerciseInfo */}
      <div>
        <ExerciseInfo timer={8} tips={tips} videoUrl={video} />
      </div>
    </div>
  );
}

export default RUOE_4_C1;
