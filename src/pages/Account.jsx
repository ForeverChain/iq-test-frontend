import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getBalance, getTransactionHistory, searchUsers, createTransfer, getMe } from "../api";
import Loading from "../components/Loading";
import { Wallet, Send, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Search, User } from "lucide-react";

const Account = () => {
    const { user, updateUser } = useAuth();
    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTransferModal, setShowTransferModal] = useState(false);

    // Transfer form state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [amount, setAmount] = useState("");
    const [transferLoading, setTransferLoading] = useState(false);
    const [transferError, setTransferError] = useState("");
    const [transferSuccess, setTransferSuccess] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [balanceRes, transactionsRes] = await Promise.all([getBalance(), getTransactionHistory()]);
            setBalance(balanceRes.data.balance);
            setTransactions(transactionsRes.data);
        } catch (err) {
            console.error("Error loading account data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length >= 2) {
            try {
                const response = await searchUsers(query);
                setSearchResults(response.data);
            } catch (err) {
                console.error("Error searching users:", err);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        setTransferError("");
        setTransferSuccess("");

        if (!selectedUser) {
            setTransferError("Хүлээн авагч сонгоно уу");
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setTransferError("Зөв дүн оруулна уу");
            return;
        }

        if (amountNum > parseFloat(balance)) {
            setTransferError("Үлдэгдэл хүрэлцэхгүй байна");
            return;
        }

        setTransferLoading(true);
        try {
            await createTransfer(selectedUser.id, amountNum);
            setTransferSuccess("Шилжүүлэг амжилттай үүслээ. Админ баталгаажуулахыг хүлээнэ үү.");

            // Refresh data
            const transactionsRes = await getTransactionHistory();
            setTransactions(transactionsRes.data);

            // Reset form
            setSelectedUser(null);
            setSearchQuery("");
            setAmount("");

            setTimeout(() => {
                setShowTransferModal(false);
                setTransferSuccess("");
            }, 2000);
        } catch (err) {
            setTransferError(err.response?.data?.error || "Шилжүүлэг хийхэд алдаа гарлаа");
        } finally {
            setTransferLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Амжилттай
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        <Clock className="w-3 h-3" />
                        Хүлээгдэж буй
                    </span>
                );
            case "failed":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        <XCircle className="w-3 h-3" />
                        Цуцлагдсан
                    </span>
                );
            default:
                return null;
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

    if (loading) return <Loading text="Ачаалж байна..." />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Миний хаяг</h1>

                {/* Balance Card */}
                <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-primary-100 mb-1">Үлдэгдэл</p>
                            <p className="text-4xl font-bold">₮{parseFloat(balance || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <Wallet className="w-8 h-8" />
                        </div>
                    </div>
                    <button onClick={() => setShowTransferModal(true)} className="mt-6 w-full bg-white text-primary-600 font-medium py-3 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
                        <Send className="w-5 h-5" />
                        Мөнгө шилжүүлэх
                    </button>
                </div>

                {/* User Info */}
                <div className="card mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Хэрэглэгчийн мэдээлэл</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Хэрэглэгчийн нэр</p>
                            <p className="font-medium text-gray-900">{user?.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Имэйл</p>
                            <p className="font-medium text-gray-900">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Шилжүүлгийн түүх</h2>

                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Шилжүүлгийн түүх хоосон байна</div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "sent" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>{tx.type === "sent" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}</div>
                                        <div>
                                            <p className="font-medium text-gray-900">{tx.type === "sent" ? `${tx.receiverUsername} руу илгээсэн` : `${tx.senderUsername}-аас хүлээн авсан`}</p>
                                            <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${tx.type === "sent" ? "text-red-600" : "text-green-600"}`}>
                                            {tx.type === "sent" ? "-" : "+"}₮{parseFloat(tx.amount).toLocaleString()}
                                        </p>
                                        <div className="mt-1">{getStatusBadge(tx.status)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Мөнгө шилжүүлэх</h2>

                        {transferSuccess ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <p className="text-green-600">{transferSuccess}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleTransfer} className="space-y-4">
                                {transferError && <div className="p-3 bg-red-50 text-red-600 rounded-lg">{transferError}</div>}

                                {/* User Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Хүлээн авагч</label>
                                    {selectedUser ? (
                                        <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <User className="w-5 h-5 text-primary-600" />
                                                <span className="font-medium">{selectedUser.username}</span>
                                            </div>
                                            <button type="button" onClick={() => setSelectedUser(null)} className="text-red-500 hover:text-red-600">
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Хэрэглэгчийн нэр хайх..." className="input-field pl-10" />
                                            {searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                                                    {searchResults.map((u) => (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedUser(u);
                                                                setSearchResults([]);
                                                                setSearchQuery("");
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                                                            <User className="w-4 h-4 text-gray-400" />
                                                            {u.username}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Дүн</label>
                                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" className="input-field" required />
                                    <p className="text-sm text-gray-500 mt-1">Боломжит үлдэгдэл: ₮{parseFloat(balance || 0).toLocaleString()}</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTransferModal(false);
                                            setTransferError("");
                                            setSelectedUser(null);
                                            setAmount("");
                                        }}
                                        className="flex-1 btn-secondary">
                                        Цуцлах
                                    </button>
                                    <button type="submit" disabled={transferLoading} className="flex-1 btn-primary">
                                        {transferLoading ? "Илгээж байна..." : "Илгээх"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Account;
