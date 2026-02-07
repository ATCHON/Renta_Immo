"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Chrome } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: redirect,
            });
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'inscription avec Google.");
            setIsLoading(false);
        }
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: signUpError } = await authClient.signUp.email({
                email,
                password,
                name,
            });

            if (signUpError) {
                setError(signUpError.message || "Erreur lors de l'inscription.");
                setIsLoading(false);
            } else {
                router.push(redirect);
                router.refresh();
            }
        } catch (err: any) {
            setError("Une erreur technique est survenue.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
            <Card className="w-full max-w-md p-8 shadow-soft bg-white border-clay-light/20">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-forest/10 rounded-full mb-4">
                        <UserPlus className="w-8 h-8 text-forest" />
                    </div>
                    <h1 className="text-2xl font-bold text-stone-900">Créer un compte</h1>
                    <p className="text-stone-500 mt-1">Rejoignez Renta Immo aujourd&apos;hui</p>
                </div>

                <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-700" htmlFor="name">
                            Nom Complet
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <Input
                                id="name"
                                type="text"
                                placeholder="Jean Dupont"
                                className="pl-10"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-700" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="votre@email.com"
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-700" htmlFor="password">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="Minimum 8 caractères"
                                className="pl-10"
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-forest hover:bg-forest-dark text-white font-medium py-2.5"
                        disabled={isLoading}
                    >
                        {isLoading ? "Création..." : "S'inscrire"}
                    </Button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-stone-500">Ou s&apos;inscrire avec</span>
                    </div>
                </div>

                <Button
                    variant="secondary"
                    type="button"
                    className="w-full border-stone-200 hover:bg-stone-50 text-stone-700 flex items-center justify-center gap-2"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                >
                    <Chrome className="w-5 h-5" />
                    Google
                </Button>

                <p className="mt-8 text-center text-sm text-stone-500">
                    Vous avez déjà un compte ?{" "}
                    <Link href={`/auth/login${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-forest hover:underline font-medium">
                        Se connecter
                    </Link>
                </p>
            </Card>
        </div>
    );
}
