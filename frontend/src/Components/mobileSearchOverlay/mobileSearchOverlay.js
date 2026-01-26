import React, { useEffect } from "react";
import SearchBar from "../searchBar/searchBar";
import { IoClose } from "react-icons/io5";
import "./mobileSearchOverlay.css";

const MobileSearchOverlay = ({ open, onClose }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="mobile-search-overlay">
      <div className="mobile-search-header">
        <SearchBar mobile autoFocus />
        <button className="close-btn" onClick={onClose}>
          <IoClose/>
        </button>
      </div>
    </div>
  );
};

export default MobileSearchOverlay;
