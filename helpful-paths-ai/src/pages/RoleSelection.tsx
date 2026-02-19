import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Settings, Building2, ChevronRight } from 'lucide-react';

const RoleSelection = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'doctor',
            title: 'Doctor',
            titleTA: 'டாக்டர்',
            image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
            icon: <Building2 size={32} className="text-[#E91E63]" />,
            description: 'Access patient records and diagnostic tools.',
            descriptionTA: 'நோயாளி பதிவுகள் மற்றும் நோயறிதல் கருவிகளை அணுகவும்.',
            bgColor: 'bg-[#FCE4EC]',
            borderColor: 'border-[#F8BBD0]',
        },
        {
            id: 'patient',
            title: 'Patient',
            titleTA: 'நோயாளி',
            image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
            icon: <Users size={32} className="text-[#E91E63]" />,
            description: 'Get directions to departments and find your room.',
            descriptionTA: 'துறைகளுக்கான வழிகள் மற்றும் அறையைக் கண்டறிய.',
            bgColor: 'bg-[#FCE4EC]',
            borderColor: 'border-[#F8BBD0]',
        },
        {
            id: 'others',
            title: 'Others',
            titleTA: 'மற்றவை',
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
            icon: <Building2 size={32} className="text-[#E91E63]" />,
            description: 'Locate patients, general assistance, and staff directory.',
            descriptionTA: 'நோயாளிகளைக் கண்டறியவும், பொது உதவி மற்றும் ஊழியர் பட்டியல்.',
            bgColor: 'bg-[#FCE4EC]',
            borderColor: 'border-[#F8BBD0]',
        },
    ];

    const handleRoleSelection = (roleId: string) => {
        navigate(`/kiosk?role=${roleId}`);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Soft decorative elements */}
            <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#FCE4EC] rounded-full blur-[80px] opacity-50" />
            <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#FCE4EC] rounded-full blur-[80px] opacity-50" />

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 z-10"
            >
                <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-[#FCE4EC] rounded-3xl flex items-center justify-center shadow-sm border border-[#F8BBD0]">
                        <Building2 className="text-[#E91E63]" size={40} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-tight">
                        SMART HOSPITAL<br />
                        <span className="text-[#E91E63]">NAVIGATION SYSTEM</span>
                    </h1>
                </div>
                <p className="text-black/60 font-bold uppercase tracking-[0.2em] text-sm">
                    Select Your Role to Continue
                </p>
                <div className="h-1 w-24 bg-[#E91E63] mx-auto mt-4 rounded-full" />
            </motion.div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full max-w-7xl z-10 px-4">
                {roles.map((role, index) => (
                    <motion.button
                        key={role.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRoleSelection(role.id)}
                        className={`${role.bgColor} p-0 rounded-[3rem] flex flex-col items-stretch text-left border-2 ${role.borderColor} shadow-xl shadow-pink-100/50 hover:shadow-2xl hover:shadow-pink-200/60 transition-all group overflow-hidden`}
                    >
                        {/* Image Header */}
                        <div className="h-56 relative overflow-hidden">
                            <img
                                src={role.image}
                                alt={role.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            <div className="absolute bottom-6 right-6 w-16 h-16 rounded-2xl bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
                                {role.icon}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col gap-4">
                            <div>
                                <h3 className="text-3xl font-black text-black leading-none">{role.title}</h3>
                                <p className="text-[#E91E63] font-bold text-lg mt-1">{role.titleTA}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-black/70 font-semibold leading-relaxed">{role.description}</p>
                                <p className="text-black/50 text-sm italic font-medium">{role.descriptionTA}</p>
                            </div>

                            <div className="mt-4 bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-transparent group-hover:border-[#E91E63] group-hover:text-[#E91E63] transition-all">
                                Enter System <ChevronRight size={20} />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-16 text-center z-10"
            >
                <p className="text-xs font-black text-black/40 uppercase tracking-[0.4em]">
                    Powered by Advanced AI Navigation
                </p>
                <div className="flex gap-2 justify-center mt-6">
                    <div className="w-8 h-1 rounded-full bg-[#E91E63]" />
                    <div className="w-2 h-1 rounded-full bg-[#F8BBD0]" />
                    <div className="w-2 h-1 rounded-full bg-[#F8BBD0]" />
                </div>
            </motion.footer>
        </div>
    );
};

export default RoleSelection;
