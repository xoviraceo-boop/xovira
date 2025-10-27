import PublicProposalCard from "@/entities/proposals/components/PublicProposalCard";

// Demo data for testing
const demoProposal = {
  id: "demo-1",
  title: "Looking for Co-founder for AI Startup",
  shortSummary: "Seeking a technical co-founder to join our AI-powered productivity platform. We have MVP ready and initial funding secured.",
  category: "COFOUNDER",
  industry: ["Technology", "AI"],
  keywords: ["AI", "Startup", "Co-founder", "Technical"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  views: 42,
  bookmarks: 8,
  user: {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
  },
  likes: [
    { userId: "user-2" },
    { userId: "user-3" },
  ],
};

export default function DemoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Proposal Card Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PublicProposalCard
          proposal={demoProposal}
          currentUserId="current-user"
          onView={(id) => {
            console.log("View proposal:", id);
          }}
        />
      </div>
    </div>
  );
}
