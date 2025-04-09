import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/Common/Button";
import { Input } from '../../ui/Common/Input';
import Logo from "../../ui/Logo";
import { RegisterSkeleton } from "../../ui/Skeleton/RegisterSkeleton";

export default function RegisterUI() {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>("");
    const [pseudo, setPseudo] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    if (loading) {
        return <RegisterSkeleton />;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const requestData = { email, pseudo, password};
        try {
            const response = await fetch("http://localhost:8080/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
              });
              if (!response.ok) {
                if (response.status === 409) {
                  throw new Error("Cet email est déjà utilisé.");}
                throw new Error(`Erreur HTTP : ${response.status}`); }
              const data = await response.json();
              if (data.message === 'Email de validation envoyé. Veuillez vérifier votre boîte de réception.') {
                setSuccessMessage(data.message);
                navigate("/login");}
            } catch (error) {
              console.error("Erreur de requête :", error);
              if (error instanceof Error) {
                setErrorMessage(error.message);
              } else {
                setErrorMessage("An unexpected error occurred");}}
              if(checkAllFields()) {
                setErrorMessage("Veuillez remplir tous les champs");}};
    const passwdValidator = (password: string): boolean => {
        const isValidLength = password.length >= 8;
        const hasNumber = /\d/.test(password);
        return isValidLength && hasNumber;};
    const confirmPasswords = (): boolean => {
        return password === confirmPassword;};
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 return null;};
    const validateEmail = (email: string): boolean => {
        const regex = /^\S+@\S+\.\S+$/;
        return regex.test(email);};
    const checkAllFields = (): boolean => {
        return email !== "" && pseudo !== "" && password !== "" && confirmPassword !== "";}; 
    return (
        <div className="flex flex-col items-center justify-center min-h-screen flex items-center justify-center bg-gray-900">
        <div className="">
            <Logo />
        </div>
        <div className="w-full max-w-2xl bg-gray-700 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">
            Créer un compte
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Adresse mail</label>
                        <Input
                            type="email"
                            name="email"
                            value={email}
                            onChange= {(e) => setEmail(e.target.value)}
                            placeholder="Mail"
                            error={!validateEmail(email) && email !== ""}/>
                        {email && !validateEmail(email) && (
                            <p className="text-red-500 text-xs mt-1">Adresse mail invalide</p>
                        )}
                    </div>
                    <Input
            type="text"
            name="pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="Pseudo"/>
                    <div>
                        <label className="block font-semibold mb-1">Password</label>
                        <Input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            
                            error={password !== "" && !passwdValidator(password)} />
                        {password && !passwdValidator(password) && (
                            <p className="text-red-500 text-xs mt-1">Le mot de passe doit contenir au moins 8 caractères et un chiffre</p>
                        )}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Password confirmation</label>
                        <Input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmation"
                            error={confirmPassword !== "" && !confirmPasswords()}/>
                        {confirmPassword && !confirmPasswords() && (
                            <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                        )}
                    </div>
                    <Button
                    type="submit"
                    variant="primary"
                    width= "auto"
                    size= "md"
                    font= "normal"
                    rounded= "full">
                    {loading ? "Inscription en cours..." : "S'inscrire"}
                </Button>
                </form>
                {successMessage && <p>{successMessage}</p>}
                {errorMessage && <p>{errorMessage}</p>}
            </div>
        </div>
    );
}