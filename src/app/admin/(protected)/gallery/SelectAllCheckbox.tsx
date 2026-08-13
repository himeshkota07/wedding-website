"use client";

export function SelectAllCheckbox() {
  return (
    <label className="flex items-center gap-1 text-xs text-zinc-600">
      <input
        type="checkbox"
        onChange={(e) => {
          const form = e.currentTarget.closest("form");
          form?.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((cb) => {
            cb.checked = e.currentTarget.checked;
          });
        }}
      />
      Select all
    </label>
  );
}
