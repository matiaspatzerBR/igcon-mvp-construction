import { useStore } from '../../../store/useStore';
import { EngineerPlanning } from './EngineerPlanning';
import { ForemanKanban } from './ForemanKanban';
import { InternQC } from './InternQC';

export const WeeklyPage = () => {
    const { currentUser } = useStore();

    if (!currentUser) return <div>Please select a role.</div>;

    // Role-based Routing
    switch (currentUser.role) {
        case 'engenheiro':
            return <EngineerPlanning />;
        case 'mestre':
            return <ForemanKanban />;
        case 'estagiario':
            return <InternQC />;
        default:
            return (
                <div className="text-center mt-10">
                    <h2 className="text-xl font-bold text-gray-700">Acesso Restrito</h2>
                    <p className="text-gray-500">Esta visão não está disponível para o seu perfil ({currentUser.role}).</p>
                </div>
            );
    }
};

export default WeeklyPage;
