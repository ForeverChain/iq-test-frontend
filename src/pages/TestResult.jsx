import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { getTestResult } from "../api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import { Brain, CheckCircle, XCircle, ArrowLeft, Trophy, Target, Share2, Home as HomeIcon } from "lucide-react";

const TestResult = () => {
    const { id } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const [result, setResult] = useState(location.state?.result || null);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAnswers, setShowAnswers] = useState(false);

    useEffect(() => {
        loadResult();
    }, [id]);

    const loadResult = async () => {
        try {
            const response = await getTestResult(id);
            setDetails(response.data);
            if (!result) {
                setResult({
                    score: response.data.score,
                    totalQuestions: response.data.totalQuestions,
                    iqScore: response.data.iqScore,
                    percentage: Math.round((response.data.score / response.data.totalQuestions) * 100),
                });
            }
        } catch (err) {
            console.error("Error loading result:", err);
        } finally {
            setLoading(false);
        }
    };

    const getIQCategory = (iq) => {
        if (iq >= 130) return { label: "Маш өндөр", color: "text-purple-600", bg: "bg-purple-100" };
        if (iq >= 120) return { label: "Өндөр", color: "text-blue-600", bg: "bg-blue-100" };
        if (iq >= 110) return { label: "Дундаас дээш", color: "text-green-600", bg: "bg-green-100" };
        if (iq >= 90) return { label: "Дундаж", color: "text-yellow-600", bg: "bg-yellow-100" };
        if (iq >= 80) return { label: "Дундаас доош", color: "text-orange-600", bg: "bg-orange-100" };
        return { label: "Бага", color: "text-red-600", bg: "bg-red-100" };
    };

    if (loading) return <Loading text="Үр дүнг ачаалж байна..." />;

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Үр дүн олдсонгүй</p>
                    <Link to="/test" className="btn-primary mt-4 inline-block">
                        Шинэ тест өгөх
                    </Link>
                </div>
            </div>
        );
    }

    const category = getIQCategory(result.iqScore);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 py-8">
            <div className="max-w-md mx-auto px-4">
                {/* Modern Result Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <Link to="/results" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h2 className="font-bold text-gray-900">Тестийн үр дүн</h2>
                            <div className="w-9"></div>
                        </div>
                    </div>

                    {/* Score Circle */}
                    <div className="py-12 px-6 text-center">
                        <div className="w-56 h-56 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative shadow-2xl">
                            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col">
                                <p className="text-gray-600 font-medium mb-1">Таны оноо</p>
                                <p className="text-6xl font-bold text-gray-900">
                                    {result.score}/{result.totalQuestions}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Баяр хүргэе</h1>
                            <p className="text-lg text-gray-600">Сайхан хийлээ, {user?.username || "Хэрэглэгч"}! Амжилттай дуусгалаа</p>
                        </div>

                        {/* Stats */}
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                                <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Зөв</span>
                                </div>
                                <div className="text-3xl font-bold text-green-700">{result.score}</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                                <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                                    <Target className="w-5 h-5" />
                                    <span className="font-medium">Нарийвчлал</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-700">{result.percentage}%</div>
                            </div>
                        </div>

                        {/* IQ Score Badge */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Brain className="w-6 h-6 text-purple-600" />
                                <span className="font-bold text-gray-900">IQ оноо</span>
                            </div>
                            <div className="text-4xl font-bold text-purple-600 mb-1">{result.iqScore}</div>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${category.bg} ${category.color} text-sm font-medium`}>
                                <Trophy className="w-4 h-4" />
                                {category.label}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 pb-6 space-y-3">
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: "Миний IQ тестийн үр дүн",
                                        text: `Би ${result.score}/${result.totalQuestions} оноо авсан, IQ = ${result.iqScore}!`,
                                    });
                                }
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                            <Share2 className="w-5 h-5" />
                            Хуваалцах
                        </button>
                        <Link to="/" className="block w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 text-center flex items-center justify-center gap-2">
                            <HomeIcon className="w-5 h-5" />
                            Эх хуудас руу буцах
                        </Link>
                        <button onClick={() => setShowAnswers(!showAnswers)} className="w-full py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                            {showAnswers ? "Хариуг нуух" : "Бүх хариуг харах"}
                        </button>
                    </div>
                </div>

                {/* Detailed Answers */}
                {showAnswers && details?.answers && (
                    <div className="mt-6 bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Хариултын дэлгэрэнгүй</h2>
                        </div>
                        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                            {details.answers.map((answer, index) => (
                                <div key={index} className={`p-4 rounded-2xl border-2 ${answer.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                                    <div className="flex items-start gap-3">
                                        {answer.isCorrect ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 mb-2">
                                                {index + 1}. {answer.questionText}
                                            </p>
                                            <div className="text-sm space-y-1">
                                                <p>
                                                    <span className="text-gray-500">Таны хариулт:</span> <span className={answer.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{answer.selectedAnswer || "Хариулсангүй"}</span>
                                                </p>
                                                {!answer.isCorrect && (
                                                    <p>
                                                        <span className="text-gray-500">Зөв хариулт:</span> <span className="text-green-600 font-medium">{answer.correctAnswer}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* IQ Scale */}
                <div className="mt-6 bg-white rounded-3xl shadow-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        IQ Score Guide
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                            <span className="font-medium text-purple-900">130+</span>
                            <span className="text-gray-600">Very Superior</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                            <span className="font-medium text-blue-900">120-129</span>
                            <span className="text-gray-600">Superior</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                            <span className="font-medium text-green-900">110-119</span>
                            <span className="text-gray-600">Above Average</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                            <span className="font-medium text-yellow-900">90-109</span>
                            <span className="text-gray-600">Average</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                            <span className="font-medium text-orange-900">80-89</span>
                            <span className="text-gray-600">Below Average</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestResult;
