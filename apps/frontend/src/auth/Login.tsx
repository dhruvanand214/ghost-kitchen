import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      role
      kitchenId
    }
  }
`;


export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [login, { loading, error }] = useMutation(LOGIN);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await login({
      variables: {
        email: form.email,
        password: form.password
      }
    });

    const { token, role, kitchenId } = res.data.login;

    // 🔐 store auth
    if (role === "ADMIN") {
      localStorage.setItem("admin_token", token);
    } else if (role === "KITCHEN") {
      localStorage.setItem("kitchen_token", token);
    } else {
      localStorage.setItem("customer_token", token);
    }
    localStorage.setItem("role", role);
    if (kitchenId) {
      localStorage.setItem("kitchenId", kitchenId);
    }

    // 🚀 redirect based on role
    if (role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/kitchen");
    }
  };

  return (


    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-panel border border-border p-6 rounded-xl w-96">
        <h1 className="text-2xl font-semibold mb-6">
          Welcome back 👋
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full bg-bg border border-border rounded-lg px-3 py-2"
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            className="w-full bg-bg border border-border rounded-lg px-3 py-2"
            placeholder="Password"
            name="password"
            type="password"
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading} className="w-full bg-accent py-2 rounded-lg">
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <p style={{ color: "red" }}>{error.message}</p>}
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          New kitchen?{" "}
          <Link
            to="/signup"
            className="text-accent hover:underline"
          >
            Register your kitchen
          </Link>
        </div>

      </div>
    </div>

  );
}
