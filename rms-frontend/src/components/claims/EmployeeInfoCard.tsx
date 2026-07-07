"use client";

type EmployeeInfoCardProps = {
  employee?: {
    employee_id?: string;
    full_name?: string;
    designation?: string;
    department?: string;
    email?: string;
  };
};

export default function EmployeeInfoCard({
  employee,
}: EmployeeInfoCardProps) {

  console.log(
    "EMPLOYEE CARD DATA =>",
    employee
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

      <div className="mb-4">

        <h3 className="text-base font-semibold text-white">
          Employee Information
        </h3>

        <p className="mt-1 text-xs text-white/50">
          Auto populated from employee profile
        </p>

      </div>


      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <div>

          <label className="text-xs text-white/50">
            Employee ID
          </label>


          <div className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            {employee?.employee_id || "-"}
          </div>

        </div>

        <div>

          <label className="text-xs text-white/50">
            Employee Name
          </label>

          <div className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            {employee?.full_name || "-"}
          </div>

        </div>

        <div>

          <label className="text-xs text-white/50">
            Designation
          </label>

          <div className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            {employee?.designation || "-"}
          </div>

        </div>

        <div>

          <label className="text-xs text-white/50">
            Department
          </label>

          <div className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            {employee?.department || "-"}
          </div>

        </div>

        <div>

          <label className="text-xs text-white/50">
            Email
          </label>

          <div className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            {employee?.email || "-"}
          </div>

        </div>

      </div>

    </div>

  );
}