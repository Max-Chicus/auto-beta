import { useState } from "react";

function FilterCollapse({ title, children }) {
  const [open, setOpen] = useState(false); // ❗ INCHIS initial

  return (
    <div className="border rounded-lg mb-4 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 font-semibold bg-gray-100"
      >
        {title}
        <span
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

export default FilterCollapse;
