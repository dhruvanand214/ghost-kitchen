type Props = {
  status: string;
};

const STEPS = [
  { key: "RECEIVED", label: "Received", emoji: "📥" },
  { key: "PREPARING", label: "Preparing", emoji: "👨‍🍳" },
  { key: "OUT_FOR_DELIVERY", label: "On the way", emoji: "🛵" },
  { key: "DELIVERED", label: "Delivered", emoji: "🎉" }
];

export default function OrderStatusTimeline({ status }: Props) {
  const currentIndex = STEPS.findIndex(
    (s) => s.key === status
  );

  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute top-6 left-0 right-0 h-1 bg-gray-700 rounded-full" />
      <div
        className="absolute top-6 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700"
        style={{
          width: `${(currentIndex / (STEPS.length - 1)) * 100}%`
        }}
      />

      <div className="flex justify-between relative">
        {STEPS.map((step, index) => {
          const isDone = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-xl
                  transition-all duration-500
                  ${
                    isDone
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-400"
                  }
                  ${isActive ? "scale-110 ring-4 ring-indigo-500/40" : ""}
                `}
              >
                {step.emoji}
              </div>

              <span
                className={`
                  text-xs font-medium
                  ${
                    isDone ? "text-white" : "text-gray-500"
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
