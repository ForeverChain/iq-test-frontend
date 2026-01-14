import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Brain, Target, Trophy, Users, ArrowRight, CheckCircle } from "lucide-react";

const Home = () => {
    const { user } = useAuth();

    const features = [
        {
            icon: Brain,
            title: "Оюуны чадварын тест",
            description: "20 асуулттай IQ тест өгч өөрийн оюуны чадварыг хэмжээрэй",
        },
        {
            icon: Target,
            title: "Нарийвчилсан дүн шинжилгээ",
            description: "Тестийн үр дүнг график, статистикаар харах боломжтой",
        },
        {
            icon: Trophy,
            title: "Түүх хадгалах",
            description: "Өмнө өгсөн тестүүдийнхээ түүхийг хадгалж, хөгжлөө хянах",
        },
        {
            icon: Users,
            title: "Хэрэглэгчийн систем",
            description: "Бүртгүүлж өөрийн хаягаа удирдах, мөнгө шилжүүлэх",
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <Brain className="w-20 h-20" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Оюуны чадварын тест</h1>
                        <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">Өөрийн IQ-ийг мэдэж, оюуны чадвараа хөгжүүлээрэй</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {user ? (
                                <Link to="/test" className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors">
                                    Тест эхлүүлэх
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors">
                                        Бүртгүүлэх
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link to="/login" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors">
                                        Нэвтрэх
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Яагаад бидний тестийг сонгох вэ?</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="card text-center hover:shadow-md transition-shadow">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 text-primary-600 rounded-xl mb-4">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Хэрхэн ажилладаг вэ?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                            <h3 className="text-lg font-semibold mb-2">Бүртгүүлэх</h3>
                            <p className="text-gray-600">Хэдхэн секундэд бүртгүүлээд эхэлнэ үү</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                            <h3 className="text-lg font-semibold mb-2">Тест өгөх</h3>
                            <p className="text-gray-600">20 асуултад хариулж IQ-ээ тодорхойл</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                            <h3 className="text-lg font-semibold mb-2">Үр дүн харах</h3>
                            <p className="text-gray-600">Тестийн үр дүнг нарийвчлан судлаарай</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Одоо эхлээрэй!</h2>
                    <p className="text-primary-100 text-lg mb-8">Өөрийн IQ-ийг мэдэхэд хэдхэн минут л хангалттай</p>
                    {!user && (
                        <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors">
                            Үнэгүй бүртгүүлэх
                            <CheckCircle className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Brain className="w-6 h-6 text-primary-400" />
                        <span className="text-white font-semibold">IQ Test</span>
                    </div>
                    <p>© 2024 IQ Test. Бүх эрх хуулиар хамгаалагдсан.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
