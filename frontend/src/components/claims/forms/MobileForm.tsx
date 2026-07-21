export default function MobileForm() {
  return (
    <div className="grid gap-4 md:grid-cols-2">

      <div>
        <label className="mb-2 block text-xs text-white/50">
          Billing Month *
        </label>
        <input
          type="month"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs text-white/50">
          Mobile Number *
        </label>
        <input
          placeholder="01XXXXXXXXX"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs text-white/50">
          Expense Type *
        </label>
        <select
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
        >
          <option>Mobile</option>
          <option>Internet</option>
          <option>Both</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs text-white/50">
          Amount *
        </label>
        <input
          type="number"
          placeholder="0.00"
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