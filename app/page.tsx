"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scale, ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        {/* Animated Orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Subtle Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col justify-around p-12 w-full items-center">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <Scale className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Optimum</h1>
              <p className="text-sm text-white/70 font-medium">Juridis Finance</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-lg text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm text-white/90 font-medium">Plateforme de gestion juridique</span>
            </div>

            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Gérez vos projets
              <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                juridiques & finances
              </span>
            </h2>

            <p className="text-lg text-white/70 leading-relaxed mb-10">
              Une solution complète pour les cabinets juridiques : gestion de projets,
              facturation automatisée et analyses financières en temps réel.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Gestion de Projets", value: "Suivi en temps réel" },
                { label: "Facturation", value: "Automatisée" },
                { label: "Équipe", value: "Collaboration" },
                { label: "Rapports", value: "Analytics avancés" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <p className="text-sm text-white/50 mb-1">{feature.label}</p>
                  <p className="text-white font-semibold">{feature.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/40 text-sm">
            © 2024 Optimum Juridis Finance. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Optimum</h1>
              <p className="text-xs text-slate-500">Juridis Finance</p>
            </div>
          </div>

          {/* Form Container */}
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Connexion
              </h2>
              <p className="text-slate-500">
                Entrez vos identifiants pour accéder à votre espace
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
                  <div className="flex-shrink-0 h-2 w-2 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-slate-700 text-sm font-medium">
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 px-4 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-500/20 rounded-lg pl-4 pr-2"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                    Mot de passe
                  </Label>
                  <button type="button" className="text-sm text-violet-600 hover:text-violet-700 transition-colors font-medium">
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-11 px-4 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-500/20 rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-base font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 text-center mb-3">Identifiants de démonstration</p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-white border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Directeur</p>
                  <p className="text-sm text-slate-700 font-mono">director@test.com</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Consultant</p>
                  <p className="text-sm text-slate-700 font-mono">consultant@test.com</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">
                Mot de passe : <span className="text-slate-700 font-mono">password123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
