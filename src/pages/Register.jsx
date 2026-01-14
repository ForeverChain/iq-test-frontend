import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register as registerApi } from "../api";
import { Brain, Mail, Lock, User, AlertCircle } from "lucide-react";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Нууц үг таарахгүй байна");
            return;
        }

        if (password.length < 6) {
            setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
            return;
        }

        setLoading(true);

        try {
            const response = await registerApi(username, email, password);
            login(response.data.user, response.data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Бүртгүүлэхэд алдаа гарлаа");
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
                        <h2 className="text-2xl font-bold text-gray-900">Бүртгүүлэх</h2>
                        <p className="text-gray-500 mt-2">Шинэ хаяг үүсгэж тест өгөөрэй</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Хэрэглэгчийн нэр</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field-icon pl-10" placeholder="username" required minLength={3} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field-icon pl-10" placeholder="email@example.com" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field-icon pl-10" placeholder="••••••••" required minLength={6} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг баталгаажуулах</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field-icon pl-10" placeholder="••••••••" required />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                            {loading ? "Бүртгүүлж байна..." : "Бүртгүүлэх"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Хаяг байгаа юу?{" "}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                                Нэвтрэх
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
