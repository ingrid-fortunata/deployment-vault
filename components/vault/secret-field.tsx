"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  value: string | null;
  label?: string;
  multiline?: boolean;
  className?: string;
}

export function SecretField({
  value,
  label,
  multiline = false,
  className,
}: Readonly<Props>) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <span className="text-muted-foreground text-sm italic">Not set</span>
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(value!);
    setCopied(true);
    toast.success(`${label ?? "Value"} copied`);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("group flex items-start gap-2", className)}>
      <div className="flex-1 min-w-0">
        {multiline ? (
          <pre
            className={cn(
              "text-xs font-mono rounded-lg p-3 bg-slate-50 border border-border overflow-auto max-h-40 transition-all",
              revealed ? "text-foreground" : "select-none",
            )}
            style={revealed ? {} : { filter: "blur(4px)" }}
          >
            {value}
          </pre>
        ) : (
          <span
            className={cn(
              "text-sm font-mono block truncate transition-all",
              revealed ? "text-foreground" : "select-none",
            )}
            style={revealed ? {} : { filter: "blur(4px)" }}
          >
            {value}
          </span>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setRevealed(!revealed)}
          title={revealed ? "Hide" : "Reveal"}
        >
          {revealed ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={handleCopy}
          title="Copy"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
