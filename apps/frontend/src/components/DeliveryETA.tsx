export default function DeliveryETA({ eta }: { eta?: string }) {
  if (!eta) return null;

  return (
    <div className="card">
      <h3 className="font-medium mb-1">Estimated Delivery</h3>
      <p className="text-accent">
        {new Date(eta).toLocaleTimeString()}
      </p>
    </div>
  );
}
