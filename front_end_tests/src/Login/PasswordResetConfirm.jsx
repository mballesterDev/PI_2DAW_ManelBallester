import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PasswordResetConfirm() {
  const { uid, token } = useParams();
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Validación frontend antes de enviar
  const validatePasswords = () => {
    const newErrors = {};

    if (newPassword1.length < 8) {
      newErrors.newPassword1 = ["Password must be at least 8 characters"];
    }
    if (/^\d+$/.test(newPassword1)) {
      newErrors.newPassword1 = [
        ...(newErrors.newPassword1 || []),
        "Password cannot be entirely numeric",
      ];
    }
    if (newPassword1 !== newPassword2) {
      newErrors.newPassword2 = ["Passwords do not match"];
    }

    return newErrors;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validatePasswords();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const res = await fetch(
        "https://manelgram112.pythonanywhere.com/dj-rest-auth/password/reset/confirm/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            token,
            new_password1: newPassword1,
            new_password2: newPassword2,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("✅ Password changed successfully! Redirecting...");
        setErrors({});
        setTimeout(() => navigate("/login"), 1500);
      } else {
        // ✅ Errores del backend (en formato {new_password1: [...], new_password2: [...]})
        setErrors(data);
        setSuccessMessage("");
      }
    } catch {
      setErrors({ non_field_errors: ["Server error, please try again later"] });
    }
  }

  const renderFieldErrors = (field) => {
    if (errors[field]) {
      return errors[field].map((msg, i) => (
        <p key={i} className="text-red-500 text-sm mt-1">
          {msg}
        </p>
      ));
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-8 w-full max-w-md shadow-md text-center"
      >
        <h2 className="text-3xl font-bold text-blue-600 mb-6">
          Set New Password
        </h2>

        <input
          type="password"
          placeholder="New password"
          value={newPassword1}
          onChange={(e) => setNewPassword1(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {renderFieldErrors("newPassword1")}
        {renderFieldErrors("new_password1")}

        <input
          type="password"
          placeholder="Confirm new password"
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {renderFieldErrors("newPassword2")}
        {renderFieldErrors("new_password2")}

        {renderFieldErrors("non_field_errors")}

        <button
          type="submit"
          className="w-full mt-6 bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          Reset Password
        </button>

        {successMessage && (
          <p className="mt-4 text-green-600 font-semibold">{successMessage}</p>
        )}
      </form>
    </div>
  );
}
