import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function ModelSelector() {
  const { level, section, part } = useParams();
  const navigate = useNavigate();

  const [modelos, setModelos] = useState([]);
  const [bestScores, setBestScores] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const maxScoresBySection = {
    reading: { 1: 8, 5: 12, 6: 12, 7: 10 },
    use_of_english: { 2: 8, 3: 8, 4: 12 },
    listening: { 1: 8, 2: 10, 3: 5, 4: 7 },
    writing: { 1: 42 },
    speaking: { 1: 42 },
  };

  const maxScore = maxScoresBySection[section]?.[part] || 10;

  // Emojis for each section
  const sectionEmojis = {
    reading: "📖",
    use_of_english: "📝",
    listening: "🎧",
    writing: "✍️",
    speaking: "🎙️",
  };

  const sectionEmoji = sectionEmojis[section] || "📚";
  const isListening = section === "listening";
  const buttonColor = isListening ? "from-orange-500 to-orange-600" : "from-blue-500 to-blue-600";
  const hoverBg = isListening ? "hover:bg-orange-50" : "hover:bg-blue-50";
  const textColor = isListening ? "text-orange-700" : "text-blue-700";
  const badgeColor = isListening ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700";

  // 🚀 Función para obtener TODOS los ejercicios (todas las páginas)
  const fetchAllExercises = async (url) => {
    const token = localStorage.getItem("token");
    let allResults = [];
    let nextUrl = url;

    try {
      while (nextUrl) {
        const response = await fetch(nextUrl, {
          headers: token ? { Authorization: `Token ${token}` } : {},
        });
        
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        
        const data = await response.json();
        
        allResults = [...allResults, ...data.results];
        nextUrl = data.next;
      }
      return allResults;
    } catch (err) {
      throw err;
    }
  };

  // 📚 useEffect 1: Cargar todos los modelos (con paginación)
  useEffect(() => {
    setLoading(true);
    setError(null);

    const apiUrl = `https://manelgram112.pythonanywhere.com/api/exercises/?level=${level}&section=${section}&part=${part}`;
    
    fetchAllExercises(apiUrl)
      .then((allEjercicios) => {
        const modelosUnicos = [...new Set(allEjercicios.map((ej) => ej.model_name))];
        setModelos(modelosUnicos);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [level, section, part]);

  // 👤 useEffect 2: Verificar si el usuario es premium
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsPremium(false);
      return;
    }

    fetch("https://manelgram112.pythonanywhere.com/user/profile/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener perfil");
        return res.json();
      })
      .then((data) => {
        setIsPremium(data.is_premium);
      })
      .catch((err) => {
        console.error("Error al obtener perfil de usuario", err);
        setIsPremium(false);
      });
  }, []);

  // 🏆 useEffect 3: Cargar mejores puntuaciones del usuario
  useEffect(() => {
    if (modelos.length === 0) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(
      `https://manelgram112.pythonanywhere.com/api/testresults/best/?level=${level}&section=${section}&part=${part}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching best scores");
        return res.json();
      })
      .then((results) => {
        const scoresMap = {};
        results.forEach((r) => {
          scoresMap[r.model_name] = r.best_score;
        });
        setBestScores(scoresMap);
      })
      .catch((err) => {
        console.error("Error al cargar puntuaciones:", err);
      });
  }, [modelos, level, section, part]);

  // 🎨 Renderizado condicional
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading models...</p>
        </div>
      </div>
    );
  
  if (error) 
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-600 text-center p-4 bg-red-50 rounded-xl border border-red-200">
          Error: {error}
        </div>
      </div>
    );
  
  if (modelos.length === 0)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center text-gray-500 p-4">
          No models available for this part.
        </div>
      </div>
    );

  // 🖼️ Renderizado principal
  return (
    <div className="flex justify-center items-start min-h-screen pt-12">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            <span className="text-lg">←</span>
          </button>
          <h2 className="text-2xl font-bold text-center text-gray-800 flex-grow">
            {sectionEmoji} Part {part} ({section})
          </h2>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {modelos.map((model, index) => {
            const score = bestScores[model];
            const isFail = score !== undefined && score < maxScore * 0.6;
            const locked = !isPremium && index >= 1;

            return (
              <div key={model} className="relative">
                <button
                  onClick={() => {
                    if (locked) {
                      alert("This model is only for premium users.");
                      navigate("/payment_plans_views");
                      return;
                    }
                    navigate(`/${level}/${section}/part/${part}/model/${model}`);
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    locked 
                      ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed" 
                      : `border-gray-200 bg-white hover:shadow-lg hover:border-${isListening ? 'orange' : 'blue'}-300 hover:scale-[1.02]`
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <span className={`font-semibold ${locked ? "text-gray-500" : textColor}`}>
                      {model}
                    </span>
                    
                    {score !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          isFail ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        }`}>
                          {score}/{maxScore}
                        </span>
                      </div>
                    )}
                  </div>
                </button>

                {locked && (
                  <div className="absolute -top-2 -right-2">
                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 rounded-full font-bold shadow-md">
                      🔒 Premium
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ModelSelector;