import ErrorLayout from "../../components/ErrorLayout";

export default function ServerError500() {
  return (
    <ErrorLayout
      code="500"
      title="Something went wrong"
      message="Our servers are having a moment. Please try again later."
    />
  );
}
