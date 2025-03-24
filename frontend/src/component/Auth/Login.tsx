import React , {useState} from "react";
import  Button  from "../../ui/Common/Button";
import Input from '../../ui/Common/Input';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from '../../lib/data/User';
export default function Login() {
    const [form, setForm] = useState({
      email: "",
      password: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!authenticateUser(form.email, form.password)) {
        setError("Email ou mot de passe incorrect.");
        return;
      }
  
      // Rediriger après connexion réussie
      navigate("/home");
    };
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-full max-w-xs">
          <h2 className="text-xl font-bold text-center mb-6">Log In</h2>
  
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
  
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Mail"
              className="w-full px-4 py-2 border rounded-full"

            />
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-full"

            />
                    <Button children="Login" type="submit" onClick={handleSubmit}>
                        
                    </Button>
          </form>
        </div>
      </div>
    );
  }
  