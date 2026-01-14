import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestions, submitTest } from "../api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import { AlertCircle, ChevronLeft, ChevronRight, Clock, CheckCircle, Search, Home, Grid, Heart, User, Code, Palette, Database, Cpu, Terminal } from "lucide-react";

const Test = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [startTime] = useState(Date.now());
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            const response = await getQuestions();
            setQuestions(response?.data?.questions || []);
        } catch (err) {
            setError("Асуултуудыг ачаалахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, answer) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        const answeredCount = Object.keys(answers).length;
        if (answeredCount < questions.length) {
            const confirm = window.confirm(`Та ${questions.length - answeredCount} асуултад хариулаагүй байна. Тест илгээх үү?`);
            if (!confirm) return;
        }

        setSubmitting(true);
        try {
            const formattedAnswers = questions.map((q) => ({
                questionId: q.id,
                selectedAnswer: answers[q.id] || "",
            }));

            const response = await submitTest(formattedAnswers);
            navigate(`/result/${response?.data?.result.id}`, { state: { result: response?.data?.result } });
        } catch (err) {
            setError("Тест илгээхэд алдаа гарлаа");
            setSubmitting(false);
        }
    };

    if (loading) return <Loading text="Асуултуудыг ачаалж байна..." />;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!questions || questions?.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Асуулт олдсонгүй. Дараа дахин оролдоно уу.</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions?.length) * 100;

    const categories = [
        { id: "html", name: "HTML", icon: Code, color: "bg-orange-500" },
        { id: "javascript", name: "JAVASCRIPT", icon: Terminal, color: "bg-yellow-500" },
        { id: "react", name: "REACT", icon: Palette, color: "bg-cyan-500" },
        { id: "cpp", name: "C++", icon: Database, color: "bg-blue-600" },
        { id: "python", name: "PYTHON", icon: Cpu, color: "bg-purple-600" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 py-4 md:py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                    {/* Left Sidebar - Hide on mobile when in quiz mode */}
                    <aside className="lg:col-span-3 space-y-4">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">{user?.username?.charAt(0).toUpperCase() || "U"}</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{user?.username || "User"}</h3>
                                    <p className="text-sm text-gray-500">ID: {user?.id || "1000"}</p>
                                </div>
                                <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">₮{user?.balance || 0}</div>
                            </div>

                            {/* Banner */}
                            <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl p-4 overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-lg mb-1">Мэдлэгээ шалга</h3>
                                    <p className="text-blue-200 text-sm mb-3">тестүүдээр</p>
                                    <button className="bg-white text-blue-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50">Эхлэх</button>
                                </div>
                                <div className="absolute right-0 top-0 opacity-20">
                                    <svg width="120" height="120" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            fill="#ffffff"
                                            d="M45.3,-57.1C58.3,-47.1,68.2,-32.3,71.7,-15.9C75.2,0.5,72.3,18.5,63.7,33.1C55.1,47.7,40.8,58.9,24.8,64.4C8.8,69.9,-9,69.7,-24.8,63.7C-40.6,57.7,-54.4,45.9,-62.3,31.1C-70.2,16.3,-72.2,-1.5,-67.8,-17.3C-63.4,-33.1,-52.6,-47,-39.1,-56.6C-25.6,-66.2,-9.4,-71.5,4.8,-77.5C19,-83.5,32.3,-67.1,45.3,-57.1Z"
                                            transform="translate(100 100)"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="bg-white rounded-2xl shadow-xl p-4 hidden md:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" placeholder="Хайх" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white rounded-2xl shadow-xl p-4 hidden md:block">
                            <h3 className="font-bold text-gray-900 mb-4">Ангилалууд</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="text-center">
                                        <div className={`${cat.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                            <cat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-xs font-medium text-gray-700">{cat.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl shadow-xl p-4 hidden md:block">
                            <h3 className="font-bold text-gray-900 mb-4">Сүүлд болсон үйлдэл</h3>
                            <div className="space-y-3">
                                {categories.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`${cat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                                                <cat.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                                                <p className="text-xs text-gray-500">20 Question</p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">20/21</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Question Area */}
                    <main className="lg:col-span-6">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="text-center">
                                        <h2 className="font-bold text-gray-900">IQ тест</h2>
                                        <p className="text-sm text-gray-500">{questions.length} асуулт</p>
                                    </div>
                                    <button className="px-4 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200">Гарах</button>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="px-6 py-3 border-b border-gray-100">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>
                                        Асуулт: {currentIndex + 1}/{questions.length}
                                    </span>
                                    <span className="text-blue-600 font-medium">{Math.round(progress)}% дууссан</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="p-6 md:p-8 min-h-[400px]">
                                <p className="text-sm text-gray-500 mb-3">
                                    Асуулт: {currentIndex + 1}/{questions.length}
                                </p>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{currentQuestion?.questionText}</h3>

                                {/* Question Images */}
                                {currentQuestion?.images && currentQuestion.images.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {currentQuestion.images.map((img) => (
                                            <img key={img.id} src={`http://localhost:3001${img.imageUrl}`} alt="Question" className="max-w-full md:max-w-xs h-auto rounded-xl border-2 border-gray-200" />
                                        ))}
                                    </div>
                                )}

                                {/* Answer Options */}
                                <div className="space-y-3">
                                    {currentQuestion?.options?.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleAnswer(currentQuestion?.id, option.label)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${answers[currentQuestion?.id] === option.label ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200" : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"}`}>
                                            <div className="flex items-center gap-3">
                                                {option.imageUrl ? (
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <span className="font-bold">{option.label}</span>
                                                        <img src={`http://localhost:3001${option.imageUrl}`} alt={option.label} className="w-16 h-16 object-cover rounded-lg" />
                                                        <span>{option.optionText}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="font-bold">{option.label}</span>
                                                        <span className="flex-1">{option.optionText}</span>
                                                    </>
                                                )}
                                                {answers[currentQuestion?.id] === option.label && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 text-center">
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Үр дүнг харах ⟶</button>
                                </div>
                            </div>

                            {/* Navigation Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                <button onClick={handlePrev} disabled={currentIndex === 0} className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                    Өмнөх
                                </button>

                                {currentIndex === questions.length - 1 ? (
                                    <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-lg shadow-blue-200">
                                        {submitting ? "Илгээж байна..." : "Тест илгээх"}
                                    </button>
                                ) : (
                                    <button onClick={handleNext} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200">
                                        Дараах
                                    </button>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Right Sidebar - Score Preview (hidden on mobile) */}
                    <aside className="lg:col-span-3 hidden lg:block">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
                            <div className="text-center">
                                <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative shadow-2xl">
                                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col">
                                        <p className="text-gray-600 text-sm font-medium mb-1">Таны оноо</p>
                                        <p className="text-5xl font-bold text-gray-900">
                                            {answeredCount}/{questions.length}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <h3 className="text-2xl font-bold text-gray-900">Үргэлжлүүлээрэй!</h3>
                                    <p className="text-gray-600">Сайн явж байна! {questions.length - answeredCount} асуулт үлдсэн</p>

                                    <div className="pt-6 space-y-3">
                                        <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg">Хуваалцах</button>
                                        <button onClick={() => navigate("/")} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
                                            Эх хуудас руу буцах
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Bottom Navigation - Mobile Only */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around items-center shadow-lg">
                    <button onClick={() => navigate("/")} className="flex flex-col items-center gap-1">
                        <Home className="w-5 h-5 text-gray-600" />
                        <span className="text-xs text-gray-600">Эх</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                        <Grid className="w-5 h-5 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">Тест</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                        <Heart className="w-5 h-5 text-gray-600" />
                        <span className="text-xs text-gray-600">Хадгалсан</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="text-xs text-gray-600">Профайл</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Test;
