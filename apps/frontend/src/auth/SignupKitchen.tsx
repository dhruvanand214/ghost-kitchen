import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const KITCHEN_SIGNUP = gql`
  mutation KitchenSignup($input: KitchenSignupInput!) {
    kitchenSignup(input: $input) {
      token
      role
      kitchenId
    }
  }
`;

export default function SignupKitchen() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    kitchenName: "",
    location: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    if (localStorage.getItem("token")) {
      window.location.href = "/";
    }
  }, []);

  const [signup, { loading, error }] = useMutation(KITCHEN_SIGNUP);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signup({
      variables: { input: form }
    });

    const { token, role, kitchenId } = res.data.kitchenSignup;

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("kitchenId", kitchenId);

    navigate("/kitchen");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-panel border border-border p-6 rounded-xl w-96">
        <h1 className="text-2xl font-semibold mb-6">
          Register your Kitchen
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="kitchenName"
            placeholder="Kitchen name"
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="location"
            placeholder="Location"
            onChange={handleChange}
            className="input"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="input"
            required
          />

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>

          {error && (
            <p className="text-red-400 text-sm">{error.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
