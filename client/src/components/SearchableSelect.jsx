import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder, label, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get current label
    const currentOption = options.find(opt => opt.value === value);
    const displayValue = currentOption ? currentOption.label : "";

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className={`space-y-1.5 relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-[var(--text-muted)]">
                    {label}
                </label>
            )}

            <div
                className={`w-full bg-[var(--bg-input)] border ${isOpen ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/10' : 'border-[var(--border-main)]'} rounded-xl px-4 py-2 text-sm transition-all h-[42px] flex items-center justify-between cursor-pointer group`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`truncate ${!displayValue ? 'text-[var(--text-muted)]' : 'text-[var(--text-main)] font-medium'}`}>
                    {displayValue || placeholder || "Select option..."}
                </span>
                <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 w-full mt-2 glass-card border border-[var(--border-main)] rounded-xl shadow-2xl overflow-hidden bg-[var(--bg-card)]/95 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-[var(--border-main)] bg-[var(--bg-input)]/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                            <input
                                autoFocus
                                type="text"
                                className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[var(--brand-primary)] transition-all"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar border-t border-[var(--border-main)]">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${value === opt.value
                                            ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold'
                                            : 'text-[var(--text-main)] hover:bg-[var(--bg-input)]'
                                        }`}
                                    onClick={() => handleSelect(opt.value)}
                                >
                                    <span>{opt.label}</span>
                                    {value === opt.value && <Check className="w-3.5 h-3.5" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-xs text-[var(--text-muted)] italic">
                                No matching options found
                            </div>
                        )}
                    </div>

                    {value && (
                        <div
                            className="p-2 border-t border-[var(--border-main)] bg-[var(--bg-input)]/10 text-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect("");
                            }}
                        >
                            <button className="text-[10px] font-bold text-rose-400 hover:text-rose-500 transition-colors uppercase tracking-wider">
                                Clear Selection
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
