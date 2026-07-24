"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { reimbursementService } from "@/services/reimbursement.service";

export default function ClaimPDFPage() {
  const params = useParams();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await reimbursementService.getApplicationById(params.id as string);
        setClaim(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handlePrint = () => window.print();

  const formatDate = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const totalAmount = claim?.expense_items?.reduce((s: number, i: any) => s + Number(i.amount || 0), 0) || 0;

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  if (!claim) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-gray-500">Claim not found</p>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .print-container { padding: 0 !important; }
        }
        body { background: white; font-family: Arial, sans-serif; }
      `}</style>

      {/* Print Button */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={handlePrint}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg">
          🖨️ Print / Save PDF
        </button>
        <button onClick={() => window.close()}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 shadow-lg">
          ✕ Close
        </button>
      </div>

      {/* PDF Content */}
      <div ref={printRef} className="print-container mx-auto max-w-4xl bg-white p-8 min-h-screen">

        {/* Header */}
        <div style={{background: "linear-gradient(135deg, #0f172a, #1e3a8a, #0891b2)", borderRadius: "12px", padding: "24px", marginBottom: "24px", color: "white", textAlign: "center"}}>
          <div style={{display: "inline-block", background: "white", borderRadius: "8px", padding: "6px 20px", marginBottom: "8px"}}>
            <span style={{color: "#1d4ed8", fontSize: "18px", fontWeight: "800", letterSpacing: "3px"}}>RMS</span>
          </div>
          <p style={{color: "rgba(255,255,255,0.8)", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", margin: "4px 0 0"}}>
            REIMBURSEMENT MANAGEMENT SYSTEM
          </p>
          <h1 style={{color: "white", fontSize: "20px", fontWeight: "700", margin: "12px 0 0"}}>
            Claim Application Report
          </h1>
        </div>

        {/* Claim Info */}
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px"}}>
          {/* Employee Info */}
          <div style={{border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px"}}>
            <h2 style={{fontSize: "12px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px"}}>
              Employee Information
            </h2>
            {[
              ["Employee Name", claim.employee_name || claim.data?.full_name || "-"],
              ["Employee ID", claim.data?.employee_id || "-"],
              ["Department", claim.department_name || claim.data?.department || "-"],
              ["Designation", claim.designation_name || claim.data?.designation || "-"],
              ["Email", claim.employee_email || claim.data?.email || "-"],
            ].map(([label, value]) => (
              <div key={label} style={{display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px"}}>
                <span style={{color: "#64748b"}}>{label}</span>
                <span style={{fontWeight: "600", color: "#0f172a"}}>{value}</span>
              </div>
            ))}
          </div>

          {/* Claim Info */}
          <div style={{border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px"}}>
            <h2 style={{fontSize: "12px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px"}}>
              Claim Information
            </h2>
            {[
              ["Claim Number", claim.application_no || "-"],
              ["Submission Date", formatDate(claim.submitted_at)],
              ["Expense Type", claim.expense_type_name || "-"],
              ["Status", claim.status || "-"],
              ["Requested Amount", `৳ ${Number(claim.requested_amount || 0).toLocaleString()}`],
              ["Paid Amount", `৳ ${Number(claim.paid_amount || 0).toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} style={{display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px"}}>
                <span style={{color: "#64748b"}}>{label}</span>
                <span style={{fontWeight: "600", color: label === "Status" ? "#1d4ed8" : "#0f172a"}}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Details */}
        <div style={{border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "20px", overflow: "hidden"}}>
          <div style={{background: "#f8fafc", padding: "12px 16px", borderBottom: "1px solid #e2e8f0"}}>
            <h2 style={{fontSize: "12px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "1px", margin: 0}}>
              Expense Details
            </h2>
          </div>
          <table style={{width: "100%", borderCollapse: "collapse", fontSize: "11px"}}>
            <thead>
              <tr style={{background: "#f1f5f9"}}>
                {["Date", "Claim Type", "Purpose", "Mode", "Project", "From", "To", "Amount (৳)"].map(h => (
                  <th key={h} style={{padding: "8px 10px", textAlign: h === "Amount (৳)" ? "right" : "left", color: "#64748b", fontWeight: "700", fontSize: "10px", textTransform: "uppercase"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(claim.expense_items || []).map((item: any, i: number) => (
                <tr key={i} style={{borderTop: "1px solid #f1f5f9"}}>
                  <td style={{padding: "8px 10px", color: "#334155"}}>{formatDate(item.expense_date)}</td>
                  <td style={{padding: "8px 10px", color: "#334155"}}>{item.claim_type || "-"}</td>
                  <td style={{padding: "8px 10px", color: "#334155"}}>{item.purpose || "-"}</td>
                  <td style={{padding: "8px 10px", color: "#334155"}}>{item.mode || "-"}</td>
                  <td style={{padding: "8px 10px", color: "#334155"}}>{item.project || "-"}</td>
                  <td style={{padding: "8px 10px", color: "#334155"}}>{item.from_location || "-"}</td>
                  <td style={{padding: "8px 10px", color: "#334155"}}>{item.to_location || "-"}</td>
                  <td style={{padding: "8px 10px", color: "#1d4ed8", fontWeight: "700", textAlign: "right"}}>৳ {Number(item.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{borderTop: "2px solid #bfdbfe", background: "#eff6ff"}}>
                <td colSpan={7} style={{padding: "10px", textAlign: "right", fontWeight: "700", color: "#1d4ed8", fontSize: "12px"}}>Total Requested</td>
                <td style={{padding: "10px", textAlign: "right", fontWeight: "800", color: "#1d4ed8", fontSize: "13px"}}>৳ {totalAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Remarks */}
        {claim.data?.remarks && (
          <div style={{border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", marginBottom: "20px"}}>
            <h2 style={{fontSize: "12px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px"}}>
              Remarks
            </h2>
            <p style={{fontSize: "12px", color: "#334155", margin: 0}}>{claim.data.remarks}</p>
          </div>
        )}

        {/* Approval History */}
        {claim.approval_history && claim.approval_history.length > 0 && (
          <div style={{border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "20px", overflow: "hidden"}}>
            <div style={{background: "#f8fafc", padding: "12px 16px", borderBottom: "1px solid #e2e8f0"}}>
              <h2 style={{fontSize: "12px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "1px", margin: 0}}>
                Approval History
              </h2>
            </div>
            <table style={{width: "100%", borderCollapse: "collapse", fontSize: "11px"}}>
              <thead>
                <tr style={{background: "#f1f5f9"}}>
                  {["Stage", "Action", "By", "Date", "Remarks"].map(h => (
                    <th key={h} style={{padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: "700", fontSize: "10px", textTransform: "uppercase"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claim.approval_history.map((h: any, i: number) => (
                  <tr key={i} style={{borderTop: "1px solid #f1f5f9"}}>
                    <td style={{padding: "8px 10px", color: "#334155"}}>{h.stage_name}</td>
                    <td style={{padding: "8px 10px"}}>
                      <span style={{
                        background: h.action === "APPROVED" || h.action === "PAID" || h.action === "VERIFIED" ? "#dcfce7" :
                                    h.action === "REJECTED" ? "#fee2e2" :
                                    h.action === "RETURNED" || h.action === "BACKED" ? "#fef9c3" : "#f1f5f9",
                        color: h.action === "APPROVED" || h.action === "PAID" || h.action === "VERIFIED" ? "#166534" :
                               h.action === "REJECTED" ? "#991b1b" :
                               h.action === "RETURNED" || h.action === "BACKED" ? "#854d0e" : "#475569",
                        padding: "2px 8px", borderRadius: "20px", fontWeight: "700", fontSize: "10px"
                      }}>{h.action}</span>
                    </td>
                    <td style={{padding: "8px 10px", color: "#334155"}}>{h.user_name || "-"}</td>
                    <td style={{padding: "8px 10px", color: "#334155"}}>{formatDate(h.action_date)}</td>
                    <td style={{padding: "8px 10px", color: "#334155"}}>{h.comments || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature */}
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "32px"}}>
          {["Prepared By", "Verified By", "Authorized By"].map(label => (
            <div key={label} style={{textAlign: "center"}}>
              <div style={{borderTop: "1px solid #94a3b8", paddingTop: "8px", marginTop: "40px"}}>
                <p style={{fontSize: "11px", color: "#64748b", margin: 0}}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{marginTop: "24px", borderTop: "1px solid #e2e8f0", paddingTop: "12px", textAlign: "center"}}>
          <p style={{fontSize: "10px", color: "#94a3b8", margin: 0}}>
            This is a system generated report from RMS — Reimbursement Management System | Generated on {new Date().toLocaleString()}
          </p>
        </div>

      </div>
    </>
  );
}