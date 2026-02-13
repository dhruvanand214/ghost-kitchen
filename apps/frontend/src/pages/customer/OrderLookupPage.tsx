import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------- GraphQL ---------------- */

const GET_ORDERS_BY_PHONE = gql`
  query GetOrdersByPhone(
    $phone: String!
    $verificationToken: String!
  ) {
    getOrdersByPhone(
      phone: $phone
      verificationToken: $verificationToken
    ) {
      id
      orderNumber
      status
      createdAt
    }
  }
`;

/* ---------------- Component ---------------- */

type Step = "PHONE" | "OTP" | "ORDERS";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
}

interface GetOrdersResponse {
  getOrdersByPhone: Order[];
}

export default function OrderLookupPage() {
  const navigate = useNavigate();

  const isValidPhone = (phone: string) => {
    return /^[6-9]\d{9}$/.test(phone);
  };

  const [step, setStep] = useState<Step>("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [fetchOrders, { data, loading }] =
    useLazyQuery<GetOrdersResponse>(GET_ORDERS_BY_PHONE);

  /* ---------------- Handlers ---------------- */

  const handleSendOtp = async () => {
    if (!isValidPhone(phone)) {
      setPhoneError("Invalid phone number");
      return;
    }

    setSendingOtp(true);
    await fetch(`${import.meta.env.VITE_SOCKET_URL}/api/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    setSendingOtp(false);

    setStep("OTP");
  };


  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    const res = await fetch(`${import.meta.env.VITE_SOCKET_URL}/api/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp })
    });

    const data = await res.json();
    if (!data.verificationToken) {
      alert("Invalid OTP");
      setVerifyingOtp(false);
      return;
    }

    await fetchOrders({
      variables: {
        phone,
        verificationToken: data.verificationToken
      }
    });

    setVerifyingOtp(false);
    setStep("ORDERS");
  };


  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">
        Track Your Orders
      </h1>

      {/* STEP 1 — ENTER PHONE */}
      {step === "PHONE" && (
        <>
          <input
            className="input"
            placeholder="Enter 10-digit phone number"
            value={phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setPhone(value);
              if (!isValidPhone(value)) {
                setPhoneError("Please enter a valid 10-digit phone number");
              } else {
                setPhoneError("");
              }
            }}
            maxLength={10}
          />
          {phoneError && (
            <p className="text-red-400 text-sm">
              {phoneError}
            </p>
          )}

          <button
            className="btn-primary w-full"
            onClick={handleSendOtp}
            disabled={sendingOtp || !isValidPhone(phone)}
          >
            {sendingOtp ? "Sending OTP…" : "Send OTP"}
          </button>
        </>
      )}

      {/* STEP 2 — VERIFY OTP */}
      {step === "OTP" && (
        <>
          <p className="text-gray-400 text-sm">
            OTP sent to {phone}
          </p>

          <input
            className="input"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            className="btn-primary w-full"
            onClick={handleVerifyOtp}
            disabled={verifyingOtp}
          >
            {verifyingOtp ? "Verifying…" : "Verify OTP"}
          </button>
        </>
      )}

      {/* STEP 3 — SHOW ORDERS */}
      {step === "ORDERS" && (
        <>
          {loading && (
            <p className="text-gray-400">Loading orders…</p>
          )}

          {data?.getOrdersByPhone?.length === 0 && (
            <p className="text-gray-400">
              No orders found for this number.
            </p>
          )}

          <div className="space-y-3">
            {data?.getOrdersByPhone?.map(
              (order: Order) => (
                <div
                  key={order.id}
                  className="card cursor-pointer"
                  onClick={() =>
                    navigate(`/order/track/${order.id}`)
                  }
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {order.orderNumber}
                    </span>
                    <span className="text-accent">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
