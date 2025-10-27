"use client";
import { useParams } from "next/navigation";
import ProjectForm from "@/entities/projects/components/ProjectForm";

export default function NewProjectPage() {
  const params = useParams();
  const _id = params?.id as string;
  return <ProjectForm projectId={_id} mode="create" />;
}





