const Loading = ({ text = "Уншиж байна..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500">{text}</p>
        </div>
    );
};

export default Loading;
