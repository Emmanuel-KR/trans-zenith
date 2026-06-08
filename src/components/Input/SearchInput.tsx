import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
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
  return (
    <div className="search-input-container">
      <div className="search-input">
        <div className="search-input-icon">
          <SearchRoundedIcon />
        </div>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="search-input-icon-close" onClick={onClear}>
          <CloseRoundedIcon style={{ visibility: value ? "visible" : "hidden" }} />
        </div>
      </div>
    </div>
  );
}
