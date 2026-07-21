import TransportExpenseTable from "./TransportExpenseTable";

type TransportFormProps = {
  formData: any;
  setFormData: any;
};

export default function TransportForm({
  formData,
  setFormData,
}: TransportFormProps) {
    const totalAmount =
        formData.transportItems.reduce(
            (sum: number, item: any) =>
            sum + Number(item.amount || 0),
            0
        );
  return (
    <div className="space-y-5">

      {/* Claim Header */}

      

      {/* Expense Table */}

      <div
        className="
        rounded-2xl
        border
        border-white/10
        bg-white/5
        p-4
        "
      >
        <TransportExpenseTable
          items={formData.transportItems}
          setItems={(items: any) =>
            setFormData({
              ...formData,
              transportItems: items,
            })
          }
        />
      </div>

      {/* Total */}

      <div
        className="
        flex
        justify-end
        rounded-2xl
        border
        border-cyan-500/20
        bg-cyan-500/5
        px-5
        py-4
        "
      >
        <div className="text-right">

          <p className="text-xs text-white/50">
            Total Claim Amount
          </p>

          <p className="mt-1 text-xl font-semibold text-cyan-300">
            ৳ {totalAmount.toLocaleString()}
            </p>

        </div>
      </div>

    </div>
  );
}