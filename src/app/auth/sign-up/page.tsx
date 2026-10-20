"use client";


import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function SignUp() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });
          
      if (result.error) {
        setError(result.error.message || "Registration failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }

  }

  return (<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-800 px-4 py-10">

    {/* Background Decoration */}
    <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pink-500/30 blur-3xl" />
    <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl" />

    {/* Sign Up Card */}
    <div className="relative w-full max-w-md rounded-3xl border border-white/30 bg-white/95 p-7 shadow-2xl backdrop-blur-xl sm:p-10">

      {/* Logo */}
      <div className="mb-5 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 text-3xl text-white shadow-lg shadow-purple-300">
          🛍️
        </div>
      </div>

      <h1 className="text-center text-3xl font-extrabold text-gray-900">
        Create Account
      </h1>

      <p className="mt-2 text-center text-sm text-gray-500">
        Join BazarDor and start shopping today.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Full Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Email Address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-100"
          />

          <p className="mt-1 text-xs text-gray-400">
            Use at least 8 characters.
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Enter your password again"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-100"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-4 py-3.5 font-bold text-white shadow-lg shadow-purple-300/50 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account →"}
        </button>
      </form>

      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href="/auth/sign-in"
            className="font-bold text-violet-600 transition hover:text-pink-600"
          >
            Sign In
          </a>
        </p>
      </div>

      {/* Footer */}
      <div className="mt-7 border-t border-gray-100 pt-5 text-center">
        <p className="text-xs text-gray-400">
          © BazarDor · Your everyday shopping partner
        </p>
      </div>
    </div>
  </main>


  );
}
