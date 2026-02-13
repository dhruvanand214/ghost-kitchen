import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import App from "./App";
import { setNavigator } from "./utils/Navigation";

export default function AppWrapper() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return <App />;
}
