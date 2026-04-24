import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export default function AuthPage({ type = "login" }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (type === "register" && !name)) {
      return toast.error("All fields are required!");
    }

    setLoading(true);
    try {
      if (type === "login") {
        await login({ email, password });
        toast.success("Login Successful!");
      } else {
        await register({ name, email, password, role: "student" });
        toast.success("Registration Successful!");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-base-200">
      {/* LEFT IMAGE PANEL */}
      <div className="hidden md:flex relative items-center justify-center border-r border-base-300">
        <h1 className="absolute top-6 left-6 text-2xl font-bold tracking-tighter z-10">
          Kaksha
        </h1>
        <img
          src="/Classroom.png"
          alt="Classroom"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)] opacity-20" />
      </div>

      {/* RIGHT AUTH PANEL */}
      <div className="flex items-center justify-center px-4 sm:px-6 relative">
        {/* Mobile Logo */}
        <h1 className="md:hidden absolute top-6 left-6 text-2xl font-bold tracking-tight">
          Kaksha
        </h1>

        <div className="w-full max-w-md bg-base-100 shadow-2xl rounded-2xl p-8 border border-base-300">
          <h2 className="text-3xl font-bold text-center">
            {type === "login" ? "Sign in" : "Create account"}
          </h2>

          <p className="text-center text-base-content/60 mt-2 mb-8">
            {type === "login"
              ? "Use your Kaksha account"
              : "Start your learning experience"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {type === "register" && (
              <div className="flex items-center gap-3 border border-base-300 focus-within:border-primary rounded-xl px-4 py-3 transition-colors">
                <FaUser className="text-base-content/50" />
                <input
                  className="flex-1 bg-transparent outline-none"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center gap-3 border border-base-300 focus-within:border-primary rounded-xl px-4 py-3 transition-colors">
              <FaEnvelope className="text-base-content/50" />
              <input
                type="email"
                className="flex-1 bg-transparent outline-none"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 border border-base-300 focus-within:border-primary rounded-xl px-4 py-3 transition-colors">
              <FaLock className="text-base-content/50" />
              <input
                type="password"
                className="flex-1 bg-transparent outline-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className="btn btn-primary w-full rounded-xl mt-2"
            >
              {loading
                ? "Please wait..."
                : type === "login"
                ? "Login"
                : "Register"}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-base-content/70">
            {type === "login" ? (
              <>
                Don’t have an account?
                <Link
                  to="/register"
                  className="font-semibold text-primary ml-1"
                >
                  Create one
                </Link>
              </>
            ) : (
              <>
                Already have an account?
                <Link to="/login" className="font-semibold text-primary ml-1">
                  Login
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
