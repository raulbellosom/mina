import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
  disabled = false,
  required = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [flipUp, setFlipUp] = useState(false);

  const selectedOption = options.find((o) => o.value === value) || null;

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const checkFlip = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setFlipUp(spaceBelow < 220 && rect.top > 220);
  }, []);

  useEffect(() => {
    if (!open) return;
    checkFlip();
    const onScroll = () => checkFlip();
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open, checkFlip]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && listRef.current && highlightIndex >= 0) {
      const item = listRef.current.children[highlightIndex];
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, open]);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setSearch("");
    setHighlightIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
    setHighlightIndex(-1);
    if (open) inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    setHighlightIndex(-1);
    if (!open) setOpen(true);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
      setHighlightIndex(-1);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (highlightIndex >= 0 && highlightIndex < filtered.length) {
        handleSelect(filtered[highlightIndex]);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return;
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      return;
    }

    if (e.key === "Tab") {
      setOpen(false);
      setSearch("");
      setHighlightIndex(-1);
    }
  };

  const handleContainerClick = () => {
    if (disabled) return;
    if (!open) {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {required && !value && (
        <input
          tabIndex={-1}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value=""
          onChange={() => {}}
        />
      )}

      <div
        onClick={handleContainerClick}
        className={`flex items-center w-full rounded-md border bg-white dark:bg-slate-900 text-sm transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed border-slate-300 dark:border-slate-700" : "cursor-pointer border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"}
          ${open ? "ring-2 ring-primary-500 border-primary-500 dark:border-primary-500" : ""}
        `}
      >
        {open ? (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={selectedOption ? selectedOption.label : placeholder}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none min-w-0"
            autoComplete="off"
          />
        ) : (
          <span
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
            className={`flex-1 px-3 py-2 truncate outline-none ${
              selectedOption
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        )}

        <div className="flex items-center gap-0.5 pr-2 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {open && (
        <ul
          ref={listRef}
          className={`absolute z-50 left-0 right-0 max-h-52 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1
            ${flipUp ? "bottom-full mb-1" : "top-full mt-1"}
          `}
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500 text-center">
              Sin resultados
            </li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
                onMouseEnter={() => setHighlightIndex(i)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors
                  ${opt.value === value ? "font-medium text-primary-600 dark:text-primary-400" : "text-slate-700 dark:text-slate-300"}
                  ${i === highlightIndex ? "bg-primary-50 dark:bg-primary-900/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"}
                `}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
