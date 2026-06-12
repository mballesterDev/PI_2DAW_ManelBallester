import { useEffect } from "react";

function LoadCSRF() {
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/csrf_cookie/", {
      credentials: "include",
    });
  }, []);

  return null; // No renderiza nada
}

export default LoadCSRF;
