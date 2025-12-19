"use client";
import Shell from "@/components/layout/Shell";
import { useMaterialContext } from "./layout";
import { MaterialView } from "@/features/dashboard/views/material/MaterialView";

export default function MaterialDetailPage() {
  const { materialData } = useMaterialContext();
  return (
    <Shell>
      <div className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
        <MaterialView material={materialData} />
      </div>
    </Shell>
  );
}
