type Item = {
  name: string;
  quantity: number;
  priceSnapshot: number;
};

type Props = {
  items: Item[];
  total: number;
};

export default function OrderItems({ items, total }: Props) {
  return (
    <div className="
      rounded-2xl
      bg-gray-900/80
      backdrop-blur
      border border-gray-700
      p-6
      space-y-4
    ">
      <h3 className="text-sm font-semibold text-gray-300">
        Order Summary
      </h3>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between text-sm"
          >
            <div className="text-gray-300">
              {item.name}
              <span className="text-gray-500">
                {" "}× {item.quantity}
              </span>
            </div>

            <div className="text-gray-200">
              ₹{item.priceSnapshot * item.quantity}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-4 flex justify-between">
        <span className="text-gray-400 text-sm">
          Total
        </span>
        <span className="text-lg font-semibold text-white">
          ₹{total}
        </span>
      </div>
    </div>
  );
}
