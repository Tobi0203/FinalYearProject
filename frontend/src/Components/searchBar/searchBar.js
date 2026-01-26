import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosIns from "../../utils/axiosInstance";
import "./searchBar.css";

const SearchBar = ({ mobile = false, autoFocus = false }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShow(false);
      return;
    }

    const delay = setTimeout(async () => {
      const res = await axiosIns.get(`/users/searchUsers?q=${query}`);
      if (res.data.success) {
        setResults(res.data.users);
        setShow(true);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className={`search-wrapper ${mobile ? "mobile" : ""}`} ref={ref}>
      <input
        autoFocus={autoFocus}
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setShow(true)}
      />

      {show && (
        <div className="search-dropdown">
          {results.length ? (
            results.map((u) => (
              <div
                key={u._id}
                className="search-item"
                onClick={() => {
                  navigate(`/profile/${u._id}`);
                  setQuery("");
                  setShow(false);
                }}
              >
                <img
                  src={u.profilePicture || "/assets/images/avatar.webp"}
                  alt=""
                />
                <span>{u.username}</span>
              </div>
            ))
          ) : (
            <p className="no-search">No users found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
