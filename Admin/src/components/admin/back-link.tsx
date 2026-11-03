import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export function BackLink() {
  return (
    <Link
      to="/"
      className="mb-3 inline-flex items-center gap-1 rounded-xl text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <ArrowLeft className="size-4" />
      Meus pudins
    </Link>
  );
}
