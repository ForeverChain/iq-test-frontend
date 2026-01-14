import { useEffect, useState } from "react";
import { getAllUsers, getAllTransactions, updateTransactionStatus, updateUserBalance, getAdminStats, getAdminQuestions, createQuestion, deleteQuestion, uploadImage, getAllTests, createTest, updateTest, deleteTest, updateQuestion } from "../api";
import Loading from "../components/Loading";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Users, CreditCard, TrendingUp, Clock, CheckCircle, XCircle, DollarSign, Brain, RefreshCw, Upload, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

/* =======================
   MAIN COMPONENT
======================= */
export default function Admin() {
    const [tab, setTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);

    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);

    const [testsList, setTestsList] = useState([]);
    const [expandedTestId, setExpandedTestId] = useState(null);
    const [testQuestions, setTestQuestions] = useState({});
    const [editingTestId, setEditingTestId] = useState(null);
    const [editingTestTitleId, setEditingTestTitleId] = useState(null);
    const [editTestTitle, setEditTestTitle] = useState("");
    const [editTestSlug, setEditTestSlug] = useState("");

    const [newTest, setNewTest] = useState({
        slug: "",
        title: "",
        description: "",
        durationMinutes: 15,
    });

    const [newQuestion, setNewQuestion] = useState({
        questionText: "",
        imageUrls: [],
        questionType: "multiple_choice",
        correctAnswers: [""],
        options: [{ label: "A", optionText: "", imageUrl: "", isCorrect: false }],
        gridData: Array(7)
            .fill(null)
            .map(() => Array(7).fill({ value: "", isBlack: false, isCorrect: false })),
    });

    const [uploadingImage, setUploadingImage] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [modalTestId, setModalTestId] = useState(null);
    const [lightboxSrc, setLightboxSrc] = useState(null);

    const Lightbox = ({ src, onClose }) => {
        if (!src) return null;
        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70" onClick={onClose} />
                <div className="relative max-w-[90vw] max-h-[90vh]">
                    <img src={src} alt="Preview" className="w-auto h-auto max-w-full max-h-full object-contain rounded" />
                    <button onClick={onClose} className="absolute top-2 right-2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center text-gray-700">
                        ✕
                    </button>
                </div>
            </div>,
            document.body
        );
    };

    /* =======================
     DATA LOAD
  ======================= */
    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [u, t, s, tests] = await Promise.all([getAllUsers(), getAllTransactions(), getAdminStats(), getAllTests()]);
            setUsers(u.data);
            setTransactions(t.data);
            setStats(s.data);
            setTestsList(tests.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadQuestions = async (testId) => {
        try {
            const res = await getAdminQuestions(testId);
            setTestQuestions((p) => ({ ...p, [testId]: res.data }));
        } catch (e) {
            console.error(e);
        }
    };

    console.log("testList", testsList);
    /* =======================
     HELPERS
  ======================= */
    const formatDate = (d) =>
        new Date(d).toLocaleDateString("mn-MN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const statusBadge = (s) => {
        if (s === "completed") return <span className="badge badge-success">Амжилттай</span>;
        if (s === "pending") return <span className="badge badge-warning">Хүлээгдэж буй</span>;
        if (s === "failed") return <span className="badge badge-danger">Цуцлагдсан</span>;
        return null;
    };

    if (loading) return <Loading text="Ачаалж байна..." />;

    /* =======================
     RENDER
  ======================= */
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* HEADER */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Админ панел</h1>
                        <p className="text-sm text-gray-500">Системийн удирдлага</p>
                    </div>
                    <button onClick={loadAll} className="btn-secondary flex gap-2">
                        <RefreshCw className="w-4 h-4" /> Шинэчлэх
                    </button>
                </header>

                {/* TABS */}
                <div className="flex gap-3 mb-8 overflow-x-auto">
                    {[
                        { id: "dashboard", label: "Dashboard", icon: TrendingUp },
                        { id: "users", label: "Хэрэглэгчид", icon: Users },
                        { id: "transactions", label: "Шилжүүлэг", icon: CreditCard },
                        { id: "tests", label: "Тестүүд", icon: Brain },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-5 py-2 rounded-full flex gap-2 text-sm font-semibold transition
                ${tab === t.id ? "bg-primary-600 text-white shadow" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
                            <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                    ))}
                </div>

                {/* =======================
            DASHBOARD
        ======================= */}
                {tab === "dashboard" && stats && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Нийт хэрэглэгч", value: stats.totalUsers, icon: Users, color: "bg-blue-100 text-blue-600" },
                            { label: "Нийт тест", value: stats.totalTests, icon: Brain, color: "bg-green-100 text-green-600" },
                            { label: "Хүлээгдэж буй", value: stats.pendingTransactions, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
                            {
                                label: "Нийт гүйлгээ",
                                value: `₮${parseFloat(stats.totalTransactionVolume || 0).toLocaleString()}`,
                                icon: DollarSign,
                                color: "bg-purple-100 text-purple-600",
                            },
                        ].map((c, i) => (
                            <div key={i} className="card card-hover">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
                                    <c.icon className="w-6 h-6" />
                                </div>
                                <p className="text-sm text-gray-500 mt-4">{c.label}</p>
                                <p className="text-2xl font-bold">{c.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* =======================
            USERS
        ======================= */}
                {tab === "users" && (
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    {["ID", "Нэр", "Имэйл", "Баланс", "Үүрэг", "Огноо"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-sm text-gray-600">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="table-row">
                                        <td className="px-4 py-3">{u.id}</td>
                                        <td className="px-4 py-3 font-medium">{u.username}</td>
                                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                        <td className="px-4 py-3 font-semibold text-green-600">₮{parseFloat(u.balance).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`badge ${u.role === "admin" ? "badge-success" : "badge-muted"}`}>{u.role}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* =======================
            TRANSACTIONS
        ======================= */}
                {tab === "transactions" && (
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    {["ID", "Илгээгч", "Хүлээн авагч", "Дүн", "Статус", "Огноо"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-sm text-gray-600">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="table-row">
                                        <td className="px-4 py-3">{tx.id}</td>
                                        <td className="px-4 py-3 font-medium">{tx.senderUsername}</td>
                                        <td className="px-4 py-3 font-medium">{tx.receiverUsername}</td>
                                        <td className="px-4 py-3 font-semibold">₮{parseFloat(tx.amount).toLocaleString()}</td>
                                        <td className="px-4 py-3">{statusBadge(tx.status)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(tx.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* =======================
            TESTS
        ======================= */}
                {tab === "tests" && (
                    <div className="space-y-6">
                        {/* Create New Test */}
                        <div className="card">
                            <h3 className="section-title">Шинэ тест үүсгэх</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <input className="input" placeholder="Slug (URL)" value={newTest.slug} onChange={(e) => setNewTest({ ...newTest, slug: e.target.value })} />
                                <input className="input" placeholder="Гарчиг" value={newTest.title} onChange={(e) => setNewTest({ ...newTest, title: e.target.value })} />
                                <input className="input" type="number" placeholder="Хугацаа (минут)" value={newTest.durationMinutes} onChange={(e) => setNewTest({ ...newTest, durationMinutes: parseInt(e.target.value || 0) })} />
                            </div>
                            <textarea className="input mt-4 min-h-[60px]" placeholder="Тайлбар (заавал биш)" value={newTest.description} onChange={(e) => setNewTest({ ...newTest, description: e.target.value })} />
                            <button
                                className="btn-primary mt-4"
                                onClick={async () => {
                                    if (!newTest.slug || !newTest.title) {
                                        alert("Slug болон гарчиг оруулна уу");
                                        return;
                                    }
                                    try {
                                        await createTest(newTest);
                                        alert("Тест үүсгэгдлээ");
                                        setNewTest({ slug: "", title: "", description: "", durationMinutes: 15 });
                                        loadAll();
                                    } catch (e) {
                                        alert(e.response?.data?.error || "Алдаа гарлаа");
                                    }
                                }}>
                                Тест үүсгэх
                            </button>
                        </div>

                        {/* Tests List */}
                        <div className="card">
                            <h3 className="section-title">Тестүүд ({testsList.length})</h3>

                            {testsList.map((test) => (
                                <div key={test.id} className="border rounded-xl mb-3 overflow-hidden">
                                    {/* Test Header */}
                                    <div className="p-4 bg-gray-50 flex justify-between items-center">
                                        <div className="flex gap-3 items-center">
                                            <button
                                                className="icon-btn"
                                                onClick={() => {
                                                    setExpandedTestId(expandedTestId === test.id ? null : test.id);
                                                    if (expandedTestId !== test.id) {
                                                        loadQuestions(test.id);
                                                    }
                                                }}>
                                                {expandedTestId === test.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                            </button>
                                            <div>
                                                <div className="font-bold text-gray-900">
                                                    {editingTestTitleId === test.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input className="input" value={editTestTitle} onChange={(e) => setEditTestTitle(e.target.value)} />
                                                            <input className="input w-40 text-sm" value={editTestSlug} onChange={(e) => setEditTestSlug(e.target.value)} />
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await updateTest(test.id, { title: editTestTitle, slug: editTestSlug });
                                                                        setTestsList((prev) => prev.map((t) => (t.id === test.id ? { ...t, title: editTestTitle, slug: editTestSlug } : t)));
                                                                        setEditingTestTitleId(null);
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                    }
                                                                }}
                                                                className="btn-primary text-sm">
                                                                Хадгалах
                                                            </button>
                                                            <button onClick={() => setEditingTestTitleId(null)} className="btn-secondary text-sm">
                                                                Цуцлах
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                {test.title} <span className="text-xs text-gray-500 font-normal">({test.slug})</span>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingTestTitleId(test.id);
                                                                    setEditTestTitle(test.title || "");
                                                                    setEditTestSlug(test.slug || "");
                                                                }}
                                                                className="text-blue-600 text-sm hover:underline">
                                                                Засах
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                                    <span>{test.totalQuestions || 0} асуулт</span>
                                                    <span>•</span>
                                                    <span>{test.durationMinutes} минут</span>
                                                    {test.published ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs ml-2">Нийтлэгдсэн</span> : <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs ml-2">Ноорог</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn-secondary text-sm"
                                                onClick={async () => {
                                                    await updateTest(test.id, { published: test.published ? 0 : 1 });
                                                    loadAll();
                                                }}>
                                                {test.published ? "Цуцлах" : "Нийтлэх"}
                                            </button>
                                            <button
                                                className="btn-danger text-sm"
                                                onClick={async () => {
                                                    if (confirm("Устгах уу?")) {
                                                        await deleteTest(test.id);
                                                        loadAll();
                                                    }
                                                }}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedTestId === test.id && (
                                        <div className="p-4 border-t bg-white">
                                            {/* Add Question Form */}
                                            {editingTestId === test.id ? (
                                                <div className="mb-6 bg-blue-50 p-6 rounded-2xl border border-blue-100 relative">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h4 className="text-lg font-semibold text-gray-900">{editingQuestionId ? "Асуулт засах" : "Шинэ асуулт нэмэх"}</h4>
                                                        <button
                                                            onClick={() => {
                                                                setEditingTestId(null);
                                                                setEditingQuestionId(null);
                                                                setNewQuestion({ questionText: "", imageUrls: [], options: [{ label: "A", optionText: "", imageUrl: "", isCorrect: false }] });
                                                            }}
                                                            className="ml-3 bg-white w-8 h-8 rounded-full flex items-center justify-center text-gray-600 shadow-sm">
                                                            ✕
                                                        </button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {/* Question Text */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Асуулт</label>
                                                            <ReactQuill theme="snow" value={newQuestion.questionText} onChange={(value) => setNewQuestion({ ...newQuestion, questionText: value })} className="bg-white" />
                                                        </div>

                                                        {/* Images */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Зургууд (олон зураг оруулж болно)</label>
                                                            <div className="space-y-2">
                                                                <div className="flex gap-2 items-center">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        id={`imageUpload-${test.id}`}
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files[0];
                                                                            if (!file) return;
                                                                            setUploadingImage(true);
                                                                            try {
                                                                                const res = await uploadImage(file);
                                                                                setNewQuestion({ ...newQuestion, imageUrls: [...newQuestion.imageUrls, res.data.imageUrl] });
                                                                            } catch (err) {
                                                                                alert("Зураг хуулахад алдаа гарлаа");
                                                                            } finally {
                                                                                setUploadingImage(false);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label htmlFor={`imageUpload-${test.id}`} className="btn-secondary flex items-center gap-2 cursor-pointer text-sm">
                                                                        <Upload className="w-4 h-4" />
                                                                        {uploadingImage ? "Хуулж байна..." : "Зураг нэмэх"}
                                                                    </label>
                                                                    <span className="text-sm text-gray-600">{newQuestion.imageUrls.length} зураг</span>
                                                                </div>
                                                                {newQuestion.imageUrls.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {newQuestion.imageUrls.map((url, idx) => (
                                                                            <div key={idx} className="relative">
                                                                                <img src={`http://localhost:3001${url}`} alt={`Preview ${idx + 1}`} className="w-20 h-20 object-cover rounded border cursor-pointer" onClick={() => setLightboxSrc(`http://localhost:3001${url}`)} />
                                                                                <button
                                                                                    onClick={() => setNewQuestion({ ...newQuestion, imageUrls: newQuestion.imageUrls.filter((_, i) => i !== idx) })}
                                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                                                                                    ✕
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Question Type */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Асуултын төрөл</label>
                                                            <select className="input text-sm" value={newQuestion.questionType} onChange={(e) => setNewQuestion({ ...newQuestion, questionType: e.target.value })}>
                                                                <option value="multiple_choice">Сонголттой</option>
                                                                <option value="short_answer">Текст</option>
                                                                <option value="numeric">Тоо</option>
                                                                <option value="grid">Grid / Зурагтай томъёо</option>
                                                            </select>
                                                        </div>

                                                        {/* Options (only for multiple choice) */}
                                                        {newQuestion.questionType === "multiple_choice" ? (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Сонголтууд</label>
                                                                <div className="space-y-2">
                                                                    {newQuestion.options.map((opt, idx) => (
                                                                        <div key={idx} className="flex gap-2 items-start border p-3 rounded-lg bg-white">
                                                                            <input
                                                                                className="input w-16 text-sm"
                                                                                placeholder="Label"
                                                                                value={opt.label}
                                                                                onChange={(e) => {
                                                                                    const updated = [...newQuestion.options];
                                                                                    updated[idx].label = e.target.value;
                                                                                    setNewQuestion({ ...newQuestion, options: updated });
                                                                                }}
                                                                            />
                                                                            <div className="flex-1 space-y-2">
                                                                                <input
                                                                                    className="input text-sm"
                                                                                    placeholder="Хариултын текст"
                                                                                    value={opt.optionText}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...newQuestion.options];
                                                                                        updated[idx].optionText = e.target.value;
                                                                                        setNewQuestion({ ...newQuestion, options: updated });
                                                                                    }}
                                                                                />
                                                                                <div className="flex gap-2 items-center">
                                                                                    <input
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        className="hidden"
                                                                                        id={`optionImage-${test.id}-${idx}`}
                                                                                        onChange={async (e) => {
                                                                                            const file = e.target.files[0];
                                                                                            if (!file) return;
                                                                                            try {
                                                                                                const res = await uploadImage(file);
                                                                                                const updated = [...newQuestion.options];
                                                                                                updated[idx].imageUrl = res.data.imageUrl;
                                                                                                setNewQuestion({ ...newQuestion, options: updated });
                                                                                            } catch (err) {
                                                                                                alert("Зураг хуулахад алдаа гарлаа");
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <label htmlFor={`optionImage-${test.id}-${idx}`} className="text-xs bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200">
                                                                                        {opt.imageUrl ? "✓ Зураг" : "+ Зураг"}
                                                                                    </label>
                                                                                    {opt.imageUrl && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                const updated = [...newQuestion.options];
                                                                                                updated[idx].imageUrl = "";
                                                                                                setNewQuestion({ ...newQuestion, options: updated });
                                                                                            }}
                                                                                            className="text-xs text-red-600 hover:underline">
                                                                                            Устгах
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <label className="flex items-center gap-1 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={opt.isCorrect}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...newQuestion.options];
                                                                                        updated[idx] = { ...updated[idx], isCorrect: e.target.checked };
                                                                                        setNewQuestion({ ...newQuestion, options: updated });
                                                                                    }}
                                                                                />
                                                                                <span className="text-sm">Зөв</span>
                                                                            </label>
                                                                            {newQuestion.options.length > 1 && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const updated = newQuestion.options.filter((_, i) => i !== idx);
                                                                                        setNewQuestion({ ...newQuestion, options: updated });
                                                                                    }}
                                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        const nextLabel = String.fromCharCode(65 + newQuestion.options.length);
                                                                        setNewQuestion({
                                                                            ...newQuestion,
                                                                            options: [...newQuestion.options, { label: nextLabel, optionText: "", imageUrl: "", isCorrect: false }],
                                                                        });
                                                                    }}
                                                                    className="btn-secondary mt-2 flex items-center gap-2 text-sm">
                                                                    <Plus className="w-4 h-4" />
                                                                    Сонголт нэмэх
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                {newQuestion.questionType === "grid" ? (
                                                                    <>
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Grid бөглөх</label>
                                                                            <div className="bg-white p-4 rounded-lg border">
                                                                                <div className="inline-block">
                                                                                    {newQuestion.gridData.map((row, rowIdx) => (
                                                                                        <div key={rowIdx} className="flex">
                                                                                            {row.map((cell, colIdx) => (
                                                                                                <div key={`${rowIdx}-${colIdx}`} className="relative group">
                                                                                                    <div
                                                                                                        className={`w-12 h-12 border border-gray-300 flex items-center justify-center cursor-pointer text-sm font-medium transition-colors ${
                                                                                                            cell.isBlack ? "bg-gray-900 text-white" : cell.isCorrect ? "bg-green-100 border-green-400 text-green-800 font-bold" : "bg-white hover:bg-gray-50"
                                                                                                        }`}
                                                                                                        onClick={() => {
                                                                                                            const newValue = prompt("Утга оруулах (÷, ×, +, -, =, тоо) эсвэл 'black' гэж бичээд хар өнгө өгнө:", cell.value);
                                                                                                            if (newValue !== null) {
                                                                                                                const updated = newQuestion.gridData.map((r, ri) =>
                                                                                                                    r.map((c, ci) => {
                                                                                                                        if (ri === rowIdx && ci === colIdx) {
                                                                                                                            if (newValue.toLowerCase() === "black") {
                                                                                                                                return { ...c, isBlack: !c.isBlack };
                                                                                                                            }
                                                                                                                            return { ...c, value: newValue, isBlack: false };
                                                                                                                        }
                                                                                                                        return c;
                                                                                                                    })
                                                                                                                );
                                                                                                                setNewQuestion({ ...newQuestion, gridData: updated });
                                                                                                            }
                                                                                                        }}>
                                                                                                        {cell.value}
                                                                                                    </div>
                                                                                                    {!cell.isBlack && (
                                                                                                        <input
                                                                                                            type="checkbox"
                                                                                                            checked={cell.isCorrect}
                                                                                                            onChange={(e) => {
                                                                                                                const updated = newQuestion.gridData.map((r, ri) =>
                                                                                                                    r.map((c, ci) => {
                                                                                                                        if (ri === rowIdx && ci === colIdx) {
                                                                                                                            return { ...c, isCorrect: e.target.checked };
                                                                                                                        }
                                                                                                                        return c;
                                                                                                                    })
                                                                                                                );
                                                                                                                setNewQuestion({ ...newQuestion, gridData: updated });
                                                                                                            }}
                                                                                                            className="absolute -bottom-1 -right-1 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                                                                            title="Зөв хариулт"
                                                                                                        />
                                                                                                    )}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                                <p className="text-xs text-gray-500 mt-2">💡 Нүд дээр дарж утга оруулна. "black" гэж бичвэл хар өнгө өгнө. Checkbox-аар зөв хариулт сонгоно.</p>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Зөв хариулт</label>
                                                                        <div className="space-y-2">
                                                                            {newQuestion.correctAnswers?.map((ans, ai) => (
                                                                                <div key={ai} className="flex gap-2 items-center">
                                                                                    <input
                                                                                        className="input"
                                                                                        placeholder={`Зөв хариулт ${ai + 1}`}
                                                                                        value={ans}
                                                                                        onChange={(e) => {
                                                                                            const updated = [...(newQuestion.correctAnswers || [])];
                                                                                            updated[ai] = e.target.value;
                                                                                            setNewQuestion({ ...newQuestion, correctAnswers: updated });
                                                                                        }}
                                                                                    />
                                                                                    {newQuestion.correctAnswers.length > 1 && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                const updated = newQuestion.correctAnswers.filter((_, i) => i !== ai);
                                                                                                setNewQuestion({ ...newQuestion, correctAnswers: updated });
                                                                                            }}
                                                                                            className="text-red-600 px-2">
                                                                                            Устгах
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                            <button onClick={() => setNewQuestion({ ...newQuestion, correctAnswers: [...(newQuestion.correctAnswers || []), ""] })} className="btn-secondary text-sm">
                                                                                Нэмэх
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Submit Buttons */}
                                                        <div className="flex gap-2 pt-4">
                                                            <button
                                                                className="btn-primary text-sm"
                                                                onClick={async () => {
                                                                    if (!newQuestion.questionText.trim()) {
                                                                        alert("Асуулт оруулна уу");
                                                                        return;
                                                                    }
                                                                    if (newQuestion.questionType === "multiple_choice") {
                                                                        if (!newQuestion.options.some((o) => o.isCorrect)) {
                                                                            alert("Зөв хариулт тэмдэглэнэ үү");
                                                                            return;
                                                                        }
                                                                    } else if (newQuestion.questionType === "grid") {
                                                                        const hasCorrectAnswer = newQuestion.gridData.some((row) => row.some((cell) => cell.isCorrect));
                                                                        if (!hasCorrectAnswer) {
                                                                            alert("Grid-д зөв хариултаа checkbox-аар сонгоно уу");
                                                                            return;
                                                                        }
                                                                    } else {
                                                                        const hasAny = (newQuestion.correctAnswers || []).some((a) => String(a || "").trim());
                                                                        if (!hasAny) {
                                                                            alert("Зөв хариулт оруулна уу");
                                                                            return;
                                                                        }
                                                                    }
                                                                    try {
                                                                        // Prepare payload and convert plain-text question into HTML paragraphs
                                                                        const payload = { ...newQuestion, testId: test.id };
                                                                        // Convert textarea newlines into <p>...</p> blocks
                                                                        const rawText = (newQuestion.questionText || "").toString();
                                                                        const paragraphs = rawText
                                                                            .split(/\n+/)
                                                                            .map((s) => s.trim())
                                                                            .filter(Boolean);
                                                                        payload.questionText = paragraphs.length ? paragraphs.map((p) => `<p>${p}</p>`).join("") : "";
                                                                        if (newQuestion.correctAnswers) {
                                                                            payload.correctAnswer = newQuestion.correctAnswers.length === 1 ? newQuestion.correctAnswers[0] : newQuestion.correctAnswers;
                                                                        }
                                                                        // For grid type, leave `gridData` as an object — backend will stringify it
                                                                        // (avoid double-stringifying)
                                                                        if (editingQuestionId) {
                                                                            await updateQuestion(editingQuestionId, payload);
                                                                            alert("Асуулт засагдлаа");
                                                                        } else {
                                                                            const questionOrder = (testQuestions[test.id]?.length || 0) + 1;
                                                                            await createQuestion({ ...payload, questionOrder });
                                                                            alert("Асуулт нэмэгдлээ");
                                                                        }
                                                                        loadQuestions(test.id);
                                                                        loadAll();
                                                                        setNewQuestion({
                                                                            questionText: "",
                                                                            imageUrls: [],
                                                                            questionType: "multiple_choice",
                                                                            correctAnswers: [""],
                                                                            options: [{ label: "A", optionText: "", imageUrl: "", isCorrect: false }],
                                                                            gridData: Array(7)
                                                                                .fill(null)
                                                                                .map(() => Array(7).fill({ value: "", isBlack: false, isCorrect: false })),
                                                                        });
                                                                        setEditingTestId(null);
                                                                        setEditingQuestionId(null);
                                                                    } catch (e) {
                                                                        alert(e.response?.data?.error || "Алдаа гарлаа");
                                                                    }
                                                                }}>
                                                                Хадгалах
                                                            </button>
                                                            <button
                                                                className="btn-secondary text-sm"
                                                                onClick={() => {
                                                                    setEditingTestId(null);
                                                                    setEditingQuestionId(null);
                                                                }}>
                                                                Цуцлах
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingTestId(test.id);
                                                        setEditingQuestionId(null);
                                                        setNewQuestion({
                                                            questionText: "",
                                                            imageUrls: [],
                                                            questionType: "multiple_choice",
                                                            correctAnswers: [""],
                                                            options: [{ label: "A", optionText: "", imageUrl: "", isCorrect: false }],
                                                            gridData: Array(7)
                                                                .fill(null)
                                                                .map(() => Array(7).fill({ value: "", isBlack: false, isCorrect: false })),
                                                        });
                                                    }}
                                                    className="btn-primary mb-4 text-sm flex items-center gap-2">
                                                    <Plus className="w-4 h-4" />
                                                    Асуулт нэмэх
                                                </button>
                                            )}

                                            {/* Questions List */}
                                            <div className="space-y-3">
                                                {testQuestions[test.id] ? (
                                                    testQuestions[test.id].length > 0 ? (
                                                        testQuestions[test.id].map((q, index) => (
                                                            <div key={q.id} className="relative p-4 bg-white border rounded-lg shadow-sm">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{index + 1}</span>
                                                                            <div className="flex-1">
                                                                                <p className="font-medium text-gray-900 mb-2">{q.questionText}</p>
                                                                                {q.images && q.images.length > 0 && (
                                                                                    <div className="flex flex-wrap gap-3 mb-3">
                                                                                        {q.images.map((img) => (
                                                                                            <img key={img.id} src={`http://localhost:3001${img.imageUrl}`} alt="Question" className="w-20 h-20 object-cover rounded border cursor-pointer" onClick={() => setLightboxSrc(`http://localhost:3001${img.imageUrl}`)} />
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                                <div className="space-y-1">
                                                                                    {q.options?.map((opt) => (
                                                                                        <div key={opt.id} className="text-sm flex items-center gap-2">
                                                                                            <span className={`px-2 py-0.5 rounded ${opt.isCorrect ? "bg-green-100 text-green-700 font-medium" : "bg-gray-100 text-gray-600"}`}>{opt.label}</span>
                                                                                            {opt.imageUrl && <img src={`http://localhost:3001${opt.imageUrl}`} alt={opt.label} className="w-10 h-10 object-cover rounded cursor-pointer" onClick={() => setLightboxSrc(`http://localhost:3001${opt.imageUrl}`)} />}
                                                                                            <span>{opt.optionText}</span>
                                                                                            {opt.isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute top-3 right-3 flex gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                // open edit modal (centered) instead of inline top
                                                                                setModalTestId(test.id);
                                                                                setEditingQuestionId(q.id);

                                                                                // parse correctAnswer which may be stored as JSON string
                                                                                let parsedCorrect = q.correctAnswer;
                                                                                try {
                                                                                    if (typeof parsedCorrect === "string") {
                                                                                        const s = parsedCorrect.trim();
                                                                                        if (s.startsWith("[") || s.startsWith("{")) {
                                                                                            parsedCorrect = JSON.parse(s);
                                                                                        }
                                                                                    }
                                                                                } catch (err) {
                                                                                    // leave as-is if parse fails
                                                                                }

                                                                                setNewQuestion({
                                                                                    questionText: q.questionText || "",
                                                                                    imageUrls: (q.images || []).map((i) => i.imageUrl),
                                                                                    questionType: q.questionType || "multiple_choice",
                                                                                    correctAnswers: parsedCorrect ? (Array.isArray(parsedCorrect) ? parsedCorrect : [String(parsedCorrect)]) : [""],
                                                                                    options: (q.options || []).map((o) => ({ label: o.label || "", optionText: o.optionText || "", imageUrl: o.imageUrl || "", isCorrect: !!o.isCorrect })),
                                                                                    gridData: q.gridData
                                                                                        ? typeof q.gridData === "string"
                                                                                            ? JSON.parse(q.gridData)
                                                                                            : q.gridData
                                                                                        : Array(7)
                                                                                              .fill(null)
                                                                                              .map(() => Array(7).fill({ value: "", isBlack: false, isCorrect: false })),
                                                                                });
                                                                                setShowEditModal(true);
                                                                            }}
                                                                            className="p-2 rounded-md text-blue-600 hover:bg-blue-50 bg-white/60 backdrop-blur-sm">
                                                                            Засах
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (confirm("Устгах уу?")) {
                                                                                    try {
                                                                                        await deleteQuestion(q.id);
                                                                                        loadQuestions(test.id);
                                                                                        loadAll();
                                                                                    } catch (e) {
                                                                                        alert("Алдаа гарлаа");
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="p-2 rounded-md text-red-600 hover:bg-red-50 bg-white/60 backdrop-blur-sm">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-500">Энэ тестэд асуулт байхгүй байна</div>
                                                    )
                                                ) : (
                                                    <div className="text-center py-4 text-gray-400">Ачаалж байна...</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Question Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => {
                            setShowEditModal(false);
                            setEditingQuestionId(null);
                            setModalTestId(null);
                        }}
                    />
                    <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-auto max-h-[90vh] p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold">Асуулт засах</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingQuestionId(null);
                                    setModalTestId(null);
                                }}
                                className="ml-3 bg-white w-8 h-8 rounded-full flex items-center justify-center text-gray-600 shadow-sm">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Асуулт</label>
                                <ReactQuill theme="snow" value={newQuestion.questionText} onChange={(value) => setNewQuestion({ ...newQuestion, questionText: value })} className="bg-white" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Зургууд (олон зураг оруулж болно)</label>
                                <div className="space-y-2">
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id={`modalImageUpload`}
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                setUploadingImage(true);
                                                try {
                                                    const res = await uploadImage(file);
                                                    setNewQuestion({ ...newQuestion, imageUrls: [...newQuestion.imageUrls, res.data.imageUrl] });
                                                } catch (err) {
                                                    alert("Зураг хуулахад алдаа гарлаа");
                                                } finally {
                                                    setUploadingImage(false);
                                                }
                                            }}
                                        />
                                        <label htmlFor={`modalImageUpload`} className="btn-secondary flex items-center gap-2 cursor-pointer text-sm">
                                            <Upload className="w-4 h-4" />
                                            {uploadingImage ? "Хуулж байна..." : "Зураг нэмэх"}
                                        </label>
                                        <span className="text-sm text-gray-600">{newQuestion.imageUrls.length} зураг</span>
                                    </div>
                                    {newQuestion.imageUrls.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {newQuestion.imageUrls.map((url, idx) => (
                                                <div key={idx} className="relative">
                                                    <img src={`http://localhost:3001${url}`} alt={`Preview ${idx + 1}`} className="w-20 h-20 object-cover rounded border cursor-pointer" onClick={() => setLightboxSrc(`http://localhost:3001${url}`)} />
                                                    <button onClick={() => setNewQuestion({ ...newQuestion, imageUrls: newQuestion.imageUrls.filter((_, i) => i !== idx) })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Асуултын төрөл</label>
                                <select className="input text-sm" value={newQuestion.questionType} onChange={(e) => setNewQuestion({ ...newQuestion, questionType: e.target.value })}>
                                    <option value="multiple_choice">Сонголттой</option>
                                    <option value="short_answer">Текст</option>
                                    <option value="numeric">Тоо</option>
                                    <option value="grid">Grid / Зурагтай томъёо</option>
                                </select>
                            </div>

                            {newQuestion.questionType === "multiple_choice" ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Сонголтууд</label>
                                    <div className="space-y-2">
                                        {newQuestion.options.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2 items-start border p-3 rounded-lg bg-white">
                                                <input
                                                    className="input w-16 text-sm"
                                                    placeholder="Label"
                                                    value={opt.label}
                                                    onChange={(e) => {
                                                        const updated = [...newQuestion.options];
                                                        updated[idx].label = e.target.value;
                                                        setNewQuestion({ ...newQuestion, options: updated });
                                                    }}
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        className="input text-sm"
                                                        placeholder="Хариултын текст"
                                                        value={opt.optionText}
                                                        onChange={(e) => {
                                                            const updated = [...newQuestion.options];
                                                            updated[idx].optionText = e.target.value;
                                                            setNewQuestion({ ...newQuestion, options: updated });
                                                        }}
                                                    />
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            id={`modalOptionImage-${idx}`}
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;
                                                                try {
                                                                    const res = await uploadImage(file);
                                                                    const updated = [...newQuestion.options];
                                                                    updated[idx].imageUrl = res.data.imageUrl;
                                                                    setNewQuestion({ ...newQuestion, options: updated });
                                                                } catch (err) {
                                                                    alert("Зураг хуулахад алдаа гарлаа");
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={`modalOptionImage-${idx}`} className="text-xs bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200">
                                                            {opt.imageUrl ? "✓ Зураг" : "+ Зураг"}
                                                        </label>
                                                        {opt.imageUrl && (
                                                            <button
                                                                onClick={() => {
                                                                    const updated = [...newQuestion.options];
                                                                    updated[idx].imageUrl = "";
                                                                    setNewQuestion({ ...newQuestion, options: updated });
                                                                }}
                                                                className="text-xs text-red-600 hover:underline">
                                                                Устгах
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-1 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={opt.isCorrect}
                                                        onChange={(e) => {
                                                            const updated = [...newQuestion.options];
                                                            updated[idx] = { ...updated[idx], isCorrect: e.target.checked };
                                                            setNewQuestion({ ...newQuestion, options: updated });
                                                        }}
                                                    />
                                                    <span className="text-sm">Зөв</span>
                                                </label>
                                                {newQuestion.options.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            const updated = newQuestion.options.filter((_, i) => i !== idx);
                                                            setNewQuestion({ ...newQuestion, options: updated });
                                                        }}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const nextLabel = String.fromCharCode(65 + newQuestion.options.length);
                                            setNewQuestion({ ...newQuestion, options: [...newQuestion.options, { label: nextLabel, optionText: "", imageUrl: "", isCorrect: false }] });
                                        }}
                                        className="btn-secondary mt-2 flex items-center gap-2 text-sm">
                                        <Plus className="w-4 h-4" /> Сонголт нэмэх
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {newQuestion.questionType === "grid" ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Grid бөглөх</label>
                                            <div className="bg-white p-4 rounded-lg border">
                                                <div className="inline-block">
                                                    {newQuestion.gridData.map((row, rowIdx) => (
                                                        <div key={rowIdx} className="flex">
                                                            {row.map((cell, colIdx) => (
                                                                <div key={`${rowIdx}-${colIdx}`} className="relative group">
                                                                    <div
                                                                        className={`w-12 h-12 border border-gray-300 flex items-center justify-center cursor-pointer text-sm font-medium transition-colors ${
                                                                            cell.isBlack ? "bg-gray-900 text-white" : cell.isCorrect ? "bg-green-100 border-green-400 text-green-800 font-bold" : "bg-white hover:bg-gray-50"
                                                                        }`}
                                                                        onClick={() => {
                                                                            const newValue = prompt("Утга оруулах (÷, ×, +, -, =, тоо) эсвэл 'black' гэж бичээд хар өнгө өгнө:", cell.value);
                                                                            if (newValue !== null) {
                                                                                const updated = newQuestion.gridData.map((r, ri) =>
                                                                                    r.map((c, ci) => {
                                                                                        if (ri === rowIdx && ci === colIdx) {
                                                                                            if (newValue.toLowerCase() === "black") {
                                                                                                return { ...c, isBlack: !c.isBlack };
                                                                                            }
                                                                                            return { ...c, value: newValue, isBlack: false };
                                                                                        }
                                                                                        return c;
                                                                                    })
                                                                                );
                                                                                setNewQuestion({ ...newQuestion, gridData: updated });
                                                                            }
                                                                        }}>
                                                                        {cell.value}
                                                                    </div>
                                                                    {!cell.isBlack && (
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={cell.isCorrect}
                                                                            onChange={(e) => {
                                                                                const updated = newQuestion.gridData.map((r, ri) =>
                                                                                    r.map((c, ci) => {
                                                                                        if (ri === rowIdx && ci === colIdx) {
                                                                                            return { ...c, isCorrect: e.target.checked };
                                                                                        }
                                                                                        return c;
                                                                                    })
                                                                                );
                                                                                setNewQuestion({ ...newQuestion, gridData: updated });
                                                                            }}
                                                                            className="absolute -bottom-1 -right-1 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                                            title="Зөв хариулт"
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">💡 Нүд дээр дарж утга оруулна. "black" гэж бичвэл хар өнгө өгнө. Checkbox-аар зөв хариулт сонгоно.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Зөв хариулт</label>
                                            <div className="space-y-2">
                                                {newQuestion.correctAnswers?.map((ans, ai) => (
                                                    <div key={ai} className="flex gap-2 items-center">
                                                        <input
                                                            className="input"
                                                            placeholder={`Зөв хариулт ${ai + 1}`}
                                                            value={ans}
                                                            onChange={(e) => {
                                                                const updated = [...(newQuestion.correctAnswers || [])];
                                                                updated[ai] = e.target.value;
                                                                setNewQuestion({ ...newQuestion, correctAnswers: updated });
                                                            }}
                                                        />
                                                        {newQuestion.correctAnswers.length > 1 && (
                                                            <button
                                                                onClick={() => {
                                                                    const updated = newQuestion.correctAnswers.filter((_, i) => i !== ai);
                                                                    setNewQuestion({ ...newQuestion, correctAnswers: updated });
                                                                }}
                                                                className="text-red-600 px-2">
                                                                Устгах
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button onClick={() => setNewQuestion({ ...newQuestion, correctAnswers: [...(newQuestion.correctAnswers || []), ""] })} className="btn-secondary text-sm">
                                                    Нэмэх
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <button
                                    className="btn-primary text-sm"
                                    onClick={async () => {
                                        if (!newQuestion.questionText.toString().trim()) {
                                            alert("Асуулт оруулна уу");
                                            return;
                                        }
                                        if (newQuestion.questionType === "multiple_choice") {
                                            if (!newQuestion.options.some((o) => o.isCorrect)) {
                                                alert("Зөв хариулт тэмдэглэнэ үү");
                                                return;
                                            }
                                        } else if (newQuestion.questionType === "grid") {
                                            const hasCorrectAnswer = newQuestion.gridData.some((row) => row.some((cell) => cell.isCorrect));
                                            if (!hasCorrectAnswer) {
                                                alert("Grid-д зөв хариултаа checkbox-аар сонгоно уу");
                                                return;
                                            }
                                        } else {
                                            const hasAny = (newQuestion.correctAnswers || []).some((a) => String(a || "").trim());
                                            if (!hasAny) {
                                                alert("Зөв хариулт оруулна уу");
                                                return;
                                            }
                                        }
                                        try {
                                            const payload = { ...newQuestion, testId: modalTestId };
                                            const rawText = (newQuestion.questionText || "").toString();
                                            const paragraphs = rawText
                                                .split(/\n+/)
                                                .map((s) => s.trim())
                                                .filter(Boolean);
                                            payload.questionText = paragraphs.length ? paragraphs.map((p) => `<p>${p}</p>`).join("") : "";
                                            if (newQuestion.correctAnswers) {
                                                payload.correctAnswer = newQuestion.correctAnswers.length === 1 ? newQuestion.correctAnswers[0] : newQuestion.correctAnswers;
                                            }
                                            if (editingQuestionId) {
                                                await updateQuestion(editingQuestionId, payload);
                                                alert("Асуулт засагдлаа");
                                            } else {
                                                const questionOrder = (testQuestions[modalTestId]?.length || 0) + 1;
                                                await createQuestion({ ...payload, questionOrder });
                                                alert("Асуулт нэмэгдлээ");
                                            }
                                            loadQuestions(modalTestId);
                                            loadAll();
                                            setNewQuestion({
                                                questionText: "",
                                                imageUrls: [],
                                                questionType: "multiple_choice",
                                                correctAnswers: [""],
                                                options: [{ label: "A", optionText: "", imageUrl: "", isCorrect: false }],
                                                gridData: Array(7)
                                                    .fill(null)
                                                    .map(() => Array(7).fill({ value: "", isBlack: false, isCorrect: false })),
                                            });
                                            setShowEditModal(false);
                                            setEditingQuestionId(null);
                                            setModalTestId(null);
                                        } catch (e) {
                                            alert(e.response?.data?.error || "Алдаа гарлаа");
                                        }
                                    }}>
                                    Хадгалах
                                </button>
                                <button
                                    className="btn-secondary text-sm"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingQuestionId(null);
                                        setModalTestId(null);
                                    }}>
                                    Цуцлах
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </div>
    );
}
