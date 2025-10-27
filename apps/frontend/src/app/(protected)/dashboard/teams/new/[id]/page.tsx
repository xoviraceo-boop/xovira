"use client";
import { useParams } from "next/navigation";
import TeamForm from "@/entities/teams/components/TeamForm";

export default function NewTeamPage() {
  const params = useParams();
  const _id = params?.id as string;
  return <TeamForm teamId={_id} mode="create" />;
}


