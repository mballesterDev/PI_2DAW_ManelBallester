import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function LS_2_B1({ data, level, section, part, modelName, video, explanation, enunciado }) {
  const navigate = useNavigate();

  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);
  const [inputWidths, setInputWidths] = useState({});

  const { register, handleSubmit, getValues, setValue, reset, watch } = useForm();

  // Función para calcular el ancho del input basado en el texto
  const calculateWidth = (text) => {
    const minWidth = 120;
    const maxWidth = 400;
    const charWidth = 10;
    let width = (text || "").length * charWidth + 40;
    width = Math.max(minWidth, Math.min(maxWidth, width));
    return width;
  };

  useEffect(() => {
    if (!level || !section || !part || !modelName) return;
    if (!data) return;
    fetchBestScore();
  }, [level, section, part, modelName, data]);

  // Actualizar ancho de inputs cuando cambian las respuestas
  useEffect(() => {
    const subscription = watch((values) => {
      const newWidths = {};
      data.text.forEach((part) => {
        if (typeof part !== "string") {
          const answer = values[part.id] || "";
          newWidths[part.id] = calculateWidth(answer);
        }
      });
      setInputWidths(newWidths);
    });
    return () => subscription.unsubscribe();
  }, [watch, data]);

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
        const modelResult = results.find((r) => r.model_name === modelName);
        setBestScore(modelResult ? modelResult.best_score : null);
      })
      .catch(() => setBestScore(null));
  };

  if (!data) return <p className="text-center text-gray-500 text-base">Loading exercise...</p>;

  const onSubmit = () => {
    setShowResults(true);
    setShowExplanation(true);
    setShowCorrectAnswers(true);
    const newScore = data.text.reduce((acc, part) => {
      if (typeof part !== "string") {
        const userAnswer = getValues(part.id);
        if (userAnswer && userAnswer.trim().toLowerCase() === part.answer.toLowerCase()) {
          return acc + 1;
        }
      }
      return acc;
    }, 0);
    setScore(newScore);
    saveScore(newScore);
  };

  const saveScore = (newScore) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("https://manelgram112.pythonanywhere.com/api/testresults/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      body: JSON.stringify({ level, section, part, model_name: modelName, score: newScore }),
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
    setInputWidths({});
  };

  // Render explicación con números y /texto/ en negrita
  const renderExplanation = () => {
    if (!explanation || !explanation.explanation) return null;
    let text = explanation.explanation;
    
    text = text.replace(/\[(9|10|11|12|13|14|15|16|17|18)\]/g, '[[$1]]');
    
    const parts = [];
    let currentIndex = 0;
    const regex = /(\/.*?\/|\[\[.*?\]\])/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > currentIndex) {
        parts.push({ type: 'text', content: text.substring(currentIndex, match.index) });
      }
      if (match[0].startsWith('/')) {
        const boldText = match[0].slice(1, -1);
        parts.push({ type: 'slash', content: boldText });
      } else if (match[0].startsWith('[[')) {
        const numberText = match[0].slice(2, -2);
        parts.push({ type: 'number', content: numberText });
      }
      currentIndex = match.index + match[0].length;
    }
    
    if (currentIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(currentIndex) });
    }

    return (
      <div
        className={`transition-all duration-500 overflow-hidden ${
          showExplanation ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 border-b border-amber-100">
            <h3 className="text-base font-semibold text-amber-700 uppercase tracking-wide">
              Transcript
            </h3>
          </div>
          <div className="p-5">
            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
              {parts.map((part, i) => {
                if (part.type === 'slash') {
                  return (
                    <strong key={i} className="font-semibold text-gray-900 bg-amber-50 px-0.5 rounded">
                      {part.content}
                    </strong>
                  );
                } else if (part.type === 'number') {
                  return (
                    <strong key={i} className="font-semibold text-amber-800 bg-amber-100 px-1 rounded">
                      [{part.content}]
                    </strong>
                  );
                } else {
                  return <span key={i}>{part.content}</span>;
                }
              })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderText = () => {
    let elements = [];
    
    data.text.forEach((part, i) => {
      if (typeof part === "string") {
        elements.push(<span key={i}>{part}</span>);
      } else {
        const userAnswer = watch(part.id) || "";
        const isCorrect = showResults && userAnswer.trim().toLowerCase() === part.answer.toLowerCase();
        const width = inputWidths[part.id] || 140;

        let inputClasses = "inline-block mx-1 px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-sm";
        let inputValue = userAnswer;
        
        if (showResults) {
          if (isCorrect) {
            inputClasses += " bg-green-100 border-green-500 text-green-800";
          } else {
            inputClasses += " bg-red-100 border-red-500 text-red-800 line-through";
            inputValue = userAnswer; // Mostrar lo que escribió el usuario, tachado
          }
        } else {
          inputClasses += " bg-white border-gray-300 hover:border-blue-400";
        }

        elements.push(
          <span key={i} className="inline-flex items-center flex-wrap">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-sm mr-1">
              {part.id}
            </span>
            <input
              type="text"
              {...register(part.id)}
              value={inputValue}
              onChange={(e) => {
                if (!showResults) {
                  setValue(part.id, e.target.value);
                }
              }}
              className={inputClasses}
              style={{ width: `${width}px` }}
              disabled={showResults}
              placeholder=""
              autoComplete="off"
            />
            {/* Mostrar la respuesta correcta a la derecha si está en modo resultados y es incorrecta */}
            {showResults && !isCorrect && (
              <span className="ml-2 text-sm text-green-700 font-medium">
                ✓ {part.answer}
              </span>
            )}
            {showResults && isCorrect && (
              <span className="ml-2 text-sm text-green-700 font-medium">
                ✓
              </span>
            )}
          </span>
        );
      }
    });
    
    return elements;
  };

  const total = data.text.filter((part) => typeof part !== "string").length;

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

      {enunciado && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-7 rounded-r-md">
          <p className="text-blue-800 text-base font-medium">
            {enunciado}
          </p>
        </div>
      )}

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

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed">
            {renderText()}
          </p>
        </div>
      </div>

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

      <div className="flex flex-wrap gap-4 justify-start mt-6">
        {!showResults ? (
          <button
            onClick={handleSubmit(onSubmit)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-base"
          >
            Check Answers
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowExplanation((v) => !v)}
              className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200 text-base"
            >
              {showExplanation ? "Hide Transcript" : "Show Transcript"}
            </button>
            <button
              onClick={resetTest}
              className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200 text-base"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {renderExplanation()}
    </div>
  );
}

export default LS_2_B1;