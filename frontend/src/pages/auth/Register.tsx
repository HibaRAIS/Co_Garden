import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { apiService, RegisterData } from "../../services/membreApi";
// 🛑 MODIFICATION : Importons uniquement useNavigate, pas useAuth, ici
// import { useAuth } from "../../contexts/AuthContext";

export function Register() {
  const navigate = useNavigate();
  // 🛑 MODIFICATION : Retirons l'appel à useAuth pour ne pas importer 'login'
  // const { login } = useAuth();

  const [formData, setFormData] = useState<RegisterData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    skills: "",
    role: "membre",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const nameParts = formData.first_name.split(" ");
      const first_name = nameParts[0] || "";
      const last_name = nameParts.slice(1).join(" ") || "Membre";

      const registerData = {
        ...formData,
        first_name,
        last_name,
      };

      // Nous n'avons pas besoin de la variable 'response' car nous n'utilisons pas le token ni les données membre ici
      await apiService.register(registerData);

      // ✅ Redirection vers la page de connexion (racine '/')
      navigate("/", { state: { registeredEmail: formData.email } });
    } catch (error: any) {
      // Si l'API renvoie un message d'erreur (ex: email déjà utilisé), nous l'affichons
      setError(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1526381430565-e9a51363fbc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjb21tdW5pdHklMjBnYXJkZW4lMjBwbGFudHN8ZW58MXx8fHwxNzYwMTI2ODYxfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Garden"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#4CAF50]/80 to-[#2E7D32]/80 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <Leaf className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-4xl text-white mb-4">Rejoignez Co-Garden</h1>
            <p className="text-xl text-white/90">
              Devenez membre de notre communauté de jardiniers
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
            <h2 className="text-2xl text-gray-900 mb-2">Créer un compte</h2>
            <p className="text-gray-600 mb-6">
              Commencez votre aventure jardinage
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  className="mt-1 rounded-xl"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="mt-1 rounded-xl"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01 23 45 67 89"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="skills">Compétences (optionnel)</Label>
                <Input
                  id="skills"
                  type="text"
                  placeholder="jardinage, compostage, permaculture..."
                  value={formData.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                  className="mt-1 rounded-xl"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="mt-1 rounded-xl"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
                disabled={loading}
              >
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Déjà membre ?{" "}
                <Link to="/" className="text-[#4CAF50] hover:text-[#2E7D32]">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-6 text-xs">
            En créant un compte, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}
