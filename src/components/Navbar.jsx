import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, Brain, LogOut, User, Settings, CreditCard } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
                            <Brain className="w-8 h-8" />
                            <span>IQ Test</span>
                        </Link>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                            Нүүр
                        </Link>
                        {user ? (
                            <>
                                <Link to="/test" className="text-gray-600 hover:text-primary-600 transition-colors">
                                    Тест өгөх
                                </Link>
                                <Link to="/results" className="text-gray-600 hover:text-primary-600 transition-colors">
                                    Үр дүн
                                </Link>
                                <Link to="/account" className="text-gray-600 hover:text-primary-600 transition-colors">
                                    Хаяг
                                </Link>
                                {user.role === "admin" && (
                                    <Link to="/admin" className="text-gray-600 hover:text-primary-600 transition-colors">
                                        Админ
                                    </Link>
                                )}
                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                                    <span className="text-sm text-gray-500">
                                        <User className="w-4 h-4 inline mr-1" />
                                        {user.username}
                                    </span>
                                    <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors">
                                        <LogOut className="w-4 h-4" />
                                        Гарах
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                                    Нэвтрэх
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Бүртгүүлэх
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-primary-600">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-4 py-4 space-y-3">
                        <Link to="/" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                            Нүүр
                        </Link>
                        {user ? (
                            <>
                                <Link to="/test" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                                    Тест өгөх
                                </Link>
                                <Link to="/results" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                                    Үр дүн
                                </Link>
                                <Link to="/account" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                                    Хаяг
                                </Link>
                                {user.role === "admin" && (
                                    <Link to="/admin" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                                        Админ
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="block text-red-600 hover:text-red-700">
                                    Гарах
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                                    Нэвтрэх
                                </Link>
                                <Link to="/register" className="block text-primary-600 font-medium" onClick={() => setIsOpen(false)}>
                                    Бүртгүүлэх
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
