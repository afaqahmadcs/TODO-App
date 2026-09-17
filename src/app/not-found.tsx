import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-2xl space-y-6 text-center">
        {/* Visual 404 Duotone Badge */}
        <div className="w-16 h-16 rounded-2xl bg-secondary/15 border border-secondary/25 text-secondary flex items-center justify-center mx-auto shadow-inner">
          <Icon name="explore_off" size={32} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-surface-container text-secondary text-xs font-mono font-semibold">
            ERROR 404 • ROUTE NOT FOUND
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            The workspace view or deliverable you are looking for has been moved, renamed, or does not exist.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-center">
          <Link href="/dashboard">
            <Button
              variant="primary"
              className="flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Icon name="dashboard" size={16} />
              <span>Back to Command Center</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
