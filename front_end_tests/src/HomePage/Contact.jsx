import React, { useState } from "react";

export const Contact = () => {
  const [name, setName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      "1-to-1 Cambridge Exam Classes Inquiry"
    );
    const body = encodeURIComponent(
      `Hello Manel,\n\nMy name is ${name}.\nI am interested in your 1-to-1 classes to improve all parts of the Cambridge exam.\n\nHere is my message:\n${message}\n\nYou can reply to my email: ${studentEmail}\n\nThank you!`
    );

    window.location.href = `mailto:manelballesterenglish@gmail.com?subject=${subject}&body=${body}`;

    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md mt-12">
      <h2 className="text-3xl font-extrabold mb-4 text-center text-indigo-700">
        Contact Manel
      </h2>
      <p className="text-center font-semibold mb-2">
        I'm the creator of this page, holding a C2 level in English.
      </p>
      <p className="mb-4 text-center text-gray-700">
        I offer <strong>1-to-1 classes</strong> to help you improve <em>all parts</em> of the Cambridge exam.
      </p>
      <p className="text-center mb-6">
        Check out my teaching style on my{" "}
        <a
          href="https://www.youtube.com/channel/yourchannelid"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 font-semibold hover:underline"
        >
          YouTube channel
        </a>
        .
      </p>

      {sent ? (
        <p className="text-green-600 font-semibold text-center">
          Your message has been prepared in your email client. Please review and send it.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="font-medium text-gray-700">Your Name:</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="John Doe"
            />
          </label>

          <label className="block">
            <span className="font-medium text-gray-700">Your Email:</span>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="font-medium text-gray-700">Message:</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Write your questions or details here..."
              required
            />
          </label>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
};
