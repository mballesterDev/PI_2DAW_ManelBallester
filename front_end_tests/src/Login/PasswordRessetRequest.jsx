import React, { useState } from "react";

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("https://manelgram112.pythonanywhere.com/dj-rest-auth/password/reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage("✅ Check your email for the reset link");
      } else {
        const data = await res.json();
        setMessage("❌ " + (data?.email?.[0] || "Something went wrong"));
      }
    } catch {
      setMessage("❌ Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className=" h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 w-full max-w-md text-center"
      >
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          Reset Your Password
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email and we will send you a link to reset your password.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-semibold px-4 py-2 rounded-lg transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </button>

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
