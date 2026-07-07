"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";


import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { reimbursementService } from "@/services/reimbursement.service";

export default function ClaimDetailsPage() {

  const params = useParams();

  const [claim, setClaim] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [selectedAction, setSelectedAction] =
    useState("");

    const [remarks, setRemarks] =
    useState("");

    const [processing, setProcessing] =
    useState(false);

  useEffect(() => {
    loadClaim();
    }, []);

    const loadClaim = async () => {
    try {

        const data =
        await reimbursementService.getApplicationById(
            params.id as string
        );

        console.log(
        "CLAIM DETAIL RESPONSE",
        data
        );

        setClaim(data);

        console.log(
        "ATTACHMENTS =>",
        data.attachments
        );

        console.log(
        "ATTACHMENT LENGTH =>",
        data.attachments?.length
        );

    } catch (error) {

        console.error(error);

    } finally {

        setLoading(false);

    }
    };

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center text-white">
            Loading Claim Details...
            </div>
        );
        }

        if (!claim) {

        return (
            <div className="flex min-h-screen items-center justify-center text-white">
            Claim Not Found
            </div>
        );
        }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%),radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.12),transparent_50%)]" />

      {/* Atmosphere */}
      <div
        className="
        absolute
        left-1/2
        top-1/2
        h-[1800px]
        w-[1800px]
        -translate-x-1/2
        -translate-y-1/2
        rounded-full
        bg-cyan-500/10
        blur-[260px]
        "
      />

      <div className="relative z-10 flex min-h-screen w-full">

        <Sidebar active="approvals" />

        <section className="flex-1 flex flex-col">

          <Topbar
            title="Claim Details"
            subtitle="View reimbursement application details"
          />

          {/* Body */}
          <div
            className="
            flex-1
            p-5
            bg-[linear-gradient(180deg,#081B44_0%,#0A2558_50%,#10306D_100%)]
            "
          >
            {/* Hero Card */}
            <div
              className="
              rounded-3xl
              border
              border-white/20
              bg-[#102E67]/80
              backdrop-blur-2xl
              shadow-2xl
              shadow-black/30
              p-3
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <button
                    className="
                    mb-2
                    text-sm
                    text-cyan-300
                    hover:text-cyan-200
                    "
                    >
                    Back to Claims
                    </button>

                    <h1
                    className="
                    text-2xl
                    font-bold
                    text-white
                    "
                    >
                    {claim.application_no}
                    </h1>

                   
                  <div
                    className="
                    mt-3
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-purple-400/30
                    bg-purple-500/15
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-purple-300
                    "
                  >
                    <span className="h-2 w-2 rounded-full bg-purple-300" />
                    {claim.status}
                  </div>

                </div>

                <div className="grid grid-cols-3 gap-3">

                    <div
                        className="
                        rounded-3xl
                        border
                        border-cyan-400/20
                        bg-cyan-500/10
                        px-4
                        py-3
                        text-center
                        "
                    >
                        <p className="text-xs text-white/60">
                        Requested Amount
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-cyan-300">
                        ৳ {Number(
                            claim.requested_amount || 0
                        ).toLocaleString()}
                        </h2>
                    </div>

                    <div
                        className="
                        rounded-3xl
                        border
                        border-green-400/20
                        bg-green-500/10
                        px-4
                        py-3
                        text-center
                        "
                    >
                        <p className="text-xs text-white/60">
                        Verified Amount
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-green-300">
                        ৳ {Number(
                            claim.verified_amount || 0
                        ).toLocaleString()}
                        </h2>
                    </div>

                    <div
                        className="
                        rounded-3xl
                        border
                        border-yellow-400/20
                        bg-yellow-500/10
                        px-4
                        py-3
                        text-center
                        "
                    >
                        <p className="text-xs text-white/60">
                            Paid Amount
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-yellow-300">
                            ৳ {Number(
                                claim.paid_amount ||
                                claim.verified_amount ||
                                0
                            ).toLocaleString()}
                        </h2>
                    </div>

                    </div>

              </div>

            </div>            

          {/* Main Content Grid */}

        <div className="mt-5 space-y-4">

        {/* Row 1 */}

        <div
            className="
            mt-4
            rounded-3xl
            border
            border-white/20
            bg-[#102E67]/80
            p-4
            "
            >

            <h2 className="mb-4 text-lg font-bold text-white">
                Submission Information
            </h2>

            <div className="grid grid-cols-5 gap-4">

                <div>
                <p className="text-xs text-white/60">
                    Submitted By
                </p>

                <p className="text-white">
                    {claim.employee_name || claim.data?.full_name}
                </p>
                </div>

                <div>
                <p className="text-xs text-white/60">
                    Department
                </p>

                <p className="text-white">
                    {claim.department_name || claim.data?.department}
                </p>
                </div>

                <div>
                <p className="text-xs text-white/60">
                    Designation
                </p>

                <p className="text-white">
                    {claim.designation_name || claim.data?.designation}
                </p>
                </div>

                <div>
                <p className="text-xs text-white/60">
                    Current Stage
                </p>

                <p className="text-white">
                    {claim.status}
                </p>
                </div>

                <div>
                <p className="text-xs text-white/60">
                    Submission Date
                </p>

                <p className="text-white">
                    {claim.data?.journey_date || "-"}
                </p>
                </div>

            </div>

            </div>

        <div className="grid grid-cols-12 gap-3">

            {/* Expense Breakdown */}

            <div className="col-span-12 rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">

            <h2 className="mb-4 text-lg font-bold text-white">
                Expense Breakdown
            </h2>

            <table className="w-full text-sm">

                <thead>

                    <tr className="border-b border-white/10">

                    <th className="py-3 text-left">
                        Expense Date
                    </th>

                    <th className="py-3 text-left">
                        Claim Type
                    </th>

                    <th className="py-3 text-left">
                        Purpose
                    </th>

                    <th className="py-3 text-left">
                        Mode
                    </th>

                    <th className="py-3 text-left">
                        Project
                    </th>

                    <th className="py-3 text-left">
                        From
                    </th>

                    <th className="py-3 text-left">
                        To
                    </th>

                    <th className="py-3 text-right">
                        Amount
                    </th>

                    </tr>

                </thead>

                <tbody>

                    {claim.expense_items?.map(
                        (item:any,index:number)=>(

                        <tr key={index}>

                        <td className="py-3">
                        {item.expense_date}
                        </td>

                        <td className="py-3">
                        {item.claim_type}
                        </td>

                        <td className="py-3">
                        {item.purpose}
                        </td>

                        <td className="py-3">
                        {item.mode}
                        </td>

                        <td className="py-3">
                        {item.project}
                        </td>

                        <td className="py-3">
                        {item.from_location}
                        </td>

                        <td className="py-3">
                        {item.to_location}
                        </td>

                        <td className="py-3 text-right text-cyan-300 font-semibold">
                        ৳ {Number(
                        item.amount || 0
                        ).toLocaleString()}
                        </td>

                        </tr>

                        ))}
                    <tr className="border-t border-white/10">

                        <td
                            colSpan={7}
                            className="
                            py-4
                            text-right
                            font-semibold
                            text-white
                            "
                        >
                            Total Amount
                        </td>

                        <td
                            className="
                            py-4
                            text-right
                            font-bold
                            text-cyan-300
                            "
                        >
                            ৳ {Number(
                            claim.requested_amount || 0
                            ).toLocaleString()}
                        </td>

                        </tr>

                </tbody>

                </table>

            </div>

            

        </div>

        {/* Row 2 */}

  

       <div className="grid grid-cols-12 gap-3">

    {/* Finance Verification */}

            <div className="col-span-4 rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">

                <h2 className="mb-4 text-lg font-bold text-white">
                    Finance Verification & Payment
                </h2>

                <div className="space-y-4">

                    <div>
                        <p className="text-xs text-white/60">
                            Requested Amount
                        </p>

                        <p className="text-cyan-300 font-semibold">
                            ৳ {Number(
                                claim.requested_amount || 0
                            ).toLocaleString()}
                        </p>
                    </div>

                    <div>

                        <label className="text-xs text-white/60">
                            Verified Amount
                        </label>

                        <input
                            defaultValue={
                                claim.verified_amount || ""
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
                            text-white
                            "
                        />

                    </div>

                    <div>

                        <label className="text-xs text-white/60">
                            Payment Amount
                        </label>

                        <input
                            className="
                            mt-1
                            w-full
                            rounded-xl
                            border
                            border-white/10
                            bg-white/5
                            px-3
                            py-2
                            text-white
                            "
                        />

                    </div>

                    <div>

                        <label className="text-xs text-white/60">
                            Payment Reference
                        </label>

                        <input
                            className="
                            mt-1
                            w-full
                            rounded-xl
                            border
                            border-white/10
                            bg-white/5
                            px-3
                            py-2
                            text-white
                            "
                        />

                    </div>

                </div>

            </div>

            {/* Workflow Action */}

            <div className="col-span-4 rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">

                <h2 className="mb-4 text-lg font-bold text-white">
                    Workflow Action
                </h2>

                <textarea
                    value={remarks}
                    onChange={(e) =>
                        setRemarks(
                        e.target.value
                        )
                    }
                    rows={4}
                    placeholder="Add approval or rejection comments..."
                    className="
                    w-full
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    p-4
                    text-white
                    "
                    />

                    <div className="mt-4">

                    <label className="text-xs text-white/60">
                        Select Action
                    </label>

                    <select
                        value={selectedAction}
                        onChange={(e) =>
                        setSelectedAction(
                            e.target.value
                        )
                        }
                        className="
                        mt-2
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        px-3
                        py-3
                        text-white
                        "
                    >

                        <option value="">
                        Select Action
                        </option>

                        {claim.workflow_actions
                        ?.filter(
                            (action: any) =>
                            [
                                "APPROVE",
                                "REJECT",
                                "BACK",
                                "RETURN",
                            ].includes(
                                action.action_code
                            )
                        )
                        .map(
                            (action: any) => (

                            <option
                                key={action.action_code}
                                value={action.action_code}
                            >
                                {action.action_name}
                            </option>

                            )
                        )}

                    </select>

                    </div>
        
                <button
                    disabled={
                        processing ||
                        !selectedAction
                    }
                    onClick={async () => {

                        try {

                        setProcessing(true);

                        if (
                            selectedAction ===
                            "APPROVE"
                        ) {

                            await reimbursementService.approveApplication(
                            claim.id,
                            remarks
                            );

                        }

                        if (
                            selectedAction ===
                            "REJECT"
                        ) {

                            await reimbursementService.rejectApplication(
                            claim.id,
                            remarks
                            );

                        }

                        alert(
                            "Action completed successfully"
                        );

                        loadClaim();

                        } catch (error) {

                        console.error(error);

                        alert(
                            "Action failed"
                        );

                        } finally {

                        setProcessing(false);

                        }

                    }}
                    className="
                    mt-4
                    w-full
                    rounded-xl
                    bg-cyan-600
                    px-5
                    py-3
                    text-white
                    "
                    >
                    {
                        processing
                        ? "Processing..."
                        : "Confirm Action"
                    }
                    </button>

            </div>

            <div className="col-span-4 rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">

            <h2 className="mb-4 text-lg font-bold text-white">
                Attachments
            </h2>

            <div
                className="
                space-y-2
                max-h-[350px]
                overflow-y-auto
                pr-2
                "
                >

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all">

                {claim.attachments?.length > 0 ? (

                    claim.attachments.map(
                        (file: any) => (

                            <div
                                key={file.id}
                                className="
                                rounded-xl
                                border
                                border-white/10
                                bg-white/5
                                p-4
                                "
                            >
                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="font-medium text-white">
                                            {file.file_name}
                                        </p>

                                    </div>

                                    <button
                                        onClick={() =>
                                            window.open(
                                            `http://localhost:8000/${file.file_url}`,
                                            "_blank"
                                            )
                                        }
                                        className="
                                        rounded-xl
                                        bg-cyan-500/15
                                        px-3
                                        py-1
                                        text-sm
                                        text-cyan-300
                                        "
                                        >
                                        Preview
                                        </button>

                                </div>

                            </div>

                        )
                    )

                ) : (

                    <div
                        className="
                        flex
                        h-[180px]
                        items-center
                        justify-center
                        text-sm
                        text-white/60
                        "
                    >
                        No Attachment Found
                    </div>

                )}

                </div>


            </div>

            </div>

        </div>

        {/* Row 3 */}

        <div className="rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">

            <h2 className="mb-4 text-lg font-bold text-white">
            Approval History
            </h2>

            <div className="overflow-x-auto">

                <table className="w-full text-sm">

                    <thead>

                    <tr className="border-b border-white/10">

                        <th className="py-3 text-left">
                        Stage
                        </th>

                        <th className="py-3 text-left">
                        Action
                        </th>

                        <th className="py-3 text-left">
                        User
                        </th>

                        <th className="py-3 text-left">
                        Comments
                        </th>

                        <th className="py-3 text-left">
                        Date Time
                        </th>

                    </tr>

                    </thead>

                    <tbody>

                        {claim.approval_history?.length > 0 ? (

                            claim.approval_history.map(
                                (item: any, index: number) => (

                                <tr key={index}>

                                    <td className="py-3">
                                        {item.stage_name}
                                    </td>

                                    <td className="py-3">
                                        {item.action}
                                    </td>

                                    <td className="py-3">
                                        {item.user_name || "-"}
                                    </td>

                                    <td className="py-3">
                                        {item.comments || "-"}
                                    </td>

                                    <td className="py-3">
                                        {item.action_date
                                        ? new Date(
                                            item.action_date
                                            ).toLocaleString(
                                            "en-BD",
                                            {
                                                timeZone:
                                                "Asia/Dhaka",
                                            }
                                            )
                                        : "-"
                                        }
                                    </td>

                                </tr>

                                )
                            )

                        ) : (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="
                                    py-8
                                    text-center
                                    text-white/60
                                    "
                                >
                                    No Approval History Found
                                </td>

                            </tr>

                        )}

                        </tbody>

                </table>

                </div>

        </div>

        </div>
        </div>

        </section>

      </div>

    </main>
  );
}