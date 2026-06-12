import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function LS_1_B1({ data, level, section, part, modelName, video, explanation, enunciado }) {
  const navigate = useNavigate();

  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);

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
        const modelResult = results.find((r) => r.model_name === modelName);
        setBestScore(modelResult ? modelResult.best_score : null);
      })
      .catch(() => setBestScore(null));
  };

  if (!data) return <p className="text-center text-gray-500 text-base">Loading exercise...</p>;

  const onSubmit = () => {
    setShowResults(true);
    setShowExplanation(true);
    setShowCorrectAnswers(true); // ✅ ACTIVAR RESPUESTAS CORRECTAS AUTOMÁTICAMENTE
    const newScore = data.questions.reduce((acc, q) => {
      const userAnswer = getValues(q.id.toString());
      return userAnswer === q.answer ? acc + 1 : acc;
    }, 0);
    setScore(newScore);
    saveScore(newScore);
  };

  const saveScore = (newScore) => {
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

  const resetTest = () => {
    reset();
    setShowResults(false);
    setShowCorrectAnswers(false);
    setShowExplanation(false);
    setScore(0);
  };

  // Render explicación con comillas en negrita (estilo moderno)
  // Render explicación con números en negrita y saltos de línea
const renderExplanation = () => {
  if (!explanation || !explanation.explanation) return null;
  const text = explanation.explanation;
  
  // Dividir el texto por líneas (ya viene con \n)
  const lines = text.split('\n');
  
  return (
    <div
      className={`transition-all duration-500 overflow-hidden ${
        showExplanation ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 border-b border-amber-100">
          <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
            Transcription
          </h3>
        </div>
        <div className="p-5">
          <div className="text-gray-700 leading-relaxed space-y-3">
            {lines.map((line, idx) => {
              if (line.trim() === "") return <div key={idx} className="h-2"></div>;
              
              // Detectar números al inicio de la línea (ej: "1.", "2.", etc.)
              const numberMatch = line.match(/^(\d+)\./);
              
              if (numberMatch) {
                const number = numberMatch[1];
                // Separar el número del resto del texto
                const restOfLine = line.substring(numberMatch[0].length);
                
                // Buscar frases entre comillas para poner en negrita
                const parts = restOfLine.split(/(".*?")/g);
                
                return (
                  <div key={idx} className="leading-relaxed">
                    <strong className="font-bold text-amber-800 text-base inline-block mr-2">
                      {number}.
                    </strong>
                    <span className="text-gray-700 text-base">
                      {parts.map((part, i) => {
                        if (part.startsWith('"') && part.endsWith('"')) {
                          return (
                            <strong key={i} className="font-semibold text-gray-900 bg-amber-50 px-0.5 rounded">
                              {part.slice(1, -1)}
                            </strong>
                          );
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </span>
                  </div>
                );
              }
              
              // Si no tiene número al inicio, mostrar la línea normal
              // Buscar frases entre comillas
              const parts = line.split(/(".*?")/g);
              return (
                <div key={idx} className="leading-relaxed text-gray-700 text-base">
                  {parts.map((part, i) => {
                    if (part.startsWith('"') && part.endsWith('"')) {
                      return (
                        <strong key={i} className="font-semibold text-gray-900 bg-amber-50 px-0.5 rounded">
                          {part.slice(1, -1)}
                        </strong>
                      );
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="max-w-7xl mx-auto p-7">
      {/* Header */}
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

      {/* Instructions */}
      {enunciado && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-7 rounded-r-md">
          <p className="text-blue-800 text-base font-medium">
            {enunciado}
          </p>
        </div>
      )}

      {/* Audio player */}
      {data.audio && (
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-400 ml-2">Audio Player</span>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </div>
              <audio controls className="flex-1 h-12 rounded-lg [&::-webkit-media-controls-panel]:bg-gray-50 [&::-webkit-media-controls-play-button]:text-blue-600 [&::-webkit-media-controls-current-time-display]:text-gray-700 [&::-webkit-media-controls-time-remaining-display]:text-gray-700">
                <source src={data.audio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
            <div className="mt-3 text-center text-sm text-gray-400">
              🎧 Click play to listen to the audio
            </div>
          </div>
        </div>
      )}

      {/* Score display after submission */}
      {showResults && (
        <div className="text-center mb-7">
          <p className="text-xl font-medium">
            Score: {score} / {data.questions.length}
          </p>
          {bestScore !== null && (
            <p className={`text-lg font-semibold ${
              bestScore < data.questions.length / 2 ? "text-red-600" : "text-green-600"
            }`}>
              Best score: {bestScore} / {data.questions.length}
            </p>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-6">
          <form className="space-y-8">
            {data.questions.map((q) => {
              const current = watch(q.id.toString());

              return (
                <div key={q.id} className="pb-6 border-b border-gray-100 last:border-0">
                  <p className="font-semibold text-gray-800 mb-4 text-base">
                    {q.id}. {q.text}
                  </p>
                  <div className="grid gap-2">
                    {q.options.map((opt, idx) => {
                      const isSelected = current === opt;
                      const isAnswer = opt === q.answer;

                      let style =
                        "p-3 rounded-xl text-left cursor-pointer transition-all duration-200 ";
                      
                      // Mostrar respuestas correctas en verde SIEMPRE después de corregir
                      if (showCorrectAnswers) {
                        if (isAnswer) {
                          style += "bg-green-100 text-green-800 border-2 border-green-500";
                        } else if (isSelected && !isAnswer) {
                          style += "bg-red-100 text-red-800 line-through border-2 border-red-500";
                        } else {
                          style += "bg-white text-gray-700 border border-gray-200";
                        }
                      } else if (showResults) {
                        if (isSelected && isAnswer) {
                          style += "bg-green-100 text-green-800 border-2 border-green-500";
                        } else if (isSelected && !isAnswer) {
                          style += "bg-red-100 text-red-800 line-through border-2 border-red-500";
                        } else if (isAnswer) {
                          style += "bg-green-100 text-green-800 border-2 border-green-500";
                        } else {
                          style += "bg-white text-gray-700 border border-gray-200";
                        }
                      } else {
                        style += isSelected
                          ? "bg-blue-100 text-blue-800 border-2 border-blue-500"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100";
                      }

                      return (
                        <label key={idx} className={style}>
                          <input
                            type="radio"
                            value={opt}
                            {...register(q.id.toString())}
                            className="hidden"
                            disabled={showResults}
                          />
                          <span className="text-base">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-4 justify-start mt-6">
              {!showResults ? (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-base"
                >
                  Check Answers
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowExplanation((v) => !v)}
                    className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200 text-base"
                  >
                    {showExplanation ? "Hide Transcription" : "Show Transcription"}
                  </button>
                  <button
                    type="button"
                    onClick={resetTest}
                    className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200 text-base"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Transcript section */}
      {renderExplanation()}
    </div>
  );
}

export default LS_1_B1;