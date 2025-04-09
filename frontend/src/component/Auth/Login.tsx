import React, { useState } from "react";
import { postRequest } from "../../lib/utils";
import { Button } from "../../ui/Common/Button";
import { LoginSkeleton } from "../../ui/Skeleton/LoginSkeleton";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await postRequest("/login", form);
      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user?.roles?.includes("ROLE_ADMIN")) {
          window.location.href = "/auth/admin";
        } else {
          window.location.href = "/auth/home";
        }
      } else {
        setError("Invalid token received.");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setError("Une erreur est survenue lors de la connexion.");
    }
    setLoading(false);
  };

  if (loading) {
    return <LoginSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-4">Se connecter</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
          <div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Button
              type="submit"
              variant="primary"
              width="auto"
              size="md"
              font="normal"
              rounded="full"
            >
              {loading ? "Connexion en cours..." : " Se connecter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;