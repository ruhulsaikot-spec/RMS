type Props = {
  items: any[];
  setItems: any;
};

export default function FoodExpenseTable({
  items,
  setItems,
}: Props) {

  const addRow = () => {

    setItems([
      ...items,
      {
        id: Date.now(),
        date: "",
        mealType: "",
        restaurant: "",
        project: "",
        participants: "",
        amount: "",
        purpose: "",
      },
    ]);

  };

  const removeRow = (id: number) => {

    const updatedRows =
      items.filter(
        (row) => row.id !== id
      );

    if (updatedRows.length === 0) {

      setItems([]);

      return;
    }
    

    setItems(updatedRows);

  };

  const updateRow = (
  id: number,
  field: string,
  value: string
) => {

  setItems(
    items.map((row) =>
      row.id === id
        ? {
            ...row,
            [field]: value,
          }
        : row
    )
  );

};

const totalAmount = items.reduce(
  (sum, item) =>
    sum + (Number(item.amount) || 0),
  0
);

  return (

    

    
    <div>

      <div className="mb-4 flex items-center justify-between">

        <h4 className="text-sm font-semibold">
          Food Expenses
        </h4>

        <button
          type="button"
          onClick={addRow}
          className="
          rounded-xl
          bg-cyan-500
          px-3
          py-2
          text-xs
          font-medium
          text-black
          "
        >
          + Add Meal
        </button>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-white/10">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Meal Type</th>
              <th className="p-2 text-left">Project</th>
              <th className="p-2 text-left">Restaurant</th>              
              <th className="p-2 text-left">Participants</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Purpose</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>

          <tbody>

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="
                  py-8
                  text-center
                  text-white/50
                  "
                >
                  No food expense added
                </td>
              </tr>
            )}

            {items.map((item, index) => (
              <tr key={item.id}>

                <td className="p-2">
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) =>
                        updateRow(
                        item.id,
                        "date",
                        e.target.value
                        )
                    }
                    className="w-full rounded-lg bg-white/5 px-2 py-2"
                    />
                </td>

                <td className="p-2">
                  <select
                    value={item.mealType}
                    onChange={(e) =>
                        updateRow(
                        item.id,
                        "mealType",
                        e.target.value
                        )
                    }
                    className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/10
                    px-3
                    py-2
                    text-xs
                    text-white
                    appearance-none
                    "
                    >
                    <option
                    value="Breakfast"
                    className="bg-[#17386E] text-white"
                    >
                    Breakfast
                    </option>

                    <option
                    value="Lunch"
                    className="bg-[#17386E] text-white"
                    >
                    Lunch
                    </option>

                    <option
                    value="Dinner"
                    className="bg-[#17386E] text-white"
                    >
                    Dinner
                    </option>

                    <option
                    value="Refreshment"
                    className="bg-[#17386E] text-white"
                    >
                    Refreshment
                    </option>
                  </select>
                </td>

                <td className="p-2">
                  <select
                    value={item.project}
                    onChange={(e) =>
                        updateRow(
                        item.id,
                        "project",
                        e.target.value
                        )
                    }
                    className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/10
                        px-3
                        py-2
                        text-xs
                        text-white
                        appearance-none
                        "
                    >
                    <option
                        value="RMS Development"
                        className="bg-[#17386E] text-white"
                        >
                        RMS Development
                        </option>

                        <option
                        value="ERP Implementation"
                        className="bg-[#17386E] text-white"
                        >
                        ERP Implementation
                        </option>

                        <option
                        value="Digital Transformation"
                        className="bg-[#17386E] text-white"
                        >
                        Digital Transformation
                        </option>
                  </select>
                </td>

                <td className="p-2">
                  <input
                    value={item.restaurant}
                    onChange={(e) =>
                        updateRow(
                        item.id,
                        "restaurant",
                        e.target.value
                        )
                    }
                    className="w-full rounded-lg bg-white/5 px-2 py-2"
                    />
                </td>

                

                <td className="p-2">
                  <input
                    type="number"
                    value={item.participants}
                    onChange={(e) =>
                        updateRow(
                        item.id,
                        "participants",
                        e.target.value
                        )
                    }
                    className="w-full rounded-lg bg-white/5 px-2 py-2"
                    />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                        updateRow(
                        item.id,
                        "amount",
                        e.target.value
                        )
                    }
                    className="w-full rounded-lg bg-white/5 px-2 py-2"
                    />
                </td>

                <td className="p-2">
                  <input
                    value={item.purpose}
                    onChange={(e) =>
                        updateRow(
                        item.id,
                        "purpose",
                        e.target.value
                        )
                    }
                    className="w-full rounded-lg bg-white/5 px-2 py-2"
                    />
                </td>

                <td className="p-2">

                  <button
                    type="button"
                    onClick={() => removeRow(item.id)}
                    className="
                    rounded-lg
                    bg-red-500/10
                    px-3
                    py-2
                    text-xs
                    text-red-300
                    "
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    <div
  className="
  mt-4
  flex
  justify-end
  "
>
  <div
    className="
    rounded-xl
    border
    border-cyan-500/20
    bg-cyan-500/10
    px-4
    py-3
    "
  >
    <p className="text-xs text-white/60">
      Total Food Expense
    </p>

    <p className="text-lg font-semibold text-cyan-300">
      ৳ {totalAmount.toLocaleString()}
    </p>
  </div>
</div>

</div>

  );
}