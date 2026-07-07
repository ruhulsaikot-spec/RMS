"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

import { reimbursementService } from "@/services/reimbursement.service";

export default function ApprovalsPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [approvals, setApprovals] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      const data =
        await reimbursementService.getPendingApprovals();

      setApprovals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData =
    approvals.filter((item: any) =>
      item.application_no
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">

      <div className="relative z-10 flex min-h-screen w-full">

        <Sidebar active="approvals" />

        <section className="flex-1">

          <Topbar
            title="Approvals"
            subtitle="Pending approval requests"
          />

          <div className="p-4">

            <div className="mb-4">

              <input
                type="text"
                placeholder="Search Application No"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="
                w-[300px]
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-4
                py-2
                text-sm
                outline-none
                "
              />

            </div>

            <div
              className="
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              "
            >

              <table className="w-full">

                <thead>

                  <tr className="border-b border-white/10">

                    <th className="p-4 text-left">
                      Application No
                    </th>

                    <th className="p-4 text-left">
                      Employee ID
                    </th>

                    <th className="p-4 text-left">
                      Amount
                    </th>

                    <th className="p-4 text-left">
                      Status
                    </th>

                    <th className="p-4 text-center">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading && (

                    <tr>

                      <td
                        colSpan={5}
                        className="p-8 text-center"
                      >
                        Loading...
                      </td>

                    </tr>

                  )}

                  {!loading &&
                    filteredData.length === 0 && (

                    <tr>

                      <td
                        colSpan={5}
                        className="p-8 text-center"
                      >
                        No pending approval found
                      </td>

                    </tr>

                  )}

                  {filteredData.map(
                    (item: any) => (

                      <tr
                        key={
                          item.application_id
                        }
                        className="
                        border-b
                        border-white/5
                        hover:bg-white/5
                        "
                      >

                        <td className="p-4">
                          {
                            item.application_no
                          }
                        </td>

                        <td className="p-4">
                          {
                            item.employee_id
                          }
                        </td>

                        <td className="p-4">
                          ৳
                          {
                            item.requested_amount
                          }
                        </td>

                        <td className="p-4">
                          {item.status}
                        </td>

                        <td className="p-4 text-center">

                          <button
                            onClick={() =>
                              router.push(
                              `/approvals/${item.application_id}`
                              )
                            }
                            className="
                            rounded-xl
                            bg-cyan-500/20
                            px-4
                            py-2
                            text-sm
                            text-cyan-300
                            "
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}