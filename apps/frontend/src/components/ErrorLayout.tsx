import { useNavigate } from "react-router-dom";

type Props = {
  code: string;
  title: string;
  message: string;
};

export default function ErrorLayout({
  code,
  title,
  message
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="
      min-h-screen
      flex items-center justify-center
      bg-gradient-to-br from-black via-gray-900 to-black
      p-6
    ">
      <div className="
        max-w-md w-full
        text-center
        rounded-3xl
        bg-gray-900/80
        backdrop-blur
        border border-gray-700
        p-10
        space-y-6
        shadow-2xl
      ">
        <div className="text-7xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          {code}
        </div>

        <h1 className="text-2xl font-semibold">
          {title}
        </h1>

        <p className="text-gray-400">
          {message}
        </p>

        <button
          onClick={() => navigate("/")}
          className="
            mt-4
            px-6 py-3
            rounded-xl
            bg-indigo-600
            hover:bg-indigo-500
            transition
            font-medium
          "
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
