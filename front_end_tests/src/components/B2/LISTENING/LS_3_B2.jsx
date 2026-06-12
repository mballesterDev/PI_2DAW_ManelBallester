import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function LS_3_B2({ data, level, section, part, modelName, video, explanation, enunciado }) {
  const navigate = useNavigate();

  const [userAnswers, setUserAnswers] = useState({});
  const [usedAnswers, setUsedAnswers] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(null);

  // Números de pregunta para cada speaker (19-23)
  const questionNumbers = [19, 20, 21, 22, 23];

  useEffect(() => {
    if (!level || !section || !part || !modelName) return;
    if (!data) return;
    fetchBestScore();
    
    const initialAnswers = {};
    data.speakers?.forEach((_, index) => {
      initialAnswers[index] = "";
    });
    setUserAnswers(initialAnswers);
  }, [level, section, part, modelName, data]);

  // Auto-show transcript when results are shown
  useEffect(() => {
    if (showResults) {
      setShowTranscript(true);
    }
  }, [showResults]);

  // Track used answers across speakers
  useEffect(() => {
    const used = {};
    Object.values(userAnswers).forEach(answer => {
      if (answer) {
        used[answer] = (used[answer] || 0) + 1;
      }
    });
    setUsedAnswers(used);
  }, [userAnswers]);

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

  const handleAnswerChange = (speakerIndex, optionValue) => {
    setDuplicateWarning(prev => ({ ...prev, [speakerIndex]: false }));
    
    let isDuplicate = false;
    Object.entries(userAnswers).forEach(([index, answer]) => {
      if (answer === optionValue && parseInt(index) !== speakerIndex && optionValue !== "") {
        isDuplicate = true;
      }
    });
    
    if (isDuplicate && optionValue !== "") {
      setDuplicateWarning(prev => ({ ...prev, [speakerIndex]: true }));
    }
    
    setUserAnswers(prev => ({
      ...prev,
      [speakerIndex]: optionValue,
    }));
  };

  const onSubmit = () => {
    let correctCount = 0;
    data.speakers.forEach((speaker, index) => {
      const answer = userAnswers[index];
      if (answer && answer !== "") {
        if (answer === speaker.correctAnswer) {
          correctCount++;
        }
      }
    });
    
    setScore(correctCount);
    setShowResults(true);
    setShowCorrectAnswers(true);
    saveScore(correctCount);
  };

  const resetTest = () => {
    const initialAnswers = {};
    data.speakers.forEach((_, index) => {
      initialAnswers[index] = "";
    });
    setUserAnswers(initialAnswers);
    setDuplicateWarning({});
    setShowResults(false);
    setShowCorrectAnswers(false);
    setShowTranscript(false);
    setScore(0);
  };

  const isOptionUsedElsewhere = (optionValue, currentSpeakerIndex) => {
    if (!optionValue) return false;
    return Object.entries(userAnswers).some(([index, answer]) => 
      answer === optionValue && parseInt(index) !== currentSpeakerIndex
    );
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  const getLetterForOption = (optionText) => {
    const index = data.options.findIndex(opt => opt === optionText);
    if (index !== -1) {
      return getOptionLetter(index);
    }
    return "";
  };

  // Render transcript with bold keywords
  const renderExplanation = () => {
    if (!explanation || !explanation.explanation) return null;
    let text = explanation.explanation;
    
    text = text.replace(/\[(19|20|21|22|23)\]/g, '[[$1]]');
    
    const parts = [];
    let currentIndex = 0;
    const regex = /(\/\/.*?\/\/|\/.*?\/|\[\[.*?\]\])/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > currentIndex) {
        parts.push({ type: 'text', content: text.substring(currentIndex, match.index) });
      }
      if (match[0].startsWith('//')) {
        const boldText = match[0].slice(2, -2);
        parts.push({ type: 'speaker', content: boldText });
      } else if (match[0].startsWith('/') && !match[0].startsWith('//')) {
        const boldText = match[0].slice(1, -1);
        parts.push({ type: 'evidence', content: boldText });
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
          showTranscript ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 border-b border-amber-100">
            <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
              Transcription
            </h3>
          </div>
          <div className="p-5">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {parts.map((part, i) => {
                if (part.type === 'speaker') {
                  return (
                    <strong key={i} className="font-bold text-amber-800 text-base inline-block mr-2">
                      {part.content}
                    </strong>
                  );
                } else if (part.type === 'evidence') {
                  return (
                    <strong key={i} className="font-semibold text-amber-800 bg-amber-100 px-0.5 rounded">
                      {part.content}
                    </strong>
                  );
                } else if (part.type === 'number') {
                  return (
                    <strong key={i} className="font-semibold text-amber-800 bg-amber-100 px-0.5 rounded">
                      [{part.content}]
                    </strong>
                  );
                } else {
                  return <span key={i}>{part.content}</span>;
                }
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!data) return <p className="text-center text-gray-500 text-base">Loading exercise...</p>;

  const answeredCount = Object.values(userAnswers).filter(answer => answer && answer !== "").length;
  const totalQuestions = data.speakers.length;

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
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-12">
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
            Score: {score} / {totalQuestions}
          </p>
          {bestScore !== null && (
            <p className={`text-lg font-semibold ${
              bestScore < totalQuestions / 2 ? "text-red-600" : "text-green-600"
            }`}>
              Best score: {bestScore} / {totalQuestions}
            </p>
          )}
        </div>
      )}

      {/* Progress indicator */}
      {!showResults && (
        <div className="text-right text-sm text-gray-500 mb-4">
          Answered: {answeredCount} / {totalQuestions}
        </div>
      )}

      {/* Main grid: Speakers + Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Speakers */}
        <div className="lg:col-span-2 space-y-6">
          {data.speakers.map((speaker, idx) => {
            const selectedAnswer = userAnswers[idx];
            const isCorrect = showResults && selectedAnswer === speaker.correctAnswer;
            const isWrong = showResults && selectedAnswer !== speaker.correctAnswer && selectedAnswer !== "";
            const isUsedElsewhere = !showResults && isOptionUsedElsewhere(selectedAnswer, idx);
            const correctLetter = getLetterForOption(speaker.correctAnswer);
            const questionNumber = questionNumbers[idx];
            
            let selectClasses = "w-full px-3 py-2.5 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 appearance-none cursor-pointer text-base bg-white";
            
            if (showCorrectAnswers) {
              if (selectedAnswer !== speaker.correctAnswer && selectedAnswer !== "") {
                selectClasses += " line-through text-gray-400 border-gray-300";
              } else if (selectedAnswer === speaker.correctAnswer) {
                selectClasses += " border-green-500 text-green-700 bg-green-50";
              } else {
                selectClasses += " border-gray-300";
              }
            } else if (showResults) {
              if (isCorrect) {
                selectClasses += " border-green-500 text-green-700 bg-green-50";
              } else if (isWrong) {
                selectClasses += " border-red-400 text-red-500 line-through bg-red-50";
              } else {
                selectClasses += " border-gray-300";
              }
            } else {
              if (isUsedElsewhere) {
                selectClasses += " line-through text-gray-400 border-amber-300 bg-amber-50";
              } else {
                selectClasses += " border-gray-300 hover:border-gray-400";
              }
            }
            
            return (
              <div key={idx} className="space-y-1 pb-6 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4 py-2">
                  <div className="min-w-[100px] flex items-center gap-2">
    
                    <span className="inline-flex items-center justify-center p-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-sm mr-1">
                      {questionNumber}
                    </span>
                    <span className="font-medium text-gray-700 text-base">
                      {speaker.name || `Speaker ${idx + 1}`}
                    </span>
                  </div>
                  
                  <div className="flex-1 relative">
                    <select
                      value={selectedAnswer}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      disabled={showResults}
                      className={selectClasses}
                    >
                      <option value="">Select answer</option>
                      {data.options.map((option, optIdx) => {
                        const isUsedByOther = !showResults && !showCorrectAnswers && isOptionUsedElsewhere(option, idx);
                        const letter = getOptionLetter(optIdx);
                        return (
                          <option key={optIdx} value={option} disabled={isUsedByOther}>
                            {letter}. {option} {isUsedByOther ? "(already used)" : ""}
                          </option>
                        );
                      })}
                    </select>
                    
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {showResults && (
                    <div className="min-w-[28px] text-center">
                      {isCorrect && (
                        <svg className="w-5 h-5 text-green-500 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isWrong && (
                        <svg className="w-5 h-5 text-red-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                
                {duplicateWarning[idx] && (
                  <div className="text-sm text-amber-600 ml-[100px] px-1">
                    ⚠️ This answer has already been selected for another speaker.
                  </div>
                )}
                
                {/* Mostrar la respuesta correcta con su letra */}
                {showResults && selectedAnswer !== speaker.correctAnswer && (
                  <div className="ml-[100px] mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Correct answer:</span>{' '}
                    <span className="font-medium">{correctLetter}.</span> {speaker.correctAnswer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column - Options list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-6 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Options
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {data.options.map((option, idx) => {
                const letter = getOptionLetter(idx);
                return (
                  <div 
                    key={idx} 
                    className="text-base text-gray-600 py-2 px-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-500 mr-2 w-6 inline-block">
                      {letter}.
                    </span>
                    {option}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="mt-8 pt-4 flex flex-wrap gap-4 justify-start">
        {!showResults ? (
          <button
            onClick={onSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-base"
          >
            Check Answers
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200 text-base"
            >
              {showTranscript ? "Hide Transcription" : "Show Transcription"}
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

      {/* Transcript section */}
      {renderExplanation()}
    </div>
  );
}

export default LS_3_B2;