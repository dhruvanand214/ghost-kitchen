const STEPS = [
  "RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

export default function OrderStatusTimeline({
  status
}: {
  status: string;
}) {
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="space-y-4">
      {STEPS.map((step, index) => {
        const isDone = index <= currentIndex;

        return (
          
          <div key={step} className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full ${
                isDone ? "bg-accent" : "bg-gray-600"
              }`}
            />
            <span
              className={
                isDone ? "text-white" : "text-gray-400"
              }
            >
              {step.replaceAll("_", " ")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
