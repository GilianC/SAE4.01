import React, { useState } from 'react';

import { addUser } from '../../lib/data/User';
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Common/Button";
import Input from '../../ui/Common/Input';

export default function RegisterUI() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        pseudo: "",
        password: "",
        confirmPassword: "",
      });
    
    const passwdValidator = (password: string): boolean => {
        const isValidLength = password.length >= 8;
        const hasNumber = /\d/.test(password);
        return isValidLength && hasNumber;
    };
    const confirmPasswords = (): boolean => {
        return form.password === form.confirmPassword;
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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
        return form.email !== "" && form.pseudo !== "" && form.password !== "" && form.confirmPassword !== "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        if(checkAllFields()==true){
            navigate("/login");
            addUser({ email: form.email, pseudo: form.pseudo, password: form.password });
            return;}
            e.preventDefault();
        if (form.password !== form.confirmPassword) {

          return;
        }
        if (!addUser({ email: form.email, pseudo: form.pseudo, password: form.password })) {

          return;
        }
    
    console.log('click')

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
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Mail"
                            className={`w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 ${
                                validateEmail(form.email) || !form.email
                                    ? "focus:ring-blue-500"
                                    : "focus:ring-red-500"
                            }`}
                        />
                        {form.email && !validateEmail(form.email) && (
                            <p className="text-red-500 text-xs mt-1">Adresse mail invalide</p>
                        )}
                    </div>
                    <Input
            type="text"
            name="pseudo"
            value={form.pseudo}
            onChange={handleChange}
            placeholder="Pseudo"
            className="w-full px-4 py-2 border rounded-full"

          />
                    {/* Password */}
                    <div>
                        <label className="block font-semibold mb-1">Password</label>
                        <Input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className={`w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 ${
                                passwdValidator(form.password) || !form.password
                                    ? "focus:ring-blue-500"
                                    : "focus:ring-red-500"
                            }`}
                        />
                        {form.password && !passwdValidator(form.password) && (
                            <p className="text-red-500 text-xs mt-1">Le mot de passe doit contenir au moins 8 caractères et un chiffre</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block font-semibold mb-1">Password confirmation</label>
                        <Input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirmation"
                            className={`w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 ${
                                confirmPasswords() || !form.confirmPassword
                                    ? "focus:ring-blue-500"
                                    : "focus:ring-red-500"
                            }`}

                        />
                        {form.confirmPassword && !confirmPasswords() && (
                            <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button 
  type="submit" 
  onClick={handleSubmit} 
  variant="default" 
  width="full" 
  size="lg" 
  font="bold" 
  rounded="full" 
  borderColor="none" // Ajout d'une bordure bleue
>
  Sign In
</Button>
                </form>
            </div>
        </div>
    );
}