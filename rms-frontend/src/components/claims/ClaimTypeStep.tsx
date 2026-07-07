  type ClaimTypeStepProps = {
    selectedType: string;
    onSelect: (type: string) => void;
  };

  const claimTypes = [
    {
      id: "transport",
      title: "Transport Claim",
      description: "Travel and transportation expenses",
      icon: "🚕",
    },
    {
      id: "food",
      title: "Food Claim",
      description: "Meal and refreshment expenses",
      icon: "🍽️",
    },
    {
      id: "medical",
      title: "Medical Claim",
      description: "Medical reimbursement expenses",
      icon: "🏥",
    },
    {
      id: "mobile",
      title: "Mobile & Internet",
      description: "Communication reimbursement",
      icon: "📱",
    },
    {
      id: "fuel",
      title: "Fuel Claim",
      description: "Vehicle fuel reimbursement",
      icon: "⛽",
    },
    {
      id: "accommodation",
      title: "Accommodation",
      description: "Hotel and lodging expenses",
      icon: "🏨",
    },
    {
      id: "training",
      title: "Training & Certification",
      description: "Training and exam expenses",
      icon: "🎓",
    },
    {
      id: "misc",
      title: "Miscellaneous",
      description: "Other approved expenses",
      icon: "📋",
    },
  ];

  export default function ClaimTypeStep({
    selectedType,
    onSelect,
  }: ClaimTypeStepProps) {
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
        <div className="mb-5">
          <h3 className="text-base font-semibold">
            Select Claim Type
          </h3>

          <p className="mt-1 text-xs text-white/50">
            Choose reimbursement category
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">

          {claimTypes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`
                rounded-2xl
                border
                p-4
                text-left
                transition-all
                duration-300
                ${
                  selectedType === item.id
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-white/10 bg-white/5 hover:border-cyan-400/30"
                }
              `}
            >
              <div className="mb-2 text-2xl">
                {item.icon}
              </div>

              <div className="text-sm font-semibold">
                {item.title}
              </div>

              <div className="mt-1 text-xs text-white/50">
                {item.description}
              </div>
            </button>
          ))}

        </div>
      </div>
    );
  }