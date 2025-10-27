export type ProposalType = 'investor' | 'mentor' | 'team' | 'cofounder' | 'partner' | 'customer';
export type ProposalStatus = 'draft' | 'published' | 'archived';

export interface BaseProposal {
    id: string;
    userId?: string;
    type?: ProposalType;
    projectId: string;
    title?: string;
    shortSummary?: string;
    detailedDescription?: string;
    detailedDesc?: string;
    industry?: string[];
    keywords?: string[];
    status?: ProposalStatus;
    createdAt?: string;
    updatedAt?: string;
    metadata?: Record<string, unknown>;
}

// Re-export types from schema for consistency
export type {
	InvestorProposal,
	MentorProposal,
	TeamProposal,
	CofounderProposal,
	PartnerProposal,
	CustomerProposal,
	Proposal
} from '@/schemas/proposal.schema';


