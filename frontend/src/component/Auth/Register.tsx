import React, { useState } from 'react';

import { addUser } from '../../lib/data/User';
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Common/Button";
import Input from '../../ui/Common/Input';
import { User } from '../../lib/data/User';



export default function RegisterUI() {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>("");
    const [pseudo, setPseudo] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>(""); // Ajout de l'état
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        // ✅ Vérifier que les mots de passe correspondent
        if (password !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);

        const requestData = { email, pseudo, password };
        console.log("Envoi de la requête avec :", requestData);
    
        try {
            const response = await fetch("http://localhost:8000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });
    
            const data = await response.json();
            console.log("Réponse reçue :", data);
    
            if (response.ok) {
                setMessage(`Inscription réussie ! Token : ${data.api_token}`);
            } else {
                setMessage(`Erreur : ${data.message}`);
            }
        } catch (error) {
            console.error("Erreur de requête :", error);
            setMessage("Erreur lors de la connexion au serveur.");
        }
    };

    const passwdValidator = (password: string): boolean => {
        const isValidLength = password.length >= 8;
        const hasNumber = /\d/.test(password);
        return isValidLength && hasNumber;
    };
    const confirmPasswords = (): boolean => {
        return password === confirmPassword;
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 return null;
    };


    const validateEmail = (email: string): boolean => {
        const regex = /^\S+@\S+\.\S+$/;
        return regex.test(email);
    };

    const sendConfirmationEmail = async (email: string): Promise<void> => {
        // Implémentez ici l'appel à votre API ou la logique d'envoi de mail
        console.log(`Email de confirmation envoyé à ${email}`);
    };
    const [errorMessage, setErrorMessage] = useState<string>("");

    const checkAllFields = (): boolean => {
        return email !== "" && pseudo !== "" && password !== "" && confirmPassword !== "";
    };

  
    
    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen bg-white bg-opacity-70 backdrop-blur-sm"
        >
            {/* Logo Twitter */}

            {/* Formulaire */}
            <div className="w-full max-w-2xl bg-white h-auto pt-32 pb-32 px-32 rounded shadow-lg">

                <h2 className="text-xl font-bold text-center mb-6">
                    Create an Account
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Email */}
                    <div>
                        <label className="block font-semibold mb-1">Address mail</label>
                        <Input
                            type="email"
                            name="email"
                            value={email}
                            onChange= {(e) => setEmail(e.target.value)}
                            placeholder="Mail"
                            className={`w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 ${
                                validateEmail(email) || !email
                                    ? "focus:ring-blue-500"
                                    : "focus:ring-red-500"
                            }`}
                        />
                        {email && !validateEmail(email) && (
                            <p className="text-red-500 text-xs mt-1">Adresse mail invalide</p>
                        )}
                    </div>
                    <Input
            type="text"
            name="pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="Pseudo"
            className="w-full px-4 py-2 border rounded-full"

          />
                    {/* Password */}
                    <div>
                        <label className="block font-semibold mb-1">Password</label>
                        <Input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className={`w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 ${
                                passwdValidator(password) || !password
                                    ? "focus:ring-blue-500"
                                    : "focus:ring-red-500"
                            }`}
                        />
                        {password && !passwdValidator(password) && (
                            <p className="text-red-500 text-xs mt-1">Le mot de passe doit contenir au moins 8 caractères et un chiffre</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block font-semibold mb-1">Password confirmation</label>
                        <Input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmation"
                            className={`w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 ${
                                confirmPasswords() || !confirmPassword
                                    ? "focus:ring-blue-500"
                                    : "focus:ring-red-500"
                            }`}

                        />
                        {confirmPassword && !confirmPasswords() && (
                            <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                    disabled={loading}
                >
                    {loading ? "Inscription en cours..." : "S'inscrire"}
                </button>
                </form>
            </div>
        </div>
    );
}