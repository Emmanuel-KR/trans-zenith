import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useEffect, useState } from "react";
import "./input.css";

interface SearchInputProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchInput({
  id,
  placeholder = "Search...",
  value,
  onChange,
  onClear,
}: SearchInputProps) {
  const [local, setLocal] = useState(value);

  // Keep local in sync when external value changes (e.g. when cleared from parent)
  useEffect(() => setLocal(value), [value]);

  const handleClear = () => {
    setLocal("");
    onClear();
  };

  return (
    <div className="search-input-container">
      <div className="search-input">
        <div
          className="search-input-icon"
          onClick={() => onChange(local)}
          role="button"
          aria-label="Search"
          style={{ cursor: "pointer" }}
        >
          <SearchRoundedIcon />
        </div>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={local}
          autoComplete="off"
          onChange={(e) => setLocal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onChange(local);
          }}
        />
        <div className="search-input-icon-close" onClick={handleClear}>
          <CloseRoundedIcon style={{ visibility: local ? "visible" : "hidden" }} />
        </div>
      </div>
    </div>
  );
}
