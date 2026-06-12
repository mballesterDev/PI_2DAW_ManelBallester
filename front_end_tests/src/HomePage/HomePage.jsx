import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function HomePage() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  
  const phrases = [
    "Start studying now with more than 50 available tests!",
    "Practice with real Cambridge exam questions!",
    "Track your progress and improve your score!"
  ];
  
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseBetweenPhrases = 2000;

  useEffect(() => {
    let timeout;
    
    const currentPhrase = phrases[index];
    
    if (isDeleting) {
      if (text.length > 0) {
        timeout = setTimeout(() => {
          setText(text.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % phrases.length);
      }
    } else {
      if (text.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setText(currentPhrase.slice(0, text.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseBetweenPhrases);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, phrases]);

  const handleComingSoon = (level) => {
    setSelectedLevel(level);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLevel("");
  };

  return (
    <>
      <div
        className="w-full min-h-screen bg-cover bg-bottom bg-no-repeat text-center flex flex-col justify-center items-center px-4"
        style={{ backgroundImage: "url('/data/imgs/portada_fondo.jpg')" }}
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Título principal - Usa la fuente por defecto de Tailwind */}
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white drop-shadow-xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent drop-shadow-none">
                Test Yourself
              </span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Subtítulo con efecto máquina de escribir - Fuente por defecto */}
          <div className="mb-12 h-20">
            <p className="text-xl md:text-2xl text-white drop-shadow-lg max-w-2xl mx-auto">
              {text}
              <span className="inline-block w-0.5 h-6 md:h-7 bg-white ml-1 animate-pulse"></span>
            </p>
          </div>

          {/* Level Buttons Section - Usa Poppins para los niveles */}
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-poppins text-3xl font-bold text-center text-white drop-shadow-md mb-8">
              Choose your level
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* B1 Button - Coming Soon */}
              <div
                onClick={() => handleComingSoon("B1")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <div className="relative z-10">
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="font-poppins text-2xl font-bold mb-1">B1</h3>
                  <p className="font-poppins text-sm opacity-90 mb-3">Intermediate</p>
                  <p className="font-poppins text-xs opacity-75">PET - Preliminary English Test</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold bg-white/20 rounded-full px-4 py-2 w-fit group-hover:bg-white/30 transition-all">
                    <span>Start B1</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* B2 Button - ACTIVE */}
              <Link
                to="/B2"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="relative z-10">
                  <div className="text-5xl mb-4">📘</div>
                  <h3 className="font-poppins text-2xl font-bold mb-1">B2</h3>
                  <p className="font-poppins text-sm opacity-90 mb-3">Upper Intermediate</p>
                  <p className="font-poppins text-xs opacity-75">FCE - First Certificate</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold bg-white/20 rounded-full px-4 py-2 w-fit group-hover:bg-white/30 transition-all">
                    <span>Start B2</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* C1 Button - ACTIVE */}
              <Link
                to="/C1"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="relative z-10">
                  <div className="text-5xl mb-4">🎓</div>
                  <h3 className="font-poppins text-2xl font-bold mb-1">C1</h3>
                  <p className="font-poppins text-sm opacity-90 mb-3">Advanced</p>
                  <p className="font-poppins text-xs opacity-75">CAE - Advanced Certificate</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold bg-white/20 rounded-full px-4 py-2 w-fit group-hover:bg-white/30 transition-all">
                    <span>Start C1</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* C2 Button - Coming Soon */}
              <div
                onClick={() => handleComingSoon("C2")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <div className="relative z-10">
                  <div className="text-5xl mb-4">🏆</div>
                  <h3 className="font-poppins text-2xl font-bold mb-1">C2</h3>
                  <p className="font-poppins text-sm opacity-90 mb-3">Proficiency</p>
                  <p className="font-poppins text-xs opacity-75">CPE - Proficiency</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold bg-white/20 rounded-full px-4 py-2 w-fit group-hover:bg-white/30 transition-all">
                    <span>Start C2</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Coming Soon */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform animate-scaleIn">
            <div className={`bg-gradient-to-r p-6 text-center ${
              selectedLevel === "B1" 
                ? "from-green-500 to-green-600" 
                : "from-red-500 to-red-600"
            }`}>
              <div className="text-6xl mb-3">
                {selectedLevel === "B1" ? "🌱" : "🏆"}
              </div>
              <h3 className="text-3xl font-bold text-white">
                Level {selectedLevel}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {selectedLevel === "B1" ? "Preliminary English Test" : "Certificate of Proficiency"}
              </p>
            </div>
            
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M12 8v4l3 3" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">
                🚀 Coming Soon!
              </h4>
              <p className="text-gray-600 mb-6">
                We're working hard to prepare the {selectedLevel} level content. 
                It will be available soon. Stay tuned!
              </p>
              <button
                onClick={closeModal}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.02] ${
                  selectedLevel === "B1" 
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg" 
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg"
                }`}
              >
                Got it! 👌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos de animación */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default HomePage;