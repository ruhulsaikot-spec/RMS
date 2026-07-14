import { useEffect, useState } from "react";
import { toast } from "sonner";

import { expenseTypeService }
from "@/services/expense-type.service";

import { projectService }
from "@/services/project.service";


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
    if (!item.expenseDate) {
      toast.error(`Row ${row}: Expense Date is required.`);
      return false;
    }
    if (!item.claimType) {
      toast.error(`Row ${row}: Claim Type is required.`);
      return false;
    }
    if (!item.purpose) {
      toast.error(`Row ${row}: Purpose is required.`);
      return false;
    }
    if (!item.amount || Number(item.amount) <= 0) {
      toast.error(`Row ${row}: Amount is required.`);
      return false;
    }
  }
  return true;
}

export default function ClaimDetailsStep({
  formData,
  setFormData,
}: ClaimDetailsStepProps) 

{

  const [expenseTypes, setExpenseTypes] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

    useEffect(() => {

      loadMasterData();

      if (!formData.claimDate) {
        setFormData({
          ...formData,
          claimDate: new Date().toISOString().split("T")[0],
        });
      }

    }, []);

    const loadMasterData = async () => {

      try {

        const expenseTypeData =
          await expenseTypeService.getExpenseTypes();

          console.log(
            "EXPENSE TYPES =>",
            expenseTypeData
          );
        
          const projectData =
          await projectService.getProjects();

        setExpenseTypes(
          expenseTypeData
        );

        setProjects(
          projectData
        );

      } catch (error) {

        console.error(error);

      }

    };

  const addRow = () => {
    setFormData({
      ...formData,
      expenseItems: [
        ...formData.expenseItems,
        {
          id: Date.now(),
          expenseDate: "",
          claimType: "",
          purpose: "",
          mode: "",
          project: "",
          from: "",
          to: "",
          amount: "",
        },
      ],
    });
  };

  const updateRow = (
    id: number,
    field: string,
    value: string
  ) => {
    setFormData({
      ...formData,
      expenseItems: formData.expenseItems.map(
        (row: any) =>
          row.id === id
            ? {
                ...row,
                [field]: value,
              }
            : row
      ),
    });
  };

  const removeRow = (id: number) => {
    setFormData({
      ...formData,
      expenseItems: formData.expenseItems.filter(
        (row: any) => row.id !== id
      ),
    });
  };

  const totalAmount =
    formData.expenseItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.amount || 0),
      0
    );

  return (
    <div
      className="
      rounded-3xl
      border
      border-white/10
      bg-white/[0.04]
      p-5
      backdrop-blur-xl
      "
    >

      <h3 className="text-base font-semibold">
        Claim Information
      </h3>

      <div className="mt-5 grid gap-4 md:grid-cols-2">

        <div>
          <label className="text-xs text-white/60">
            Claim Application Date
          </label>

          <input
            type="date"
            value={formData.claimDate}
            readOnly
            className="
            mt-1
            w-full
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-3
            py-2
            cursor-not-allowed
            opacity-70
            "
          />
        </div>

        <div>
          <label className="text-xs text-white/60">
            Remarks
          </label>

          <input
            value={formData.remarks}
            onChange={(e) =>
              setFormData({
                ...formData,
                remarks: e.target.value,
              })
            }
            className="
            mt-1
            w-full
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-3
            py-2
            text-sm
            text-white
            "
          />
        </div>

      </div>

      <div className="mt-8">

        <div className="mb-4 flex items-center justify-between">

          <h4 className="text-sm font-semibold">
            Expense Details
          </h4>

          <button
            type="button"
            onClick={addRow}
            className="
            rounded-xl
            bg-cyan-500
            px-4
            py-2
            text-xs
            font-medium
            text-black
            "
          >
            + Add Expense
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-white/10">

                <th className="p-2 text-left">
                  Expense Date
                </th>

                <th className="p-2 text-left">
                  Claim Type
                </th>

                <th className="p-2 text-left">
                  Purpose
                </th>

                <th className="p-2 text-left">
                  Mode
                </th>

                <th className="p-2 text-left">
                  Project
                </th>

                <th className="p-2 text-left">
                  From
                </th>

                <th className="p-2 text-left">
                  To
                </th>

                <th className="p-2 text-left">
                  Amount
                </th>

                <th className="p-2 text-left">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {formData.expenseItems.map(
                (item: any) => (
                  <tr key={item.id}>

                    <td className="p-2">
                      <input
                        type="date"
                        value={item.expenseDate}
                        onChange={(e) =>
                          updateRow(
                            item.id,
                            "expenseDate",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg bg-white/5 px-2 py-2"
                      />
                    </td>

                    <td className="p-2">
                      <select
                        value={item.claimType}
                        onChange={(e) =>
                          updateRow(
                            item.id,
                            "claimType",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg bg-white/5 px-2 py-2"
                      >
                        <option value="" className="bg-[#17386E] text-white">
                          Select Expense Type
                        </option>

                        {expenseTypes.map(
                          (expenseType: any) => (
                            <option
                              key={expenseType.id}
                              value={expenseType.id}
                              className="bg-[#17386E] text-white"
                            >
                              {expenseType.name}
                            </option>
                          )
                        )}
                      </select>
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
                      <input
                        value={item.mode}
                        onChange={(e) =>
                          updateRow(
                            item.id,
                            "mode",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg bg-white/5 px-2 py-2"
                      />
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
                        className="w-full rounded-lg bg-white/5 px-2 py-2"
                      >
                        <option value="" className="bg-[#17386E] text-white">
                          Select Project
                        </option>

                        {projects.map(
                          (project: any) => (
                            <option
                              key={project.id}
                              value={project.id}
                              className="bg-[#17386E] text-white"
                            >
                              {project.code} - {project.name}
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td className="p-2">
                      <input
                        value={item.from}
                        onChange={(e) =>
                          updateRow(
                            item.id,
                            "from",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg bg-white/5 px-2 py-2"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        value={item.to}
                        onChange={(e) =>
                          updateRow(
                            item.id,
                            "to",
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

                      <button
                        type="button"
                        onClick={() =>
                          removeRow(item.id)
                        }
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
                )
              )}

            </tbody>

          </table>

        </div>

        <div className="mt-5 flex justify-end">

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
              Total Claim Amount
            </p>

            <p className="text-lg font-semibold text-cyan-300">
              ৳ {totalAmount.toLocaleString()}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}