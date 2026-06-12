import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { componentMap } from "../components/getCookie"; // ✅ nombre confuso, pero funciona

function ExercisePage() {
  const { level, section, part, model } = useParams();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userToken = localStorage.getItem("token");

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(
      `https://manelgram112.pythonanywhere.com/api/exercises/?level=${level}&section=${section}&part=${part}&model_name=${model}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Respuesta de la API:", data);
        
        const exercises = data.results || [];
        setExercise(exercises[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError(err.message);
        setExercise(null);
        setLoading(false);
      });
  }, [level, section, part, model]);

  // ✅ CORRECCIÓN AQUÍ: nivel -> sección -> parte
  const PartComponent = componentMap?.[level?.toUpperCase()]?.[section]?.[parseInt(part)];

  // Debug: ver qué está pasando
  console.log("Level:", level);
  console.log("Section:", section);
  console.log("Part:", part);
  console.log("ComponentMap para este nivel:", componentMap?.[level?.toUpperCase()]);
  console.log("Componente encontrado:", PartComponent);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">
        {level} - {section} - Parte {part} - {model}
      </h1>

      {loading && (
        <div className="text-center text-gray-500 animate-pulse">
          Cargando ejercicio...
        </div>
      )}

      {error && (
        <div className="text-red-600 font-semibold p-4 bg-red-50 rounded">
          Error: {error}
        </div>
      )}

      {!loading && !exercise && !error && (
        <div className="text-red-600 font-semibold p-4 bg-red-50 rounded">
          No se encontró el ejercicio.
        </div>
      )}

      {!loading && exercise && PartComponent && (
        <PartComponent
          data={exercise.content}
          level={level}
          section={section}
          part={parseInt(part)}
          modelName={model}
          userToken={userToken}
          video={exercise.video}
          explanation={exercise.explanation}
          enunciado={exercise.enunciado}
        />
      )}

      {!loading && exercise && !PartComponent && (
        <div className="text-red-600 font-semibold p-4 bg-red-50 rounded">
          No hay componente definido para {level} - {section} - Parte {part}
        </div>
      )}
    </div>
  );
}

export default ExercisePage;