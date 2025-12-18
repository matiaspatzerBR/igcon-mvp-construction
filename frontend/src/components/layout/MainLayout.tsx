import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useStore } from '../../store/useStore';

export const MainLayout = () => {
    const { lastError } = useStore();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            {/* Error Toast */}
            {lastError && (
                <div className="fixed top-20 right-4 z-50 animate-bounce">
                    <div className="bg-red-600 text-white px-6 py-3 rounded shadow-lg font-bold flex items-center gap-2">
                        ⚠️ {lastError}
                    </div>
                </div>
            )}

            <main className="flex-1 container mx-auto p-4 md:p-6 overflow-x-auto">
                <Outlet />
            </main>
        </div>
    );
};
