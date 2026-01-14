import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Test from "./pages/Test";
import TestResult from "./pages/TestResult";
import Results from "./pages/Results";
import Account from "./pages/Account";
import Admin from "./pages/Admin";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/test"
                            element={
                                <ProtectedRoute>
                                    <Test />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/result/:id"
                            element={
                                <ProtectedRoute>
                                    <TestResult />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/results"
                            element={
                                <ProtectedRoute>
                                    <Results />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <Account />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute adminOnly>
                                    <Admin />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
