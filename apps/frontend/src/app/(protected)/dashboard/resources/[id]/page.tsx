"use client";
import Shell from "@/components/layout/Shell";
import { useResourceContext } from "./layout";
import { ResourceView } from "@/features/dashboard/views/resource/ResourceView";

export default function ResourceDetailPage() {
  const { resourceData } = useResourceContext();
  return (
    <Shell>
      <div className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
        <ResourceView resource={resourceData} />
      </div>
    </Shell>
  );
}
