export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  span2,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  span2?: boolean;
}) {
  return (
    <label className={`text-sm ${span2 ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  span2,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  span2?: boolean;
}) {
  return (
    <label className={`text-sm ${span2 ? "sm:col-span-2" : ""}`}>
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={2}
        className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
      />
    </label>
  );
}

export function FormActions({ deleteAction }: { deleteAction?: (formData: FormData) => void }) {
  return (
    <div className="flex gap-2">
      <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">
        Save
      </button>
      {deleteAction && (
        <button
          type="submit"
          formAction={deleteAction}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600"
        >
          Delete
        </button>
      )}
    </div>
  );
}
