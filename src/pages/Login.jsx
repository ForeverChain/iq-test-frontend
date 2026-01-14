import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as loginApi } from "../api";
import { Brain, Mail, Lock, AlertCircle } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await loginApi(email, password);
            login(response.data.user, response.data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Нэвтрэхэд алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="card">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <Brain className="w-12 h-12 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Нэвтрэх</h2>
                        <p className="text-gray-500 mt-2">Хаягаараа нэвтэрч тест өгөөрэй</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                                    <Mail aria-hidden="true" className="w-5 h-5 text-gray-400" />
                                </div>
                                <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field-icon pl-12 relative z-0" placeholder="email@example.com" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                                    <Lock aria-hidden="true" className="w-5 h-5 text-gray-400" />
                                </div>
                                <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field-icon pl-12 relative z-0" placeholder="••••••••" required />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Хаяг байхгүй юу?{" "}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                                Бүртгүүлэх
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
