import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import ExerciseInfo from "../../../pages/ExerciseInfo";

function RUOE_7_B2({ data, level, section, part, modelName, video, explanation, enunciado }) {
  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);
  const [highlights, setHighlights] = useState([]);

  const resultsRef = useRef(null);
  const passagesRef = useRef(null);
  const topRef = useRef(null);
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, getValues, reset, watch } = useForm();

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
      
      if (!alreadyExists && selectedText.length < 1000) {
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

  const renderPassagesWithHighlights = () => {
    if (highlights.length === 0) {
      return data.passages.map((p, idx) => (
        <div key={idx}>
          <h4 className="font-bold mb-2 text-gray-800">
            {String.fromCharCode(65 + idx)}) {p.name}
          </h4>
          <p 
            className="text-gray-700 text-base leading-loose"
            style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
          >
            {p.text}
          </p>
        </div>
      ));
    }

    return data.passages.map((p, idx) => {
      let result = p.text;
      const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);
      
      sortedHighlights.forEach(highlight => {
        const escapedText = escapeRegex(highlight.text);
        const regex = new RegExp(`(${escapedText})`, 'gi');
        result = result.replace(regex, `<mark class="bg-yellow-200 rounded px-0.5">$1</mark>`);
      });
      
      return (
        <div key={idx}>
          <h4 className="font-bold mb-2 text-gray-800">
            {String.fromCharCode(65 + idx)}) {p.name}
          </h4>
          <p 
            className="text-gray-700 text-base leading-loose"
            style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
            dangerouslySetInnerHTML={{ __html: result }}
          />
        </div>
      );
    });
  };

  if (!data) return <p className="text-center">Loading test...</p>;

  const total = data.questions.length;
  const maxScore = total;

  const onSubmit = () => {
    let newScore = 0;
    data.questions.forEach((q) => {
      const userAnswer = getValues(q.id.toString());
      if (userAnswer === q.answer) newScore += 1;
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
    reset(); // Resetea el formulario
    setShowResults(false);
    setShowCorrectAnswers(false);
    setShowExplanations(false);
    setScore(0);
    clearAllHighlights(); // 👈 Elimina todos los highlights
    
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

  const renderQuestions = () =>
    data.questions.map((q, index) => {
      const current = watch(q.id.toString());
      const isCorrect = current === q.answer;
      const questionNumber = 43 + index;

      let selectStyle = "border-gray-300 bg-white";
      let showCheckIcon = false;
      let showWrongIcon = false;
      
      if (showResults) {
        if (current === q.answer && current !== "") {
          selectStyle = "border-green-500 bg-green-100";
          showCheckIcon = true;
        }
        else if (current !== "" && current !== q.answer) {
          selectStyle = "border-red-500 bg-red-100";
          showWrongIcon = true;
        }
        else if (current === "") {
          selectStyle = "border-red-500 bg-red-100";
          showWrongIcon = true;
        }
      }

      return (
        <div key={q.id} className="flex items-start gap-3 mt-3 p-3  rounded-xl bg-white hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
            {questionNumber}
          </div>
          <div className="flex-1">
            <p className="mb-2 text-gray-700 text-sm">{q.text}</p>
            <select
              {...register(q.id.toString())}
              disabled={showResults}
              className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${selectStyle}`}
              defaultValue=""
            >
              <option value="" disabled hidden>
                Select answer
              </option>
              {["A", "B", "C", "D"].map((letter) => (
                <option key={letter} value={letter}>
                  {letter}
                </option>
              ))}
            </select>
            {showCheckIcon && (
              <div className="mt-2 text-sm">
                <span className="text-green-600 font-bold">✓ Correct</span>
              </div>
            )}
            {showWrongIcon && (
              <div className="mt-2 text-sm">
                <span className="text-red-600 font-bold">✗ Incorrect</span>
                <span className="text-gray-600 ml-2">
                  (Correct answer: <strong className="text-green-600">{q.answer}</strong>)
                </span>
              </div>
            )}
          </div>
        </div>
      );
    });

  const renderExplanations = () => {
    if (!explanation) return null;

    const explanationEntries = Object.entries(explanation);
    let explanationCounter = 43;

    return (
      <div
        className={`transition-all duration-1000 ease-in-out overflow-hidden ${
          showExplanations ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 border-b border-amber-100">
            <h3 className="text-base font-semibold text-amber-700 uppercase tracking-wide">
              Explanations (43-52)
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {explanationEntries.map(([word, text]) => {
                const currentNumber = explanationCounter;
                explanationCounter++;
                return (
                  <p key={word} className="text-gray-700 text-base leading-loose">
                    <strong className="font-bold text-gray-900 mr-2">
                      {currentNumber}.
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

  const tips = [
    "📝 Select any text in the passages to highlight it.",
    "🗑️ Click the X in the floating panel to remove a highlight.",
    "🧹 Use 'Clear All' or 'Reset' to remove all highlights.",
    "Read all passages carefully before answering.",
    "Look for synonyms or paraphrasing between the texts and the questions.",
    "Don't overthink; choose the option that directly matches the text.",
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

      {/* Grid de 2 columnas: izquierda pasajes, derecha preguntas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna izquierda - Pasajes (70% = 8/12) */}
        <div className="lg:col-span-8 space-y-4">
          <div 
            ref={passagesRef}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            onMouseUp={handleTextHighlight}
            style={{ userSelect: 'text' }}
          >
            <div className="px-5 py-3 border-b border-blue-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                📖 Reading Passages
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
            <div className="p-6 max-h-[650px] overflow-y-auto custom-scrollbar">
              {enunciado && (
                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
                  <p className="text-blue-800 text-sm font-medium">
                    {enunciado}
                  </p>
                </div>
              )}
              <div className="space-y-6">
                {renderPassagesWithHighlights()}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Preguntas (30% = 4/12) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-4">
            <div className="px-5 py-3 border-b border-green-100">
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                ❓ Questions (43-52)
              </h3>
            </div>
            <div className="p-4 max-h-[650px] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {renderQuestions()}
              </form>
            </div>
          </div>
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
              onClick={handleSubmit(onSubmit)}
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
            <ExerciseInfo timer={12} tips={tips} videoUrl={video} />
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

export default RUOE_7_B2;