import ErrorLayout from "../../components/ErrorLayout";

export default function NotFound404() {
  return (
    <ErrorLayout
      code="404"
      title="Page not found"
      message="The page you are looking for doesn’t exist or was moved."
    />
  );
}
