import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Users, Settings, Building2, ChevronRight } from 'lucide-react';

const RoleSelection = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'doctor',
            title: 'Doctor',
            titleTA: 'மருத்துவர்',
            icon: <Stethoscope size={40} className="text-primary" />,
            description: 'Access patient records, analytics and navigation.',
            descriptionTA: 'நோயாளி பதிவுகள் மற்றும் பகுப்பாய்வு.',
            color: 'from-primary/20 to-primary/5',
            borderColor: 'border-primary/30',
        },
        {
            id: 'patient',
            title: 'Patient',
            titleTA: 'நோயாளி',
            icon: <Users size={40} className="text-secondary-foreground" />,
            description: 'Get directions to departments and find your room.',
            descriptionTA: 'துறைகளுக்கான வழிகள் மற்றும் அறையைக் கண்டறிய.',
            color: 'from-blue-500/20 to-blue-500/5',
            borderColor: 'border-blue-500/30',
        },
        {
            id: 'others',
            title: 'Others',
            titleTA: 'மற்றவை',
            icon: <Settings size={40} className="text-orange-500" />,
            description: 'General assistance and staff directory.',
            descriptionTA: 'பொது உதவி மற்றும் ஊழியர் பட்டியல்.',
            color: 'from-orange-500/20 to-orange-500/5',
            borderColor: 'border-orange-500/30',
        },
    ];

    const handleRoleSelection = (roleId: string) => {
        navigate(`/kiosk?role=${roleId}`);
    };

    return (
        <div className="min-h-screen kiosk-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" />

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 z-10"
            >
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center shadow-2xl border border-primary/30">
                        <Building2 className="text-primary" size={36} />
                    </div>
                    <div className="text-left">
                        <h1 className="text-4xl font-display font-black text-foreground tracking-tighter leading-none">
                            SMART HOSPITAL<br />
                            <span className="text-primary">NAVIGATION SYSTEM</span>
                        </h1>
                    </div>
                </div>
                <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mb-6" />
                <h2 className="text-xl font-bold text-foreground/80 lowercase tracking-widest bg-muted/30 px-6 py-2 rounded-full inline-block border border-border/50">
                    Select Your Role to Continue
                </h2>
            </motion.div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl z-10">
                {roles.map((role, index) => (
                    <motion.button
                        key={role.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRoleSelection(role.id)}
                        className={`glass-surface p-8 rounded-[2.5rem] flex flex-col items-center text-center gap-6 border-2 ${role.borderColor} hover:shadow-2xl hover:shadow-primary/10 transition-all group relative overflow-hidden`}
                    >
                        {/* Gradient Background for card */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-30 group-hover:opacity-100 transition-opacity`} />

                        <div className="w-24 h-24 rounded-3xl bg-muted/40 flex items-center justify-center mb-2 shadow-inner group-hover:bg-muted/20 transition-colors relative z-10">
                            {role.icon}
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-foreground">{role.title}</h3>
                            <p className="text-primary font-bold">{role.titleTA}</p>
                        </div>

                        <div className="relative z-10">
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{role.description}</p>
                            <p className="text-xs text-muted-foreground/60 italic mt-1">{role.descriptionTA}</p>
                        </div>

                        <div className="mt-4 w-full relative z-10">
                            <div className="bg-primary text-primary-foreground py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
                                Enter System <ChevronRight size={18} />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-20 text-center z-10"
            >
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">
                    Powered by Advanced AI Navigation Interface v2.0
                </p>
                <div className="flex gap-4 justify-center mt-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    <div className="w-2 h-2 rounded-full bg-primary/20" />
                </div>
            </motion.footer>
        </div>
    );
};

export default RoleSelection;
