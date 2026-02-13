import ErrorLayout from "../../components/ErrorLayout";

export default function Unauthorized401() {
  return (
    <ErrorLayout
      code="401"
      title="Unauthorized"
      message="Your session has expired or you don’t have access to this page."
    />
  );
}
