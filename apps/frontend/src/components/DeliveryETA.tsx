type Props = {
  eta?: string;
};

export default function DeliveryETA({ eta }: Props) {
  return (
    <div className="
      rounded-2xl
      bg-gradient-to-br from-indigo-500/20 to-purple-600/20
      border border-indigo-500/30
      p-5
      text-center
      animate-fade-in
    ">
      <p className="text-xs text-gray-300 uppercase tracking-wide">
        Estimated Delivery
      </p>

      <p className="text-2xl font-semibold mt-2 text-white">
        {eta
          ? new Date(eta).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "Calculating…"}
      </p>

      <p className="text-xs text-gray-400 mt-1">
        We’ll keep this updated live 🚀
      </p>
    </div>
  );
}
