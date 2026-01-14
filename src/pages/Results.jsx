import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTestHistory } from "../api";
import Loading from "../components/Loading";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Brain, TrendingUp, Award, Calendar, Eye } from "lucide-react";

const Results = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const response = await getTestHistory();
            setHistory(response.data);
        } catch (err) {
            console.error("Error loading history:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("mn-MN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) return <Loading text="Түүхийг ачаалж байна..." />;

    const chartData = [...history].reverse().map((test, index) => ({
        name: `Тест ${index + 1}`,
        iq: test.iqScore,
        date: formatDate(test.completedAt),
    }));

    const averageIQ = history.length > 0 ? Math.round(history.reduce((acc, t) => acc + t.iqScore, 0) / history.length) : 0;

    const highestIQ = history.length > 0 ? Math.max(...history.map((t) => t.iqScore)) : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Тестийн түүх</h1>

                {history.length === 0 ? (
                    <div className="card text-center py-12">
                        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-600 mb-2">Та одоогоор тест өгөөгүй байна</h2>
                        <p className="text-gray-500 mb-6">Эхний IQ тестээ өгөөд оюуны чадвараа хэмжээрэй</p>
                        <Link to="/test" className="btn-primary inline-block">
                            Тест эхлүүлэх
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="card">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Нийт тест</p>
                                        <p className="text-2xl font-bold text-gray-900">{history.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Дундаж IQ</p>
                                        <p className="text-2xl font-bold text-gray-900">{averageIQ}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                        <Award className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Хамгийн өндөр IQ</p>
                                        <p className="text-2xl font-bold text-gray-900">{highestIQ}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        {history.length > 1 && (
                            <div className="card mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">IQ оноо өөрчлөлт</h2>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" stroke="#9ca3af" />
                                            <YAxis domain={["dataMin - 10", "dataMax + 10"]} stroke="#9ca3af" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Line type="monotone" dataKey="iq" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb", strokeWidth: 2, r: 5 }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* History Table */}
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Бүх тестүүд</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 text-gray-600 font-medium">#</th>
                                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Огноо</th>
                                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Зөв хариулт</th>
                                            <th className="text-left py-3 px-4 text-gray-600 font-medium">IQ оноо</th>
                                            <th className="text-left py-3 px-4 text-gray-600 font-medium"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((test, index) => (
                                            <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-900">{history.length - index}</td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(test.completedAt)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-green-600 font-medium">{test.score}</span>
                                                    <span className="text-gray-400">/{test.totalQuestions}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`font-bold ${test.iqScore >= 120 ? "text-purple-600" : test.iqScore >= 100 ? "text-green-600" : "text-yellow-600"}`}>{test.iqScore}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Link to={`/result/${test.id}`} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700">
                                                        <Eye className="w-4 h-4" />
                                                        Харах
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Results;
