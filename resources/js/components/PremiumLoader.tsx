import React from 'react';
import { motion } from 'framer-motion';
import { Folder, Search, FileText } from 'lucide-react';

export const PremiumLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full relative overflow-hidden">
            {/* Анимированные папки на фоне */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 200, opacity: [0, 1, 0] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 1,
                            ease: "linear"
                        }}
                        className="absolute"
                    >
                        <Folder size={80 + i * 20} />
                    </motion.div>
                ))}
            </div>

            {/* Центральный элемент: "Человечек-сканер" */}
            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-32 h-32 bg-blue-600/10 rounded-[40px] border border-blue-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/10 relative"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Search size={40} className="text-blue-500" />
                    </motion.div>

                    {/* Летающий листик (то самое "что-то ищет") */}
                    <motion.div
                        animate={{ 
                            x: [-40, 40],
                            y: [-20, 20],
                            opacity: [0, 1, 0],
                            rotate: [0, 360]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="absolute text-blue-400"
                    >
                        <FileText size={20} />
                    </motion.div>
                </motion.div>

                <div className="space-y-3">
                    <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white">Ищем в архивах</h3>
                    <div className="flex gap-1 justify-center">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};