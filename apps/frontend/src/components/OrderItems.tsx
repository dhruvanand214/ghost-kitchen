export default function OrderItems({
  items,
  total
}: {
  items: any[];
  total: number;
}) {
  return (
    <div className="card space-y-3">
      <h3 className="font-medium">Your Order</h3>

      {items.map((item, i) => (
        <div key={i} className="flex justify-between">
          <span>
            {item.name} × {item.quantity}
          </span>
          <span>₹{item.priceSnapshot * item.quantity}</span>
        </div>
      ))}

      <hr className="border-border" />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>₹{total}</span>
      </div>
    </div>
  );
}
