import { Link } from "react-router-dom";

function LevelSelector() {
  return (
    
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Selecciona el nivel</h2>
      <div className="flex gap-4">
        <Link to="/B2" className="px-4 py-2 bg-blue-500 text-white rounded">B2</Link>
        <Link to="/C1" className="px-4 py-2 bg-blue-500 text-white rounded">C1</Link>
      </div>
    </div>
  );
}

export default LevelSelector;
