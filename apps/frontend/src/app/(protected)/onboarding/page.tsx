"use client";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import StepSwitcher from "./_components/StepSwitcher";
import { useRouter, useSearchParams } from "next/navigation";

export default function OnboardingPage() {
  const { data } = trpc.onboarding.get.useQuery();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStep = Number(searchParams.get("step")) || 0;
  const [step, setStep] = useState<number>(initialStep);

  useEffect(() => {
    if (typeof data?.onboardingStep === "number") {
      setStep(data.onboardingStep);
    }
  }, [data?.onboardingStep]);

  useEffect(() => {
    const currentStep = searchParams.get("step");

    if (currentStep !== String(step)) {
      router.replace(`?step=${step}`, { scroll: false });
    }
  }, [step, router, searchParams]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">
        Welcome! Let's get you set up
      </h1>
      <StepSwitcher step={step} onStepChange={setStep} />
    </div>
  );
}
