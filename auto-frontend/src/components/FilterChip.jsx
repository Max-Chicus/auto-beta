function FilterChip({ label, onRemove }) {
  return (
    <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm flex items-center gap-2">
      {label}
      <button onClick={onRemove} className="font-bold">✕</button>
    </span>
  );
}

export default FilterChip;
