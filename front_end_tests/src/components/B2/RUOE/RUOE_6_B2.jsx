import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ExerciseInfo from "../../../pages/ExerciseInfo";

function RUOE_6_B2({ data, level, section, part, modelName, video, explanation }) {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);
  const [highlights, setHighlights] = useState([]);

  const resultsRef = useRef(null);
  const fragmentsRef = useRef(null);
  const topRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!level || !section || !part || !modelName) return;
    if (!data) return;
    fetchBestScore();
    loadHighlightsFromStorage();
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

  const loadHighlightsFromStorage = () => {
    const savedHighlights = localStorage.getItem(`highlights_${modelName}_${part}`);
    if (savedHighlights) {
      setHighlights(JSON.parse(savedHighlights));
    }
  };

  const saveHighlightsToStorage = (newHighlights) => {
    localStorage.setItem(`highlights_${modelName}_${part}`, JSON.stringify(newHighlights));
  };

  const handleTextHighlight = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && selectedText.length > 0) {
      const alreadyExists = highlights.some(h => 
        h.text === selectedText || 
        (selectedText.includes(h.text) && h.text.length > 20) ||
        (h.text.includes(selectedText) && selectedText.length > 20)
      );
      
      if (!alreadyExists && selectedText.length < 500) {
        const newHighlight = {
          id: Date.now(),
          text: selectedText,
          timestamp: new Date().toISOString()
        };
        
        const updatedHighlights = [...highlights, newHighlight];
        setHighlights(updatedHighlights);
        saveHighlightsToStorage(updatedHighlights);
      }
      
      selection.removeAllRanges();
    }
  };

  const removeHighlight = (highlightId) => {
    const updatedHighlights = highlights.filter(h => h.id !== highlightId);
    setHighlights(updatedHighlights);
    saveHighlightsToStorage(updatedHighlights);
  };

  const clearAllHighlights = () => {
    setHighlights([]);
    saveHighlightsToStorage([]);
  };

  const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const renderFragmentsWithHighlights = () => {
    if (highlights.length === 0) {
      return data.options.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        return (
          <div key={idx} className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs font-bold rounded-full shadow-sm">
              {letter}
            </span>
            <span className="text-gray-700 text-sm">{opt}</span>
          </div>
        );
      });
    }

    return data.options.map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      let result = opt;
      
      const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);
      
      sortedHighlights.forEach(highlight => {
        const escapedText = escapeRegex(highlight.text);
        const regex = new RegExp(`(${escapedText})`, 'gi');
        result = result.replace(regex, `<mark class="bg-yellow-200 rounded px-0.5">$1</mark>`);
      });
      
      return (
        <div key={idx} className="flex items-start gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs font-bold rounded-full shadow-sm">
            {letter}
          </span>
          <span 
            className="text-gray-700 text-sm"
            dangerouslySetInnerHTML={{ __html: result }}
          />
        </div>
      );
    });
  };

  if (!data) return <p className="text-center">Loading test...</p>;

  const total = data.text.filter((p) => typeof p !== "string").length;
  const maxScore = total * 2;

  const checkAnswers = () => {
    let newScore = 0;
    data.text.forEach((part) => {
      if (typeof part !== "string") {
        const userAnswer = answers[part.id];
        if (userAnswer && userAnswer === part.answer) newScore += 2;
      }
    });
    setScore(newScore);
    setShowResults(true);
    setShowExplanations(true);
    setShowCorrectAnswers(true);

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

  const resetTest = () => {
    setAnswers({});
    setShowResults(false);
    setShowCorrectAnswers(false);
    setShowExplanations(false);
    setScore(0);
    clearAllHighlights();
    
    setTimeout(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  const handleChange = (e, id) => {
    if (!showResults) {
      setAnswers((prev) => ({ ...prev, [id]: e.target.value }));
    }
  };

  let questionCounter = 0;

  const renderText = () => {
    questionCounter = 0;
    return data.text.map((part, index) => {
      if (typeof part === "string") return <span key={index}>{part}</span>;

      questionCounter++;
      const userAnswer = answers[part.id] || "";
      const isCorrect = userAnswer === part.answer;
      const questionNumber = 37 + questionCounter - 1;

      let optionStyle = "border-gray-300 bg-white";
      let showCheckIcon = false;
      let showWrongIcon = false;
      
      if (showResults) {
        if (userAnswer === part.answer && userAnswer !== "") {
          optionStyle = "border-green-500 bg-green-100";
          showCheckIcon = true;
        }
        else if (userAnswer !== "" && userAnswer !== part.answer) {
          optionStyle = "border-red-500 bg-red-100";
          showWrongIcon = true;
        }
      }

      return (
        <span key={part.id} className="inline-flex items-center mx-1 my-1">
          <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-sm mr-1">
            {questionNumber}
          </span>
          <select
            value={userAnswer}
            onChange={(e) => handleChange(e, part.id)}
            disabled={showResults}
            className={`p-1 cursor-pointer rounded-md border text-sm transition-all duration-200 ${optionStyle}`}
          >
            <option value="" disabled hidden>
              Select
            </option>
            {data.options.map((option, i) => {
              const letter = String.fromCharCode(65 + i);
              return (
                <option key={i} value={option}>
                  {letter}) {option}
                </option>
              );
            })}
          </select>
          {showCheckIcon && (
            <span className="ml-1 text-green-600 font-bold text-sm">✓</span>
          )}
          {showWrongIcon && (
            <span className="ml-1 text-red-600 font-bold text-sm">✗</span>
          )}
        </span>
      );
    });
  };

  const renderExplanations = () => {
    if (!explanation) return null;

    const explanationEntries = Object.entries(explanation);
    let explanationCounter = 37;

    return (
      <div
        className={`transition-all duration-1000 ease-in-out overflow-hidden ${
          showExplanations ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 border-b border-amber-100">
            <h3 className="text-base font-semibold text-amber-700 uppercase tracking-wide">
              Explanations (37-43)
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {explanationEntries.map(([key, text]) => {
                const currentNumber = explanationCounter;
                explanationCounter++;
                const letter = String.fromCharCode(65 + parseInt(key, 10));
                return (
                  <p key={key} className="text-gray-700 text-base leading-loose">
                    <strong className="font-bold text-gray-900 mr-2">
                      {currentNumber}.
                    </strong>
                    <strong className="font-semibold text-gray-900 bg-amber-50 px-0.5 rounded">
                      {letter}
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

  const tips = [
    "📝 Select any text in the fragments to highlight it.",
    "🗑️ Click the X in the floating panel to remove a highlight.",
    "🧹 Use 'Clear All' to remove all highlights.",
    "Read the entire paragraph before choosing the fragment.",
    "Think about logical sequence and coherence between sentences.",
    "Look for connectors or reference words indicating continuity.",
  ];

  return (
    <div ref={topRef} className="max-w-7xl mx-auto p-7">
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

      {/* Grid de 2 columnas: izquierda texto, derecha fragments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna izquierda - Texto del ejercicio (70% = 8/12) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-blue-100">
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                📖 Reading Text
              </h3>
            </div>
            <div className="p-6 max-h-[650px] overflow-y-auto custom-scrollbar">
              <p 
                className="text-gray-700 text-base leading-loose"
                style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
              >
                {renderText()}
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha - Available fragments (30% = 4/12) con highlight habilitado */}
        <div className="lg:col-span-4 space-y-4">
          <div 
            ref={fragmentsRef}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            onMouseUp={handleTextHighlight}
            style={{ userSelect: 'text' }}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                📋 Available fragments
              </h3>
              <div className="flex gap-2">
                {highlights.length > 0 && (
                  <button
                    onClick={clearAllHighlights}
                    className="text-xs px-3 py-1 hover:bg-red-200 hover:cursor-pointer text-red-600 rounded-lg transition font-medium"
                  >
                    Clear All ({highlights.length})
                  </button>
                )}
                <div className="text-xs text-gray-500 px-3 py-1 rounded-lg">
                  💡 Select text to highlight
                </div>
              </div>
            </div>
            <div className="p-4 max-h-[650px] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {renderFragmentsWithHighlights()}
              </div>
            </div>
          </div>

          {/* Resumen de respuestas (se muestra después de check) */}
          {showResults && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-4">
              <div className="px-5 py-3 border-b border-green-100">
                <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                  ❓ Your Answers (37-43)
                </h3>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  {data.text.filter(p => typeof p !== "string").map((part, idx) => {
                    const questionNumber = 37 + idx;
                    const userAnswer = answers[part.id] || "";
                    const isCorrect = userAnswer === part.answer;
                    
                    // Encontrar la letra correspondiente a la respuesta seleccionada
                    const answerIndex = data.options.findIndex(opt => opt === userAnswer);
                    const answerLetter = answerIndex !== -1 ? String.fromCharCode(65 + answerIndex) : "";
                    
                    return (
                      <div key={part.id} className="p-3 border rounded-xl bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                            {questionNumber}
                          </span>
                          <span className="text-sm text-gray-600">
                            {showResults && isCorrect && userAnswer !== "" && (
                              <span className="text-green-600">✓ Correct</span>
                            )}
                            {showResults && !isCorrect && userAnswer !== "" && (
                              <span className="text-red-600">✗ Incorrect</span>
                            )}
                            {showResults && userAnswer === "" && (
                              <span className="text-orange-500">⚠ Not answered</span>
                            )}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          Selected: {userAnswer ? `${answerLetter}) ${userAnswer}` : "—"}
                        </div>
                        {showResults && !isCorrect && userAnswer !== "" && (
                          <div className="mt-1 text-xs text-green-600">
                            Correct answer: {part.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel flotante de highlights */}
      {highlights.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-xl border border-gray-200 p-3 max-w-sm z-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">📌 Highlights ({highlights.length})</span>
            <button
              onClick={clearAllHighlights}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="flex items-center justify-between gap-2 text-sm bg-yellow-50 p-1 rounded">
                <span className="text-xs text-gray-700 truncate flex-1" title={highlight.text}>
                  "{highlight.text.substring(0, 40)}{highlight.text.length > 40 ? '...' : ''}"
                </span>
                <button
                  onClick={() => removeHighlight(highlight.id)}
                  className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de resultados y botones */}
      <div ref={resultsRef} className="mt-8">
        {showResults && (
          <div className="text-center mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
            <p className="text-2xl font-bold text-gray-800">
              Score: {score} / {maxScore}
            </p>
            {bestScore !== null && (
              <p className={`text-lg font-semibold mt-1 ${
                bestScore < maxScore / 2 ? "text-red-600" : "text-green-600"
              }`}>
                🏆 Best score: {bestScore} / {maxScore}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {!showResults ? (
            <button
              onClick={checkAnswers}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 text-base"
            >
              Check Answers
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowExplanations((v) => !v)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-blue-500 hover:to-blue-800 hover:scale-105 transition-all duration-200 text-base"
              >
                {showExplanations ? "Hide Explanations" : "Show Explanations"}
              </button>
              <button
                onClick={resetTest}
                className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 hover:scale-105 transition-all duration-200 text-base"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {/* Explicaciones y ExerciseInfo - full width */}
        <div className="space-y-8">
          <div>
            {renderExplanations()}
          </div>
          <div className="w-full">
            <ExerciseInfo timer={10} tips={tips} videoUrl={video} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
}

export default RUOE_6_B2;