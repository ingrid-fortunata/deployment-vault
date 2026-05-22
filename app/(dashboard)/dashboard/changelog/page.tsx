import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VERSIONS } from "@/lib/versions";
import { VersionTimeline } from "@/components/layout/version-timeline";

export default function ChangelogPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Version History
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          All releases of Deployment Vault
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm p-6 pt-7">
        <VersionTimeline versions={VERSIONS} />
      </div>
    </div>
  );
}
