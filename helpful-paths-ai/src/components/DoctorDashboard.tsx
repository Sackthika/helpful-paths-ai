import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Activity, Scissors, FlaskConical, Beaker, User, Building, ArrowRight } from 'lucide-react';
import { findDepartment, findPatient, getAllDepartments, Patient, Department } from '@/data/hospitalData';

interface DoctorDashboardProps {
    onNavigate: (dept: Department) => void;
    lang: 'en' | 'ta';
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onNavigate, lang }) => {
    const [search, setSearch] = useState('');
    const [patient, setPatient] = useState<Patient | null>(null);
    const [error, setError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [view, setView] = useState<'search' | 'analytics'>('search');
    const [depts, setDepts] = useState<Department[]>([]);

    useEffect(() => {
        const fetchDepts = async () => {
            const all = await getAllDepartments();
            setDepts(all);
        };
        fetchDepts();
    }, []);

    const quickDepts = [
        { id: 'icu', label: 'ICU', icon: <Activity className="text-red-500" />, query: 'ICU', dist: '120m', eta: '2 min' },
        { id: 'ot', label: 'OT', icon: <Scissors className="text-orange-500" />, query: 'Surgery', dist: '250m', eta: '4 min' },
        { id: 'ward3', label: 'Ward 3', icon: <Building className="text-blue-500" />, query: 'Ward 3', dist: '80m', eta: '1 min' },
        { id: 'lab', label: 'Lab', icon: <FlaskConical className="text-purple-500" />, query: 'Laboratory', dist: '180m', eta: '3 min' },
    ];

    const handleQuickAccess = async (query: string) => {
        const dept = await findDepartment(query, lang);
        if (dept) {
            onNavigate(dept);
        }
    };

    const handlePatientSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!search.trim()) return;

        setIsSearching(true);
        setError('');
        setPatient(null);

        const result = await findPatient(search);
        setIsSearching(false);

        if (result) {
            setPatient(result);
            if (result.dept) {
                onNavigate(result.dept);
            }
        } else {
            setError(lang === 'ta' ? 'நோயாளி கண்டுபிடிக்கப்படவில்லை' : 'Patient not found');
        }
    };

    // Mock vitals generator
    const getVitals = (id: string) => {
        const seed = id.charCodeAt(id.length - 1);
        return {
            bpm: 70 + (seed % 30),
            bp: `${110 + (seed % 20)}/${70 + (seed % 15)}`,
            temp: (36.5 + (seed % 10) / 10).toFixed(1),
            status: seed % 3 === 0 ? 'Critical' : seed % 3 === 1 ? 'Stable' : 'Observation',
            statusTA: seed % 3 === 0 ? 'அபாயகரமானது' : seed % 3 === 1 ? 'சீராக உள்ளது' : 'கண்காணிப்பு'
        };
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Tab Selector */}
            <div className="flex gap-2 p-1 bg-muted/30 rounded-xl self-start">
                <button
                    onClick={() => setView('search')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'search' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                    {lang === 'ta' ? 'தேடல்' : 'Patient Search'}
                </button>
                <button
                    onClick={() => setView('analytics')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'analytics' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                    {lang === 'ta' ? 'பகுப்பாய்வு' : 'Analytics'}
                </button>
            </div>

            {view === 'analytics' ? (
                <section className="glass-surface rounded-2xl p-6 border border-border/50 shadow-xl">
                    <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={18} />
                        {lang === 'ta' ? 'துறை ஆக்கிரமிப்பு' : 'Department Occupancy & Load'}
                    </h3>
                    <div className="space-y-4">
                        {depts.slice(0, 6).sort((a, b) => (b.occupancy || 0) - (a.occupancy || 0)).map(d => (
                            <div key={d.id} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                    <span>{lang === 'ta' ? d.nameTA : d.name}</span>
                                    <span className={(d.occupancy || 0) > 80 ? 'text-red-500' : 'text-primary'}>{d.occupancy}% Busy</span>
                                </div>
                                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${d.occupancy}%` }}
                                        className={`h-full ${(d.occupancy || 0) > 80 ? 'bg-red-500' : (d.occupancy || 0) > 50 ? 'bg-orange-500' : 'bg-primary'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <>
                    {/* Quick Access Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                                {lang === 'ta' ? 'விரைவு அணுகல்' : 'Ward Quick Access'}
                            </h3>
                            <span className="text-[10px] font-bold py-1 px-2 rounded-full bg-primary/10 text-primary">INSTANT NAVIGATION</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {quickDepts.map((item) => (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleQuickAccess(item.query)}
                                    className="glass-surface p-4 rounded-2xl flex flex-col items-center gap-2 border border-border/50 hover:border-primary/40 transition-all shadow-lg group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={14} className="text-primary" />
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center text-xl mb-1">
                                        {item.icon}
                                    </div>
                                    <span className="font-bold text-sm">{item.label}</span>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Distance: {item.dist}</span>
                                        <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">ETA: {item.eta}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </section>

                    {/* Patient Finder Section */}
                    <section className="glass-surface rounded-2xl p-6 border border-border/50 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
                        <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                            <User size={18} />
                            {lang === 'ta' ? 'நோயாளி தேடல்' : 'Patient Room Finder'}
                        </h3>

                        <form onSubmit={handlePatientSearch} className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={lang === 'ta' ? 'நோயாளி ஐடி அல்லது பெயர்' : 'Enter Patient ID or Name'}
                                    className="w-full bg-secondary/50 text-foreground rounded-xl pl-11 pr-4 py-4 outline-none focus:ring-2 focus:ring-primary/30 border border-border transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="bg-primary text-primary-foreground px-6 py-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (lang === 'ta' ? 'தேடு' : 'Search')}
                            </button>
                        </form>

                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm mt-3 px-2 font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                {error}
                            </motion.div>
                        )}

                        {patient && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-5 rounded-2xl bg-muted/20 border border-border/50 flex flex-col gap-6 relative"
                            >
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getVitals(patient.id).status === 'Critical'
                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                        }`}>
                                        {lang === 'ta' ? getVitals(patient.id).statusTA : getVitals(patient.id).status}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Patient Profile</p>
                                        <h4 className="text-2xl font-black text-foreground">{patient.name}</h4>
                                        <p className="text-sm text-primary font-bold">UID: {patient.id}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-background/40 p-3 rounded-xl border border-border/50 min-w-[80px]">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Room</p>
                                            <p className="text-lg font-black text-primary">{patient.room}</p>
                                        </div>
                                        <div className="bg-background/40 p-3 rounded-xl border border-border/50 min-w-[80px]">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Floor</p>
                                            <p className="text-lg font-black text-foreground">{patient.floor}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Vitals Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-background/20 p-3 rounded-xl border border-border/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Activity size={14} className="text-red-500" />
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Heart Rate</span>
                                        </div>
                                        <p className="text-xl font-bold">{getVitals(patient.id).bpm} <span className="text-[10px] font-medium opacity-50">BPM</span></p>
                                    </div>
                                    <div className="bg-background/20 p-3 rounded-xl border border-border/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Beaker size={14} className="text-blue-500" />
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">BP Level</span>
                                        </div>
                                        <p className="text-xl font-bold">{getVitals(patient.id).bp} <span className="text-[10px] font-medium opacity-50">mmHg</span></p>
                                    </div>
                                    <div className="bg-background/20 p-3 rounded-xl border border-border/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Activity size={14} className="text-orange-500 rotate-90" />
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Body Temp</span>
                                        </div>
                                        <p className="text-xl font-bold">{getVitals(patient.id).temp}°<span className="text-[10px] font-medium opacity-50">C</span></p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs font-bold bg-primary/10 text-primary p-3 rounded-xl border border-primary/20">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <span>{lang === 'ta' ? 'வரைபடத்தில் பாதை காட்டப்பட்டுள்ளது' : 'Optimal path calculated and updated on map'}</span>
                                </div>
                            </motion.div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default DoctorDashboard;
