import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { apiService } from "../../services/membreApi";
import { useAuth } from "../../contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiService.login({ email, password });

      // Stocker les infos
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.member));

      // Mettre à jour le contexte
      login(response.member, response.token);

      // Redirection basée sur le rôle
      if (response.member.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/member/dashboard");
      }
    } catch (error: any) {
      setError(error.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1526381430565-e9a51363fbc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXJkZW4lMjBwbGFudHN8ZW58MXx8fHwxNzYwMTI2ODYxfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Garden"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#4CAF50]/80 to-[#2E7D32]/80 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <Leaf className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-4xl text-white mb-4">
              Bienvenue sur Co-Garden
            </h1>
            <p className="text-xl text-white/90">
              Cultivons ensemble un jardin partagé
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8F5F0]">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#81C784] flex items-center justify-center">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl text-[#2E7D32]">Co-Garden</span>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E0E0E0]">
            <h2 className="text-2xl text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-600 mb-6">Accédez à votre jardin partagé</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 rounded-xl"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 rounded-xl"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
                disabled={loading}
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Pas encore de compte ?{" "}
                <Link
                  to="/register"
                  className="text-[#4CAF50] hover:text-[#2E7D32]"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-6 text-xs">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}
