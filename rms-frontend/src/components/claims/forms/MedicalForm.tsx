export default function MedicalForm() {
  return (
    <div className="grid gap-4 md:grid-cols-2">

      <div>
        <label className="mb-2 block text-xs text-white/50">
          Treatment Date *
        </label>
        <input
          type="date"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs text-white/50">
          Patient Name *
        </label>
        <input
          placeholder="Patient name"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs text-white/50">
          Relationship *
        </label>
        <select
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        >
          <option>Self</option>
          <option>Spouse</option>
          <option>Child</option>
          <option>Parent</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs text-white/50">
          Hospital Name *
        </label>
        <input
          placeholder="Hospital name"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs text-white/50">
          Claim Amount *
        </label>
        <input
          type="number"
          placeholder="0.00"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs text-white/50">
          Doctor Reference
        </label>
        <input
          placeholder="Doctor name"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-xs text-white/50">
          Remarks
        </label>
        <textarea
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        />
      </div>

    </div>
  );
}