import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { expenseTypeService } from "@/services/expense-type.service";
import { projectService } from "@/services/project.service";

type ClaimDetailsStepProps = {
  claimType: string;
  formData: any;
  setFormData: any;
  onValidate?: (isValid: boolean) => void;
};

export function validateClaimDetails(formData: any): boolean {
  if (!formData.claimDate) {
    toast.error("Claim Application Date is required.");
    return false;
  }
  for (let i = 0; i < formData.expenseItems.length; i++) {
    const item = formData.expenseItems[i];
    const row = i + 1;
    if (!item.expenseDate) { toast.error(`Row ${row}: Expense Date is required.`); return false; }
    if (!item.claimType) { toast.error(`Row ${row}: Claim Type is required.`); return false; }
    if (!item.purpose) { toast.error(`Row ${row}: Purpose is required.`); return false; }
    if (!item.amount || Number(item.amount) <= 0) { toast.error(`Row ${row}: Amount is required.`); return false; }
  }
  return true;
}

export default function ClaimDetailsStep({ formData, setFormData }: ClaimDetailsStepProps) {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadMasterData();
    if (!formData.claimDate) {
      setFormData({ ...formData, claimDate: new Date().toISOString().split("T")[0] });
    }
  }, []);

  const loadMasterData = async () => {
    try {
      const [expenseTypeData, projectData] = await Promise.all([
        expenseTypeService.getExpenseTypes(),
        projectService.getProjects(),
      ]);
      setExpenseTypes(expenseTypeData);
      setProjects(projectData);
    } catch (error) {
      console.error(error);
    }
  };

  const addRow = () => {
    setFormData({
      ...formData,
      expenseItems: [
        ...formData.expenseItems,
        { id: Date.now(), expenseDate: "", claimType: "", purpose: "", mode: "", project: "", from: "", to: "", amount: "" },
      ],
    });
  };

  const updateRow = (id: number, field: string, value: string) => {
    setFormData({
      ...formData,
      expenseItems: formData.expenseItems.map((row: any) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    });
  };

  const removeRow = (id: number) => {
    setFormData({
      ...formData,
      expenseItems: formData.expenseItems.filter((row: any) => row.id !== id),
    });
  };

  const totalAmount = formData.expenseItems.reduce(
    (sum: number, item: any) => sum + Number(item.amount || 0), 0
  );

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-colors";
  const selectClass = "w-full rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/15">
            <CalendarDays size={16} className="text-blue-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Claim Information</h3>
            <p className="text-xs text-white/40">Fill in claim details and expense items</p>
          </div>
        </div>
      </div>

      {/* Claim Date + Remarks */}
      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/60">
            Claim Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={formData.claimDate}
            readOnly
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 cursor-not-allowed opacity-70"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/60">Remarks</label>
          <input
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="Optional remarks..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Expense Table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white">Expense Details</h4>
            <p className="text-[10px] text-white/40">{formData.expenseItems.length} item(s)</p>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/25 transition-colors"
          >
            <Plus size={12} /> Add Expense
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">#</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">Expense Date</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">Type</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">Purpose</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">Mode</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">Project</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">From</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">To</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">Amount (৳)</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody>
              {formData.expenseItems.map((item: any, idx: number) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/50">{idx + 1}</span>
                  </td>
                  <td className="px-2 py-2 min-w-[120px]">
                    <input type="date" value={item.expenseDate}
                      onChange={(e) => updateRow(item.id, "expenseDate", e.target.value)}
                      className={inputClass} />
                  </td>
                  <td className="px-2 py-2 min-w-[130px]">
                    <select value={item.claimType}
                      onChange={(e) => updateRow(item.id, "claimType", e.target.value)}
                      className={selectClass}>
                      <option value="" className="bg-[#0d1f40]">Select Type</option>
                      {expenseTypes.map((et: any) => (
                        <option key={et.id} value={et.id} className="bg-[#0d1f40]">{et.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 min-w-[120px]">
                    <input value={item.purpose} placeholder="Purpose"
                      onChange={(e) => updateRow(item.id, "purpose", e.target.value)}
                      className={inputClass} />
                  </td>
                  <td className="px-2 py-2 min-w-[100px]">
                    <input value={item.mode} placeholder="Mode"
                      onChange={(e) => updateRow(item.id, "mode", e.target.value)}
                      className={inputClass} />
                  </td>
                  <td className="px-2 py-2 min-w-[130px]">
                    <select value={item.project}
                      onChange={(e) => updateRow(item.id, "project", e.target.value)}
                      className={selectClass}>
                      <option value="" className="bg-[#0d1f40]">Select Project</option>
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id} className="bg-[#0d1f40]">{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 min-w-[90px]">
                    <input value={item.from} placeholder="From"
                      onChange={(e) => updateRow(item.id, "from", e.target.value)}
                      className={inputClass} />
                  </td>
                  <td className="px-2 py-2 min-w-[90px]">
                    <input value={item.to} placeholder="To"
                      onChange={(e) => updateRow(item.id, "to", e.target.value)}
                      className={inputClass} />
                  </td>
                  <td className="px-2 py-2 min-w-[100px]">
                    <input type="number" value={item.amount} placeholder="0"
                      onChange={(e) => updateRow(item.id, "amount", e.target.value)}
                      className={inputClass} />
                  </td>
                  <td className="px-2 py-2">
                    {formData.expenseItems.length > 1 && (
                      <button type="button" onClick={() => removeRow(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mt-4 flex justify-end">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-right">
            <p className="text-[10px] text-white/50 uppercase tracking-wide">Total Amount</p>
            <p className="mt-0.5 text-xl font-bold text-cyan-300">৳ {totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
