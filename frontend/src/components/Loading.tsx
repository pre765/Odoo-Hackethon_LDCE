export default function Loading({ label = "Loading..." }: { label?: string }) {
  return <p className="page-status" role="status">{label}</p>;
}
