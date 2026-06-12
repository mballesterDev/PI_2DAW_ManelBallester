import { useEffect, useState } from "react";

function ExerciseInfo({ timer, tips, videoUrl }) {
  const [timeLeft, setTimeLeft] = useState(timer * 60);
  const [running, setRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!running) return;

    if (timeLeft <= 0) {
      setRunning(false);
      setShowModal(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [running, timeLeft]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const [openSections, setOpenSections] = useState({
    timer: true,
    tips: false,
    video: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-4">
      {/* TIMER - Mac Black Style with Emoji */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection("timer")}
          className="w-full bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3 flex justify-between items-center hover:from-gray-900 hover:to-gray-950 transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">⏱️</span>
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide ml-1">Timer</span>
          </div>
          <span className="text-gray-400 text-lg">{openSections.timer ? "▲" : "▼"}</span>
        </button>
        
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSections.timer ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-5 bg-white">
            <div className="flex justify-between items-center mb-4">
              <div className="text-3xl font-mono font-bold text-gray-800">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-400">
                Recommended: {timer} min
              </div>
            </div>

            <div className="flex gap-2">
              {!running && timeLeft === timer * 60 && (
                <button
                  onClick={() => setRunning(true)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  ▶️ Start
                </button>
              )}
              {running && (
                <button
                  onClick={() => setRunning(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  ⏸️ Pause
                </button>
              )}
              {!running && timeLeft !== timer * 60 && timeLeft !== 0 && (
                <button
                  onClick={() => setRunning(true)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  ▶️ Resume
                </button>
              )}
              {!running && timeLeft !== timer * 60 && (
                <button
                  onClick={() => setTimeLeft(timer * 60)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                >
                  🔄 Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TIPS - Mac Black Style with Emoji */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection("tips")}
          className="w-full bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3 flex justify-between items-center hover:from-gray-900 hover:to-gray-950 transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide ml-1">Tips</span>
          </div>
          <span className="text-gray-400 text-lg">{openSections.tips ? "▲" : "▼"}</span>
        </button>
        
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSections.tips ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-5 bg-white">
            {Array.isArray(tips) ? (
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-blue-500">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-sm">{tips}</p>
            )}
          </div>
        </div>
      </div>

      {/* VIDEO - Mac Black Style with Emoji */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection("video")}
          className="w-full bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3 flex justify-between items-center hover:from-gray-900 hover:to-gray-950 transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎬</span>
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide ml-1">Video</span>
          </div>
          <span className="text-gray-400 text-lg">{openSections.video ? "▲" : "▼"}</span>
        </button>
        
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            openSections.video ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-5 bg-white">
            {videoUrl ? (
              <iframe
                width="100%"
                height="200"
                src={videoUrl}
                title="Video explicativo"
                frameBorder="0"
                allowFullScreen
                className="rounded-xl"
              />
            ) : (
              <div className="text-gray-400 text-sm italic text-center py-4">
                🎬 No video available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL - Mac Black Style with Emoji */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border-2 border-gray-800 pointer-events-auto animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-3xl">⏰</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Time is over!</h2>
            <p className="text-gray-500 mb-6">Don't worry, keep practicing! 💪</p>
            <button
              onClick={() => {
                setShowModal(false);
                setTimeLeft(timer * 60);
              }}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-gray-900 hover:to-gray-950 transition-all duration-200"
            >
              Close ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseInfo;