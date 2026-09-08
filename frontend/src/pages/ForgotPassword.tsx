import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent transition";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{
    message: string;
    resetLink?: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setResult(data);
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email to get a password reset link."
    >
      {result ? (
        /* Confirmation state — after submitting */
        <div className="space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Check your email
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              If an account exists for that email, we've sent a link to reset
              your password.
            </p>
          </div>

          {result.resetLink && (
            <a
              href={result.resetLink}
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition"
            >
              Continue to reset →
            </a>
          )}

          <Link
            to="/login"
            className="block text-sm text-indigo-400 hover:text-indigo-300"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        /* Form state — before submitting */
        <>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold hover:from-indigo-400 hover:to-fuchsia-400 transition"
            >
              Send reset link
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
