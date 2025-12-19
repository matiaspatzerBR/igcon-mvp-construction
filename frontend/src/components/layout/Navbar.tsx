import { NavLink } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
    LayoutGrid,
    CalendarClock,
    BarChart3,
    BarChart2,
    Settings,
    UserCircle
} from 'lucide-react';
import clsx from 'clsx';

export const Navbar = () => {
    const { currentUser, profiles, setCurrentUser } = useStore();

    return (
        <nav className="bg-blue-900 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 bg-white text-blue-900 flex items-center justify-center rounded">iG</div>
                        <span>Construction</span>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-8">
                        <NavLink
                            to="/"
                            className={({ isActive }) => clsx("flex items-center gap-2 hover:text-blue-200 transition", isActive && "text-blue-300 font-semibold border-b-2 border-blue-300")}
                        >
                            <LayoutGrid size={18} /> Matriz
                        </NavLink>
                        <NavLink
                            to="/weekly"
                            className={({ isActive }) => clsx("flex items-center gap-2 hover:text-blue-200 transition", isActive && "text-blue-300 font-semibold border-b-2 border-blue-300")}
                        >
                            <CalendarClock size={18} /> Planejamento
                        </NavLink>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => clsx("flex items-center gap-2 hover:text-blue-200 transition", isActive && "text-blue-300 font-semibold border-b-2 border-blue-300")}
                        >
                            <BarChart3 size={18} /> Dashboards
                        </NavLink>
                        {currentUser?.role === 'engenheiro' && (
                            <NavLink
                                to="/performance"
                                className={({ isActive }) => clsx("flex items-center gap-2 hover:text-blue-200 transition", isActive && "text-blue-300 font-semibold border-b-2 border-blue-300")}
                            >
                                <BarChart2 size={18} /> Desempenho
                            </NavLink>
                        )}
                        {currentUser?.role === 'engenheiro' && (
                            <NavLink
                                to="/config"
                                className={({ isActive }) => clsx("flex items-center gap-2 hover:text-blue-200 transition", isActive && "text-blue-300 font-semibold border-b-2 border-blue-300")}
                            >
                                <Settings size={18} /> Configuração
                            </NavLink>
                        )}
                    </div>

                    {/* Role Simulator */}
                    <div className="flex items-center gap-3 bg-blue-800 py-1 px-3 rounded-lg border border-blue-700">
                        <UserCircle size={20} className="text-blue-200" />
                        <div className="flex flex-col">
                            <span className="text-xs text-blue-300 uppercase font-bold">Simular Perfil:</span>
                            <select
                                className="bg-transparent text-sm font-semibold outline-none cursor-pointer"
                                value={currentUser?.id}
                                onChange={(e) => {
                                    const user = profiles.find(p => p.id === e.target.value);
                                    if (user) setCurrentUser(user);
                                }}
                            >
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id} className="text-gray-900">
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
