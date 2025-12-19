-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'LINK', 'OTHER');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'WORKSPACE', 'TEAM', 'PROJECT', 'MEMBERS_ONLY');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('EMAIL', 'PHONE', 'LINKEDIN', 'TELEGRAM', 'DISCORD');

-- CreateEnum
CREATE TYPE "InvestorKind" AS ENUM ('ANGEL', 'VC', 'STRATEGIC', 'CROWDFUNDING', 'GOVERNMENT', 'FAMILY_OFFICE');

-- CreateEnum
CREATE TYPE "MentorDirection" AS ENUM ('SEEKING_MENTOR', 'OFFERING_MENTORSHIP');

-- CreateEnum
CREATE TYPE "MentorCompensation" AS ENUM ('FREE', 'EQUITY', 'ADVISORY_SHARES', 'PAID', 'BARTER');

-- CreateEnum
CREATE TYPE "TeamDirection" AS ENUM ('HIRING', 'SEEKING_POSITION');

-- CreateEnum
CREATE TYPE "WorkArrangement" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('INTERN', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'PRINCIPAL', 'DIRECTOR', 'VP', 'C_LEVEL');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000', 'ENTERPRISE_1000_PLUS');

-- CreateEnum
CREATE TYPE "CofounderDirection" AS ENUM ('SEEKING_COFOUNDER', 'OFFERING_COFOUNDING');

-- CreateEnum
CREATE TYPE "PartnerDirection" AS ENUM ('SEEKING_PARTNER', 'OFFERING_PARTNERSHIP');

-- CreateEnum
CREATE TYPE "PartnershipModel" AS ENUM ('REVENUE_SHARE', 'FIXED_FEE', 'COMMISSION_BASED', 'EQUITY_BASED', 'BARTER', 'JOINT_VENTURE');

-- CreateEnum
CREATE TYPE "ExclusivityType" AS ENUM ('EXCLUSIVE', 'NON_EXCLUSIVE', 'SEMI_EXCLUSIVE');

-- CreateEnum
CREATE TYPE "CustomerDirection" AS ENUM ('SELLING', 'BUYING');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('FOUNDER', 'INVESTOR', 'MEMBER', 'HYBRID');

-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('UNVERIFIED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'IDENTITY_VERIFIED', 'BUSINESS_VERIFIED', 'PREMIUM_VERIFIED');

-- CreateEnum
CREATE TYPE "InvestorType" AS ENUM ('ANGEL', 'VC_FUND', 'FAMILY_OFFICE', 'CORPORATE_VC', 'CROWDFUNDING', 'GOVERNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "Commitment" AS ENUM ('PART_TIME', 'FULL_TIME', 'CONTRACT', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "FundingType" AS ENUM ('EQUITY', 'DEBT', 'GRANT', 'SAFE', 'CONVERTIBLE_NOTE', 'REVENUE_SHARE');

-- CreateEnum
CREATE TYPE "StartupStage" AS ENUM ('IDEA', 'MVP', 'BETA', 'LAUNCHED', 'GROWTH', 'SCALE');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('ONE_OFF', 'ONGOING', 'MENTORSHIP', 'CONSULTING');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('STRATEGIC', 'TECHNOLOGY', 'DISTRIBUTION', 'MARKETING', 'JOINT_VENTURE');

-- CreateEnum
CREATE TYPE "PartnershipDuration" AS ENUM ('SHORT_TERM', 'MID_TERM', 'LONG_TERM');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('FIXED', 'HOURLY', 'SUBSCRIPTION', 'TIERED', 'USAGE_BASED');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('IMMEDIATE', 'WITHIN_WEEK', 'WITHIN_MONTH', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('IDEA', 'MVP', 'BETA', 'LAUNCHED', 'GROWTH', 'SCALE', 'EXIT');

-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('DEVELOPMENT', 'MARKETING', 'SALES', 'DESIGN', 'ADVISORY', 'GENERAL');

-- CreateEnum
CREATE TYPE "CompensationType" AS ENUM ('CASH_ONLY', 'EQUITY_ONLY', 'CASH_AND_EQUITY', 'DEFERRED_CASH', 'PROFIT_SHARING', 'HOURLY_RATE', 'PROJECT_BASED', 'REVENUE_SHARE');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AvailabilityType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'CONSULTANT', 'INTERN');

-- CreateEnum
CREATE TYPE "RemotePreference" AS ENUM ('REMOTE_ONLY', 'HYBRID', 'ON_SITE', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('EQUITY', 'CONVERTIBLE_NOTE', 'SAFE', 'DEBT', 'REVENUE_SHARE', 'GRANT');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('PROPOSED', 'UNDER_REVIEW', 'DUE_DILIGENCE', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvestmentStage" AS ENUM ('INITIAL', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'BRIDGE', 'MEZZANINE');

-- CreateEnum
CREATE TYPE "ProposalType" AS ENUM ('INVESTMENT', 'MENTORSHIP', 'TEAM', 'COFOUNDER', 'PARTNERSHIP', 'CUSTOMER', 'MEMBERSHIP');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('INVESTOR', 'MENTOR', 'TEAM', 'COFOUNDER', 'PARTNER', 'CUSTOMER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RequestTargetType" AS ENUM ('PROJECT', 'TEAM', 'INVESTMENT', 'COLLABORATION');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReviewContextType" AS ENUM ('PROJECT', 'TEAM', 'INVESTMENT', 'GENERAL', 'PROPOSAL');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('IDENTITY', 'EDUCATION', 'WORK_EXPERIENCE', 'COMPANY', 'INVESTOR_ACCREDITATION', 'TECHNICAL_SKILLS');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REQUEST_RECEIVED', 'REQUEST_STATUS', 'INVITATION_RECEIVED', 'INVITATION_STATUS', 'MESSAGE_RECEIVED', 'CONNECTION_REQUEST', 'PROJECT_UPDATE', 'INVESTMENT_UPDATE', 'MILESTONE_COMPLETED', 'TEAM_INVITATION', 'REVIEW_RECEIVED', 'VERIFICATION_STATUS', 'SYSTEM_ANNOUNCEMENT', 'USAGE_ALERT', 'FEATURE_UPDATE', 'BILLING', 'MAINTENANCE', 'PAYMENT', 'SUBSCRIPTION', 'USAGE_OVER_LIMIT', 'USAGE_APPROACHING_LIMIT', 'PACKAGE_EXPIRED', 'SUBSCRIPTION_EXPIRED', 'MATCH_FOUND');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'CONNECTIONS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'PROJECT_CREATE', 'PROJECT_UPDATE', 'REQUEST_SEND', 'INVESTMENT_PROPOSE', 'MESSAGE_SEND', 'CONNECTION_REQUEST', 'REVIEW_GIVE');

-- CreateEnum
CREATE TYPE "ProposalIntent" AS ENUM ('SEEKING', 'OFFERING');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('POST', 'UPDATE', 'ANNOUNCEMENT', 'MILESTONE', 'MEDIA', 'POLL', 'ARTICLE', 'ACHIEVEMENT', 'DISCUSSION');

-- CreateEnum
CREATE TYPE "PostTopic" AS ENUM ('FEATURE', 'DESIGN', 'IMPLEMENTATION', 'BUG', 'ANNOUNCEMENT', 'ISSUE', 'OTHERS');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'CONNECTIONS', 'TEAM', 'PRIVATE');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('INTERNAL', 'EXTERNAL', 'EMBED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'SYSTEM', 'BOT', 'ADMIN');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'USER_UPDATE', 'USER_DELETE', 'PROJECT_CREATE', 'PROJECT_UPDATE', 'PROJECT_DELETE', 'PROJECT_PUBLISH', 'PROJECT_ARCHIVE', 'PROJECT_TRANSFER', 'TEAM_CREATE', 'TEAM_UPDATE', 'TEAM_DELETE', 'MEMBER_ADD', 'MEMBER_REMOVE', 'MEMBER_BLOCK', 'MEMBER_UNBLOCK', 'MEMBER_ROLE_CHANGE', 'INVESTMENT_PROPOSE', 'INVESTMENT_ACCEPT', 'INVESTMENT_REJECT', 'PROPOSAL_CREATE', 'PROPOSAL_UPDATE', 'PROPOSAL_DELETE', 'PROPOSAL_PUBLISH', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SYSTEM_ALERT', 'SECURITY_LOGIN_FAILED', 'SECURITY_PASSWORD_CHANGE', 'SECURITY_2FA_ENABLE', 'SECURITY_SUSPICIOUS_ACTIVITY');

-- CreateEnum
CREATE TYPE "LogCategory" AS ENUM ('USER', 'PROJECT', 'TEAM', 'INVESTMENT', 'PROPOSAL', 'SYSTEM', 'SECURITY', 'NOTIFICATION', 'PAYMENT', 'CONTENT');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "LogVisibility" AS ENUM ('PUBLIC', 'TEAM', 'ADMIN', 'PRIVATE');

-- CreateEnum
CREATE TYPE "MembershipDirection" AS ENUM ('SEEKING_MEMBERSHIP', 'OFFERING_MEMBERSHIP');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT', 'MANAGE_MEMBERS', 'MANAGE_FINANCES', 'MANAGE_INVESTORS', 'VIEW_ANALYTICS', 'EDIT_PROFILE', 'MANAGE_REQUESTS', 'MANAGE_INVITATIONS', 'CREATE_UPDATES', 'MANAGE_MILESTONES', 'ADMIN_ACCESS', 'TRANSFER_OWNERSHIP', 'BLOCK_MEMBERS', 'MANAGE_PERMISSIONS');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'UNPAID', 'PAUSED', 'SUSPENDED', 'EXPIRED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED', 'EXPIRED', 'DENIED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'CRYPTO', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('PAYPAL', 'STRIPE', 'BRAINTREE', 'ADYEN', 'RAZORPAY', 'SQUARE', 'AUTHORIZE_NET', 'OTHER');

-- CreateEnum
CREATE TYPE "Interval" AS ENUM ('EVERY_30_DAYS', 'ANNUAL');

-- CreateEnum
CREATE TYPE "PromotionUnit" AS ENUM ('PERCENTAGE', 'AMOUNT', 'CREDITS', 'DAYS', 'REQUESTS', 'TOKENS');

-- CreateEnum
CREATE TYPE "DiscountUnit" AS ENUM ('PERCENTAGE', 'AMOUNT', 'CREDITS', 'REQUESTS', 'TOKENS');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('SUBSCRIPTION', 'PAY_AS_YOU_GO', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'FROZEN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BillingEventType" AS ENUM ('PROMOTION', 'DISCOUNT', 'CREDIT', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "BillingEventStatus" AS ENUM ('PENDING', 'APPLIED', 'FAILED', 'REVERSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL', 'USAGE_BOOST', 'CREDIT_BONUS', 'TIME_EXTENSION', 'TIER_UPGRADE', 'EARLY_ADAPTER');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'VOLUME', 'LOYALTY', 'SEASONAL', 'REFERRAL', 'EARLY_ADAPTER', 'BUNDLE');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('GENERAL', 'PROJECT_HELP', 'TEAM_COORDINATION', 'BRAINSTORMING', 'CODE_REVIEW', 'DOCUMENT_QA', 'MENTORSHIP');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM', 'FUNCTION');

-- CreateEnum
CREATE TYPE "VectorSourceType" AS ENUM ('PROJECT', 'PROFILE', 'POST', 'DOCUMENT', 'COMMENT', 'PROPOSAL', 'TEAM', 'MESSAGE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('PRIVATE', 'TEAM', 'PROJECT', 'PUBLIC');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('HELPFUL', 'NOT_HELPFUL', 'INACCURATE', 'INCOMPLETE', 'HARMFUL', 'BIASED', 'OUTDATED', 'IRRELEVANT', 'TOO_LONG', 'TOO_SHORT');

-- CreateEnum
CREATE TYPE "ShareAccessLevel" AS ENUM ('VIEW', 'COMMENT', 'FULL');

-- CreateEnum
CREATE TYPE "AiActionType" AS ENUM ('CHAT', 'EMBEDDING', 'SEARCH', 'SUMMARIZE', 'ANALYZE', 'GENERATE');

-- CreateEnum
CREATE TYPE "ModelName" AS ENUM ('gpt_4', 'gpt_4_32k', 'gpt_4_1106_preview', 'gpt_4_0125_preview', 'gpt_4_turbo', 'gpt_4_turbo_2024_04_09', 'gpt_3_5_turbo', 'gpt_3_5_turbo_16k', 'gpt_3_5_turbo_1106', 'gpt_3_5_turbo_0125', 'gemini_1_0_pro', 'gemini_1_5_pro', 'gemini_1_5_flash', 'dall_e_3', 'gpt_4o', 'gpt_4o_2024_05_13', 'gpt_4o_mini', 'gpt_4o_mini_2024_07_18', 'claude_3_5_sonnet_20240620', 'claude_3_opus_20240229', 'claude_3_sonnet_20240229', 'claude_3_haiku_20240307');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "username" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "location" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "user_type" "UserType" NOT NULL DEFAULT 'FOUNDER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_step" INTEGER NOT NULL DEFAULT 0,
    "credibility_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verification_level" "VerificationLevel" NOT NULL DEFAULT 'UNVERIFIED',
    "is_kyc_verified" BOOLEAN NOT NULL DEFAULT false,
    "kyc_documents" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_active_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "channel_id" TEXT,
    "project_id" TEXT,
    "team_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignee_id" TEXT,
    "created_by" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "proposal_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "user_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founder_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_experience" INTEGER,
    "previous_exits" TEXT[],
    "linkedin_profile" TEXT,
    "industry_preferences" TEXT[],
    "location_preferences" TEXT[],
    "embedding" vector(1536),
    "embedding_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "founder_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "investor_type" "InvestorType" NOT NULL,
    "firm_name" TEXT,
    "investment_range" TEXT,
    "min_investment" DOUBLE PRECISION,
    "max_investment" DOUBLE PRECISION,
    "preferred_stages" "ProjectStage"[],
    "preferred_industries" TEXT[],
    "geographic_focus" TEXT[],
    "investment_thesis" TEXT,
    "value_add_services" TEXT[],
    "portfolio_size" INTEGER DEFAULT 0,
    "successful_exits" INTEGER DEFAULT 0,
    "average_check_size" DOUBLE PRECISION,
    "is_accredited" BOOLEAN NOT NULL DEFAULT false,
    "accreditation_proof" TEXT,
    "embedding" vector(1536),
    "embedding_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_title" TEXT,
    "experience" INTEGER,
    "current_salary" DOUBLE PRECISION,
    "salary_expectation" DOUBLE PRECISION,
    "availability_type" "AvailabilityType" NOT NULL DEFAULT 'FULL_TIME',
    "hours_per_week" INTEGER,
    "start_date" TIMESTAMP(3),
    "accepts_equity" BOOLEAN NOT NULL DEFAULT true,
    "accepts_cash" BOOLEAN NOT NULL DEFAULT true,
    "accepts_deferred" BOOLEAN NOT NULL DEFAULT false,
    "min_equity_percentage" DOUBLE PRECISION,
    "remote_preference" "RemotePreference" NOT NULL DEFAULT 'HYBRID',
    "role_preferences" TEXT[],
    "industry_preferences" TEXT[],
    "portfolio_url" TEXT,
    "linkedin_url" TEXT,
    "github_url" TEXT,
    "achievements" TEXT[],
    "embedding" vector(1536),
    "embedding_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "previous_owner_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tagline" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "stage" "ProjectStage",
    "industry" TEXT[],
    "tags" TEXT[],
    "revenue_model" TEXT[],
    "target_market" TEXT,
    "competitive_edge" TEXT,
    "funding_goal" DOUBLE PRECISION,
    "funding_raised" DOUBLE PRECISION DEFAULT 0,
    "valuation_cap" DOUBLE PRECISION,
    "team_size" INTEGER NOT NULL DEFAULT 1,
    "is_hiring" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "is_remote_friendly" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "embedding" vector(1536),
    "embedding_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "launched_at" TIMESTAMP(3),
    "transferred_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "title" TEXT,
    "permissions" "Permission"[],
    "is_cofounder" BOOLEAN NOT NULL DEFAULT false,
    "is_investor" BOOLEAN NOT NULL DEFAULT false,
    "is_member" BOOLEAN NOT NULL DEFAULT false,
    "compensation_type" "CompensationType" NOT NULL,
    "salary_amount" DOUBLE PRECISION,
    "equity_percentage" DOUBLE PRECISION,
    "profit_share_percent" DOUBLE PRECISION,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "can_post" BOOLEAN NOT NULL DEFAULT true,
    "can_comment" BOOLEAN NOT NULL DEFAULT true,
    "can_view_project" BOOLEAN NOT NULL DEFAULT true,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocked_at" TIMESTAMP(3),
    "blocked_by" TEXT,
    "block_reason" TEXT,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_ownership_transfers" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "from_owner_id" TEXT NOT NULL,
    "to_owner_id" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "requires_acceptance" BOOLEAN NOT NULL DEFAULT true,
    "acceptance_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "project_ownership_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_blocked_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "blocked_by" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "block_post" BOOLEAN NOT NULL DEFAULT true,
    "block_comment" BOOLEAN NOT NULL DEFAULT true,
    "block_view" BOOLEAN NOT NULL DEFAULT false,
    "blocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unblocked_at" TIMESTAMP(3),
    "unblocked_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "project_blocked_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'UPDATE',
    "topic" "PostTopic" NOT NULL DEFAULT 'OTHERS',
    "project_id" TEXT,
    "team_id" TEXT,
    "attachments" TEXT[],
    "tags" TEXT[],
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "edited_at" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "edited_at" TIMESTAMP(3),

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comment_votes" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vote_type" "VoteType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_comment_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_shares" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment" TEXT,
    "share_type" "ShareType" NOT NULL DEFAULT 'INTERNAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "actor_type" "ActorType" NOT NULL DEFAULT 'USER',
    "action" "LogAction" NOT NULL,
    "category" "LogCategory" NOT NULL,
    "severity" "LogSeverity" NOT NULL DEFAULT 'INFO',
    "entity_type" TEXT,
    "entity_id" TEXT,
    "project_id" TEXT,
    "team_id" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "visibility" "LogVisibility" NOT NULL DEFAULT 'PRIVATE',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "avatar" TEXT,
    "teamType" "TeamType" NOT NULL,
    "industry" TEXT[],
    "skills" TEXT[],
    "status" "TeamStatus" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_hiring" BOOLEAN NOT NULL DEFAULT false,
    "size" INTEGER NOT NULL DEFAULT 1,
    "max_size" INTEGER,
    "location" TEXT,
    "is_remote" BOOLEAN NOT NULL DEFAULT true,
    "embedding" vector(1536),
    "embedding_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_likes" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "title" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "permissions" "Permission"[],
    "compensation_type" "CompensationType",
    "salary_amount" DOUBLE PRECISION,
    "equity_percentage" DOUBLE PRECISION,
    "hourly_rate" DOUBLE PRECISION,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_teams" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL,
    "investor_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "investment_type" "InvestmentType" NOT NULL,
    "equity_percent" DOUBLE PRECISION,
    "valuation" DOUBLE PRECISION,
    "liquidation_pref" DOUBLE PRECISION DEFAULT 1,
    "antidilution" BOOLEAN NOT NULL DEFAULT false,
    "board_seat" BOOLEAN NOT NULL DEFAULT false,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'PROPOSED',
    "stage" "InvestmentStage" NOT NULL DEFAULT 'INITIAL',
    "due_diligence_completed" BOOLEAN NOT NULL DEFAULT false,
    "legal_docs_complete" BOOLEAN NOT NULL DEFAULT false,
    "proposed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "target_type" "RequestTargetType" NOT NULL,
    "project_id" TEXT,
    "team_id" TEXT,
    "proposal_id" TEXT,
    "role" TEXT,
    "message" TEXT NOT NULL,
    "proposed_terms" JSONB,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_applied" "RoleType",

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "project_id" TEXT,
    "team_id" TEXT,
    "role" TEXT,
    "message" TEXT NOT NULL,
    "terms" JSONB,
    "expires_at" TIMESTAMP(3),
    "response" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_type" "RequestTargetType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "giver_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "context_type" "ReviewContextType" NOT NULL,
    "project_id" TEXT,
    "team_id" TEXT,
    "proposal_id" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "work_quality" INTEGER,
    "communication" INTEGER,
    "reliability" INTEGER,
    "leadership" INTEGER,
    "technical_skills" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "linkedin_profile" TEXT,
    "website_url" TEXT,
    "company_email" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "proficiency" "ProficiencyLevel" NOT NULL,
    "years_of_exp" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_endorsements" (
    "id" TEXT NOT NULL,
    "user_skill_id" TEXT NOT NULL,
    "endorser_id" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_endorsements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "interest_id" TEXT NOT NULL,

    CONSTRAINT "user_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "attachments" TEXT[],
    "reply_to_id" TEXT,
    "reactions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "related_id" TEXT,
    "related_type" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_visibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "show_email" BOOLEAN NOT NULL DEFAULT false,
    "show_phone" BOOLEAN NOT NULL DEFAULT false,
    "allow_messages" BOOLEAN NOT NULL DEFAULT true,
    "allow_connections" BOOLEAN NOT NULL DEFAULT true,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "new_invitation_email" BOOLEAN NOT NULL DEFAULT true,
    "new_message_email" BOOLEAN NOT NULL DEFAULT true,
    "project_update_email" BOOLEAN NOT NULL DEFAULT true,
    "investment_update_email" BOOLEAN NOT NULL DEFAULT true,
    "new_connection_email" BOOLEAN NOT NULL DEFAULT true,
    "weekly_digest_email" BOOLEAN NOT NULL DEFAULT true,
    "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
    "show_in_search" BOOLEAN NOT NULL DEFAULT true,
    "show_in_recommendations" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "new_request_email" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "ActivityType" NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_analytics" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "unique_views" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "accepted_apps" INTEGER NOT NULL DEFAULT 0,
    "investment_requests" INTEGER NOT NULL DEFAULT 0,
    "total_funding" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "user_id" TEXT NOT NULL,
    "createdBy" VARCHAR(255) NOT NULL,
    "category" "ProposalType" NOT NULL,
    "project_id" TEXT,
    "team_id" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "shortSummary" VARCHAR(500) NOT NULL,
    "detailedDesc" TEXT NOT NULL,
    "industry" TEXT[],
    "keywords" TEXT[],
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "slug" TEXT,
    "metaDescription" VARCHAR(160),
    "tags" TEXT[],
    "language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "timezone" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "searchVector" tsvector,
    "embedding" vector(1536),
    "embedding_updated_at" TIMESTAMP(3),
    "intent" "ProposalIntent" NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "fileUrl" TEXT,
    "externalUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_purchases" (
    "id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "feeUsd" DOUBLE PRECISION NOT NULL,
    "netUsd" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT,
    "project_id" TEXT,
    "team_id" TEXT,
    "investment_id" TEXT,
    "verification_request_id" TEXT,
    "filename" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "description" VARCHAR(500),
    "language" VARCHAR(5),
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "checksum" VARCHAR(64),
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "region" VARCHAR(100),
    "city" VARCHAR(100),
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "hybrid" BOOLEAN NOT NULL DEFAULT false,
    "willRelocate" BOOLEAN NOT NULL DEFAULT false,
    "timeZones" TEXT[],
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timelines" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "duration" TEXT,
    "commitment" "Commitment" NOT NULL,
    "availability" TEXT,
    "urgency" "Urgency" NOT NULL DEFAULT 'MEDIUM',
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "website" VARCHAR(255),
    "linkedin" VARCHAR(255),
    "twitter" VARCHAR(255),
    "github" VARCHAR(255),
    "telegram" VARCHAR(100),
    "discord" VARCHAR(100),
    "preferred_contact" "ContactMethod" NOT NULL DEFAULT 'EMAIL',
    "public_profile" BOOLEAN NOT NULL DEFAULT true,
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_proposals" (
    "id" TEXT NOT NULL,
    "seeking_or_offering" "MembershipDirection" NOT NULL,
    "role_title" VARCHAR(100) NOT NULL,
    "department" VARCHAR(50),
    "custom_role" VARCHAR(100),
    "key_responsibilities" TEXT[],
    "required_skills" TEXT[],
    "preferred_skills" TEXT[],
    "experience_level" "SeniorityLevel",
    "years_experience" INTEGER,
    "compensation_type" "CompensationType",
    "salary_range" JSONB,
    "equity_range" JSONB,
    "benefits" TEXT[],
    "time_commitment" "Commitment",
    "hours_per_week" INTEGER,
    "start_date" TIMESTAMP(3),
    "duration" TEXT,
    "work_arrangement" "WorkArrangement" NOT NULL DEFAULT 'HYBRID',
    "what_offered" TEXT,
    "what_expected" TEXT,
    "project_stage" "StartupStage",
    "team_size" INTEGER,
    "company_values" TEXT[],
    "team_culture" TEXT,
    "current_position" TEXT,
    "portfolio_url" TEXT,
    "availability" "Availability",
    "permissions" "Permission"[],
    "decision_authority" TEXT[],
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "membership_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_proposals" (
    "id" TEXT NOT NULL,
    "funding_needed" DOUBLE PRECISION,
    "funding_type" "FundingType",
    "startup_stage" "StartupStage",
    "current_revenue" DOUBLE PRECISION,
    "projected_revenue" DOUBLE PRECISION,
    "customers" INTEGER,
    "monthly_users" INTEGER,
    "growth_rate" DOUBLE PRECISION,
    "use_of_funds" TEXT,
    "key_metrics" JSONB,
    "team_size" INTEGER,
    "founded_date" TIMESTAMP(3),
    "previous_funding" DOUBLE PRECISION,
    "equity_offered" DOUBLE PRECISION,
    "board_seat" BOOLEAN NOT NULL DEFAULT false,
    "expected_roi" DOUBLE PRECISION,
    "exit_strategy" TEXT,
    "min_investment" DOUBLE PRECISION,
    "max_investment" DOUBLE PRECISION,
    "investor_kind" "InvestorKind"[],
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "investor_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_proposals" (
    "id" TEXT NOT NULL,
    "seeking_or_offering" "MentorDirection" NOT NULL,
    "guidance_areas" TEXT[],
    "specific_challenges" TEXT,
    "current_stage" "StartupStage",
    "preferred_mentor_bg" TEXT[],
    "expertise_areas" TEXT[],
    "years_experience" INTEGER,
    "industries_served" TEXT[],
    "success_stories" TEXT,
    "mentees_criteria" TEXT,
    "preferred_engage" "EngagementType",
    "session_frequency" TEXT,
    "compensation_exp" "MentorCompensation" NOT NULL DEFAULT 'FREE',
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "mentor_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_proposals" (
    "id" TEXT NOT NULL,
    "hiring_or_seeking" "TeamDirection" NOT NULL,
    "role_title" VARCHAR(100) NOT NULL,
    "department" VARCHAR(50),
    "seniority_level" "SeniorityLevel",
    "must_have_skills" TEXT[],
    "nice_to_have_skills" TEXT[],
    "certifications" TEXT[],
    "languages_required" TEXT[],
    "work_arrangement" "WorkArrangement" NOT NULL DEFAULT 'HYBRID',
    "compensation_type" "CompensationType",
    "salary_range" JSONB,
    "benefits" TEXT[],
    "company_size" "CompanySize",
    "company_stage" "StartupStage",
    "team_culture" TEXT,
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "team_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cofounder_proposals" (
    "id" TEXT NOT NULL,
    "seeking_or_offering" "CofounderDirection" NOT NULL,
    "role_title" VARCHAR(100) NOT NULL,
    "key_responsibilities" TEXT[],
    "decision_areas" TEXT[],
    "equity_offered" DOUBLE PRECISION,
    "equity_expected" DOUBLE PRECISION,
    "vesting_schedule" TEXT,
    "time_commitment" TEXT NOT NULL,
    "required_skills" TEXT[],
    "preferred_background" TEXT[],
    "must_have_experience" TEXT[],
    "personality_traits" TEXT[],
    "business_stage" "StartupStage",
    "current_team_size" INTEGER,
    "business_model" TEXT,
    "target_market" TEXT,
    "work_style" TEXT,
    "company_values" TEXT[],
    "conflict_resolution" TEXT,
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "cofounder_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_proposals" (
    "id" TEXT NOT NULL,
    "seeking_or_offering" "PartnerDirection" NOT NULL,
    "partnership_type" "PartnershipType" NOT NULL,
    "value_offered" TEXT NOT NULL,
    "value_expected" TEXT NOT NULL,
    "mutual_benefits" TEXT[],
    "partnership_model" "PartnershipModel",
    "revenue_sharing" DOUBLE PRECISION,
    "exclusivity" "ExclusivityType" NOT NULL DEFAULT 'NON_EXCLUSIVE',
    "partnership_duration" "PartnershipDuration",
    "partner_criteria" TEXT,
    "minimum_requirements" TEXT[],
    "ideal_partner_profile" TEXT,
    "current_partners" INTEGER,
    "market_reach" TEXT[],
    "customer_base" INTEGER,
    "annual_revenue" DOUBLE PRECISION,
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "partner_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_proposals" (
    "id" TEXT NOT NULL,
    "selling_or_buying" "CustomerDirection" NOT NULL,
    "product_service" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100),
    "description" TEXT NOT NULL,
    "pricing_model" "PricingModel",
    "price_range" JSONB,
    "availability" "Availability",
    "delivery_time" TEXT,
    "target_audience" TEXT,
    "customer_benefits" TEXT[],
    "unique_selling_prop" TEXT,
    "requirements" TEXT[],
    "budget_range" JSONB,
    "decision_criteria" TEXT[],
    "timeframe" TEXT,
    "market_size" TEXT,
    "competitors" TEXT[],
    "previous_clients" INTEGER,
    "testimonials" TEXT,
    "support_included" TEXT[],
    "warranty_terms" TEXT,
    "payment_terms" VARCHAR(100),
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "customer_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "plan_type" "PlanType" NOT NULL,
    "billing_period" "BillingPeriod" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "cappedAmount" INTEGER,
    "creditAmount" INTEGER,
    "stripe_price_id" TEXT,
    "paypal_plan_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "sub_id" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "cancelReason" TEXT,
    "canceled_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "trial_start" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "package_type" "PackageType" NOT NULL,
    "description" TEXT,
    "credit_amount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "bonus_credits" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "validity_days" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "order_id" TEXT,
    "credit_amount" INTEGER NOT NULL,
    "bonus_credits" INTEGER NOT NULL DEFAULT 0,
    "total_credits" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" "PurchaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3),
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "credit_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT[],
    "max_projects" INTEGER NOT NULL DEFAULT 0,
    "max_teams" INTEGER NOT NULL DEFAULT 0,
    "max_proposals" INTEGER NOT NULL DEFAULT 0,
    "max_requests" INTEGER NOT NULL DEFAULT 0,
    "max_sp_storage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_credits" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_project" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_profile" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_proposal" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_team" INTEGER NOT NULL DEFAULT 0,
    "max_rd_storage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_tokens" INTEGER NOT NULL DEFAULT 0,
    "max_rpm" INTEGER DEFAULT 0,
    "max_rpd" INTEGER DEFAULT 0,
    "max_tpm" INTEGER DEFAULT 0,
    "max_tpd" INTEGER DEFAULT 0,
    "plan_id" TEXT,
    "package_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "purchase_id" TEXT,
    "user_id" TEXT NOT NULL,
    "billingType" "BillingType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "adjustedAmount" DOUBLE PRECISION,
    "billingPeriodStart" TIMESTAMP(3),
    "billingPeriodEnd" TIMESTAMP(3),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_gateway" "PaymentGateway",
    "failure_reason" TEXT,
    "receipt_url" TEXT,
    "refundId" TEXT,
    "refundReason" TEXT,
    "intentId" TEXT,
    "chargeId" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_events" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "creditPurchaseId" TEXT,
    "type" "BillingEventType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "promotionId" TEXT,
    "discountId" TEXT,
    "status" "BillingEventStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAmount" DOUBLE PRECISION,
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromotionType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" "PromotionUnit" NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliedToAll" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" "DiscountUnit" NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliedToAll" BOOLEAN NOT NULL DEFAULT false,
    "minimumAmount" DOUBLE PRECISION,
    "maximumAmount" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_to_plan" (
    "discountId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "discount_to_plan_pkey" PRIMARY KEY ("discountId","planId")
);

-- CreateTable
CREATE TABLE "discount_to_package" (
    "discountId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "discount_to_package_pkey" PRIMARY KEY ("discountId","packageId")
);

-- CreateTable
CREATE TABLE "discount_to_user" (
    "discountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "discount_to_user_pkey" PRIMARY KEY ("discountId","userId")
);

-- CreateTable
CREATE TABLE "promotion_to_user" (
    "promotionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "promotion_to_user_pkey" PRIMARY KEY ("promotionId","userId")
);

-- CreateTable
CREATE TABLE "promotion_to_plan" (
    "promotionId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "promotion_to_plan_pkey" PRIMARY KEY ("promotionId","planId")
);

-- CreateTable
CREATE TABLE "promotion_to_package" (
    "promotionId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "promotion_to_package_pkey" PRIMARY KEY ("promotionId","packageId")
);

-- CreateTable
CREATE TABLE "usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscription_id" TEXT,
    "credit_purchase_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "max_projects" INTEGER NOT NULL DEFAULT 0,
    "remaining_projects" INTEGER NOT NULL DEFAULT 0,
    "max_teams" INTEGER NOT NULL DEFAULT 0,
    "remaining_teams" INTEGER NOT NULL DEFAULT 0,
    "max_proposals" INTEGER NOT NULL DEFAULT 0,
    "remaining_proposals" INTEGER NOT NULL DEFAULT 0,
    "max_requests" INTEGER NOT NULL DEFAULT 0,
    "remaining_requests" INTEGER NOT NULL DEFAULT 0,
    "max_sp_storage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remaining_sp_storage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_rd_storage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remaining_rd_storage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_tokens" INTEGER NOT NULL DEFAULT 0,
    "input_tokens_used" INTEGER NOT NULL DEFAULT 0,
    "output_tokens_used" INTEGER NOT NULL DEFAULT 0,
    "total_tokens_used" INTEGER NOT NULL DEFAULT 0,
    "remaining_tokens" INTEGER NOT NULL DEFAULT 0,
    "chat_requests_made)" INTEGER NOT NULL DEFAULT 0,
    "max_credits" INTEGER NOT NULL DEFAULT 0,
    "remaining_credits" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_project" INTEGER NOT NULL DEFAULT 0,
    "remaining_chats_per_project" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_profile" INTEGER NOT NULL DEFAULT 0,
    "remaining_chats_per_profile" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_proposal" INTEGER NOT NULL DEFAULT 0,
    "remaining_chats_per_proposal" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_team" INTEGER NOT NULL DEFAULT 0,
    "remaining_chats_per_team" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_quotas" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "max_projects" INTEGER NOT NULL DEFAULT 0,
    "max_teams" INTEGER NOT NULL DEFAULT 0,
    "max_proposals" INTEGER NOT NULL DEFAULT 0,
    "max_requests" INTEGER NOT NULL DEFAULT 0,
    "max_sp_storage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_rd_storage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_credits" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_project" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_profile" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_proposal" INTEGER NOT NULL DEFAULT 0,
    "max_chats_per_team" INTEGER NOT NULL DEFAULT 0,
    "max_tokens" INTEGER NOT NULL DEFAULT 0,
    "max_rpm" INTEGER DEFAULT 0,
    "max_rpd" INTEGER DEFAULT 0,
    "max_tpm" INTEGER DEFAULT 0,
    "max_tpd" INTEGER DEFAULT 0,
    "total_projects_created" INTEGER NOT NULL DEFAULT 0,
    "total_teams_created" INTEGER NOT NULL DEFAULT 0,
    "total_proposals_created" INTEGER NOT NULL DEFAULT 0,
    "total_requests_sent" INTEGER NOT NULL DEFAULT 0,
    "total_tokens_all_time" INTEGER NOT NULL DEFAULT 0,
    "total_credits_all_time" INTEGER NOT NULL DEFAULT 0,
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "last_reset_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_queue" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),

    CONSTRAINT "webhook_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "conversation_type" "ConversationType" NOT NULL DEFAULT 'GENERAL',
    "project_id" TEXT,
    "proposal_id" TEXT,
    "team_id" TEXT,
    "system_prompt" TEXT,
    "model_id" TEXT,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "total_tokens_used" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_message_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokens_used" INTEGER,
    "model" TEXT,
    "finish_reason" TEXT,
    "context_used" JSONB,
    "search_query" TEXT,
    "relevance_scores" JSONB,
    "attachments" JSONB,
    "image_urls" TEXT[],
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "is_bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "edited_at" TIMESTAMP(3),

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL,
    "name" "ModelName" NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "maxTokens" INTEGER,
    "temperature" DOUBLE PRECISION,
    "RPM" INTEGER,
    "RPD" INTEGER,
    "TPM" INTEGER,
    "TPD" INTEGER,

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vector_embeddings" (
    "id" TEXT NOT NULL,
    "source_type" "VectorSourceType" NOT NULL,
    "source_id" TEXT NOT NULL,
    "user_id" TEXT,
    "content" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" JSONB,
    "embedding_model" TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
    "dimension" INTEGER NOT NULL DEFAULT 1536,
    "chunk_index" INTEGER,
    "total_chunks" INTEGER,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "access_level" "AccessLevel" NOT NULL DEFAULT 'PRIVATE',
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vector_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_message_feedback" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER,
    "is_helpful" BOOLEAN,
    "is_accurate" BOOLEAN,
    "is_safe" BOOLEAN,
    "feedback_type" "FeedbackType",
    "comment" TEXT,
    "categories" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_message_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversation_feedback" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER,
    "was_helpful" BOOLEAN,
    "goal_achieved" BOOLEAN,
    "comment" TEXT,
    "suggestions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversation_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversation_shares" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "shared_by" TEXT NOT NULL,
    "shared_with" TEXT,
    "share_token" TEXT NOT NULL,
    "access_level" "ShareAccessLevel" NOT NULL DEFAULT 'VIEW',
    "expires_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversation_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_message_annotations" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_index" INTEGER NOT NULL,
    "end_index" INTEGER NOT NULL,
    "highlighted_text" TEXT NOT NULL,
    "note" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_message_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "action" "AiActionType" NOT NULL,
    "model" TEXT NOT NULL,
    "tokens_used" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION,
    "request_duration" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_key" ON "workspace_members"("workspace_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_proposal_id_key" ON "tasks"("proposal_id");

-- CreateIndex
CREATE INDEX "tasks_workspace_id_idx" ON "tasks"("workspace_id");

-- CreateIndex
CREATE INDEX "tasks_channel_id_idx" ON "tasks"("channel_id");

-- CreateIndex
CREATE INDEX "tasks_project_id_idx" ON "tasks"("project_id");

-- CreateIndex
CREATE INDEX "tasks_team_id_idx" ON "tasks"("team_id");

-- CreateIndex
CREATE INDEX "user_likes_target_user_id_idx" ON "user_likes"("target_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_likes_user_id_target_user_id_key" ON "user_likes"("user_id", "target_user_id");

-- CreateIndex
CREATE INDEX "user_comments_target_user_id_idx" ON "user_comments"("target_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "founder_profiles_user_id_key" ON "founder_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "investor_profiles_user_id_key" ON "investor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_profiles_user_id_key" ON "member_profiles"("user_id");

-- CreateIndex
CREATE INDEX "project_members_is_blocked_idx" ON "project_members"("is_blocked");

-- CreateIndex
CREATE INDEX "project_members_status_idx" ON "project_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_ownership_transfers_acceptance_token_key" ON "project_ownership_transfers"("acceptance_token");

-- CreateIndex
CREATE INDEX "project_ownership_transfers_project_id_idx" ON "project_ownership_transfers"("project_id");

-- CreateIndex
CREATE INDEX "project_ownership_transfers_from_owner_id_idx" ON "project_ownership_transfers"("from_owner_id");

-- CreateIndex
CREATE INDEX "project_ownership_transfers_to_owner_id_idx" ON "project_ownership_transfers"("to_owner_id");

-- CreateIndex
CREATE INDEX "project_ownership_transfers_status_idx" ON "project_ownership_transfers"("status");

-- CreateIndex
CREATE INDEX "project_blocked_members_project_id_idx" ON "project_blocked_members"("project_id");

-- CreateIndex
CREATE INDEX "project_blocked_members_user_id_idx" ON "project_blocked_members"("user_id");

-- CreateIndex
CREATE INDEX "project_blocked_members_is_active_idx" ON "project_blocked_members"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "project_blocked_members_project_id_user_id_is_active_key" ON "project_blocked_members"("project_id", "user_id", "is_active");

-- CreateIndex
CREATE INDEX "posts_user_id_idx" ON "posts"("user_id");

-- CreateIndex
CREATE INDEX "posts_project_id_idx" ON "posts"("project_id");

-- CreateIndex
CREATE INDEX "posts_team_id_idx" ON "posts"("team_id");

-- CreateIndex
CREATE INDEX "posts_created_at_idx" ON "posts"("created_at");

-- CreateIndex
CREATE INDEX "posts_visibility_created_at_idx" ON "posts"("visibility", "created_at");

-- CreateIndex
CREATE INDEX "post_likes_user_id_idx" ON "post_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_post_id_user_id_key" ON "post_likes"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "post_comments_post_id_idx" ON "post_comments"("post_id");

-- CreateIndex
CREATE INDEX "post_comments_user_id_idx" ON "post_comments"("user_id");

-- CreateIndex
CREATE INDEX "post_comments_parent_id_idx" ON "post_comments"("parent_id");

-- CreateIndex
CREATE INDEX "post_comments_created_at_idx" ON "post_comments"("created_at");

-- CreateIndex
CREATE INDEX "post_comment_votes_user_id_idx" ON "post_comment_votes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_comment_votes_comment_id_user_id_key" ON "post_comment_votes"("comment_id", "user_id");

-- CreateIndex
CREATE INDEX "post_shares_post_id_idx" ON "post_shares"("post_id");

-- CreateIndex
CREATE INDEX "post_shares_user_id_idx" ON "post_shares"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_project_id_idx" ON "activity_logs"("project_id");

-- CreateIndex
CREATE INDEX "activity_logs_team_id_idx" ON "activity_logs"("team_id");

-- CreateIndex
CREATE INDEX "activity_logs_action_category_idx" ON "activity_logs"("action", "category");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "team_likes_user_id_idx" ON "team_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_likes_team_id_user_id_key" ON "team_likes"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_teams_project_id_team_id_key" ON "project_teams"("project_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_giver_id_receiver_id_context_type_project_id_team_i_key" ON "reviews"("giver_id", "receiver_id", "context_type", "project_id", "team_id", "proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_skills_user_id_skill_id_key" ON "user_skills"("user_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_endorsements_user_skill_id_endorser_id_key" ON "skill_endorsements"("user_skill_id", "endorser_id");

-- CreateIndex
CREATE UNIQUE INDEX "interests_name_key" ON "interests"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_interests_user_id_interest_id_key" ON "user_interests"("user_id", "interest_id");

-- CreateIndex
CREATE UNIQUE INDEX "connections_requester_id_receiver_id_key" ON "connections"("requester_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_likes_user_id_project_id_key" ON "project_likes"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_likes_user_id_proposal_id_key" ON "proposal_likes"("user_id", "proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_analytics_project_id_date_key" ON "project_analytics"("project_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "proposals_user_id_idx" ON "proposals"("user_id");

-- CreateIndex
CREATE INDEX "proposals_project_id_idx" ON "proposals"("project_id");

-- CreateIndex
CREATE INDEX "proposals_team_id_idx" ON "proposals"("team_id");

-- CreateIndex
CREATE INDEX "proposals_category_intent_status_created_at_idx" ON "proposals"("category", "intent", "status", "created_at");

-- CreateIndex
CREATE INDEX "proposals_industry_idx" ON "proposals"("industry");

-- CreateIndex
CREATE INDEX "proposals_slug_idx" ON "proposals"("slug");

-- CreateIndex
CREATE INDEX "materials_owner_id_idx" ON "materials"("owner_id");

-- CreateIndex
CREATE INDEX "material_purchases_buyer_id_idx" ON "material_purchases"("buyer_id");

-- CreateIndex
CREATE INDEX "tools_owner_id_idx" ON "tools"("owner_id");

-- CreateIndex
CREATE INDEX "payouts_user_id_idx" ON "payouts"("user_id");

-- CreateIndex
CREATE INDEX "attachments_proposal_id_idx" ON "attachments"("proposal_id");

-- CreateIndex
CREATE INDEX "attachments_type_idx" ON "attachments"("type");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_proposal_id_key" ON "budgets"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "locations_proposal_id_key" ON "locations"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "timelines_proposal_id_key" ON "timelines"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_proposal_id_key" ON "contacts"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_proposals_proposal_id_key" ON "membership_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "investor_proposals_proposal_id_key" ON "investor_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_proposals_proposal_id_key" ON "mentor_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_proposals_proposal_id_key" ON "team_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "cofounder_proposals_proposal_id_key" ON "cofounder_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_proposals_proposal_id_key" ON "partner_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_proposals_proposal_id_key" ON "customer_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "plans_stripe_price_id_key" ON "plans"("stripe_price_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_paypal_plan_id_key" ON "plans"("paypal_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_sub_id_key" ON "subscriptions"("sub_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions"("plan_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_current_period_end_idx" ON "subscriptions"("current_period_end");

-- CreateIndex
CREATE UNIQUE INDEX "credit_packages_name_key" ON "credit_packages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "credit_purchases_order_id_key" ON "credit_purchases"("order_id");

-- CreateIndex
CREATE INDEX "credit_purchases_user_id_idx" ON "credit_purchases"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "features_plan_id_key" ON "features"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "features_package_id_key" ON "features"("package_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_subscription_id_key" ON "payments"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_purchase_id_key" ON "payments"("purchase_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_subscription_id_idx" ON "payments"("subscription_id");

-- CreateIndex
CREATE INDEX "payments_purchase_id_idx" ON "payments"("purchase_id");

-- CreateIndex
CREATE INDEX "billing_events_subscriptionId_idx" ON "billing_events"("subscriptionId");

-- CreateIndex
CREATE INDEX "billing_events_creditPurchaseId_idx" ON "billing_events"("creditPurchaseId");

-- CreateIndex
CREATE INDEX "billing_events_status_idx" ON "billing_events"("status");

-- CreateIndex
CREATE INDEX "billing_events_startDate_endDate_idx" ON "billing_events"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "promotion_isActive_idx" ON "promotion"("isActive");

-- CreateIndex
CREATE INDEX "promotion_validFrom_validUntil_idx" ON "promotion"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "discount_isActive_idx" ON "discount"("isActive");

-- CreateIndex
CREATE INDEX "discount_validFrom_validUntil_idx" ON "discount"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "discount_to_plan_planId_idx" ON "discount_to_plan"("planId");

-- CreateIndex
CREATE INDEX "discount_to_package_packageId_idx" ON "discount_to_package"("packageId");

-- CreateIndex
CREATE INDEX "discount_to_user_userId_idx" ON "discount_to_user"("userId");

-- CreateIndex
CREATE INDEX "promotion_to_user_userId_idx" ON "promotion_to_user"("userId");

-- CreateIndex
CREATE INDEX "promotion_to_plan_planId_idx" ON "promotion_to_plan"("planId");

-- CreateIndex
CREATE INDEX "promotion_to_package_packageId_idx" ON "promotion_to_package"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "usage_subscription_id_key" ON "usage"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "usage_credit_purchase_id_key" ON "usage"("credit_purchase_id");

-- CreateIndex
CREATE INDEX "usage_userId_idx" ON "usage"("userId");

-- CreateIndex
CREATE INDEX "usage_createdAt_idx" ON "usage"("createdAt");

-- CreateIndex
CREATE INDEX "usage_updatedAt_idx" ON "usage"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_quotas_user_id_key" ON "user_quotas"("user_id");

-- CreateIndex
CREATE INDEX "user_quotas_user_id_idx" ON "user_quotas"("user_id");

-- CreateIndex
CREATE INDEX "user_quotas_updated_at_idx" ON "user_quotas"("updated_at");

-- CreateIndex
CREATE INDEX "webhook_logs_userId_idx" ON "webhook_logs"("userId");

-- CreateIndex
CREATE INDEX "webhook_logs_topic_idx" ON "webhook_logs"("topic");

-- CreateIndex
CREATE INDEX "webhook_logs_createdAt_idx" ON "webhook_logs"("createdAt");

-- CreateIndex
CREATE INDEX "webhook_queue_status_attempts_idx" ON "webhook_queue"("status", "attempts");

-- CreateIndex
CREATE INDEX "webhook_queue_userId_idx" ON "webhook_queue"("userId");

-- CreateIndex
CREATE INDEX "webhook_queue_status_nextRetryAt_idx" ON "webhook_queue"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "webhook_queue_createdAt_idx" ON "webhook_queue"("createdAt");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_created_at_idx" ON "ai_conversations"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ai_conversations_project_id_idx" ON "ai_conversations"("project_id");

-- CreateIndex
CREATE INDEX "ai_conversations_team_id_idx" ON "ai_conversations"("team_id");

-- CreateIndex
CREATE INDEX "ai_conversations_is_active_is_archived_idx" ON "ai_conversations"("is_active", "is_archived");

-- CreateIndex
CREATE INDEX "ai_messages_conversation_id_created_at_idx" ON "ai_messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_messages_role_idx" ON "ai_messages"("role");

-- CreateIndex
CREATE UNIQUE INDEX "ai_models_name_key" ON "ai_models"("name");

-- CreateIndex
CREATE INDEX "vector_embeddings_source_type_source_id_idx" ON "vector_embeddings"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "vector_embeddings_user_id_idx" ON "vector_embeddings"("user_id");

-- CreateIndex
CREATE INDEX "vector_embeddings_content_hash_idx" ON "vector_embeddings"("content_hash");

-- CreateIndex
CREATE UNIQUE INDEX "vector_embeddings_source_type_source_id_chunk_index_key" ON "vector_embeddings"("source_type", "source_id", "chunk_index");

-- CreateIndex
CREATE INDEX "ai_message_feedback_message_id_idx" ON "ai_message_feedback"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_message_feedback_message_id_user_id_key" ON "ai_message_feedback"("message_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_conversation_feedback_conversation_id_user_id_key" ON "ai_conversation_feedback"("conversation_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_conversation_shares_share_token_key" ON "ai_conversation_shares"("share_token");

-- CreateIndex
CREATE INDEX "ai_conversation_shares_conversation_id_idx" ON "ai_conversation_shares"("conversation_id");

-- CreateIndex
CREATE INDEX "ai_conversation_shares_share_token_idx" ON "ai_conversation_shares"("share_token");

-- CreateIndex
CREATE INDEX "ai_message_annotations_message_id_idx" ON "ai_message_annotations"("message_id");

-- CreateIndex
CREATE INDEX "ai_usage_logs_user_id_created_at_idx" ON "ai_usage_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_usage_logs_conversation_id_idx" ON "ai_usage_logs"("conversation_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_likes" ADD CONSTRAINT "user_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_likes" ADD CONSTRAINT "user_likes_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_comments" ADD CONSTRAINT "user_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_comments" ADD CONSTRAINT "user_comments_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "founder_profiles" ADD CONSTRAINT "founder_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_profiles" ADD CONSTRAINT "investor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_ownership_transfers" ADD CONSTRAINT "project_ownership_transfers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_ownership_transfers" ADD CONSTRAINT "project_ownership_transfers_from_owner_id_fkey" FOREIGN KEY ("from_owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_ownership_transfers" ADD CONSTRAINT "project_ownership_transfers_to_owner_id_fkey" FOREIGN KEY ("to_owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_blocked_members" ADD CONSTRAINT "project_blocked_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_blocked_members" ADD CONSTRAINT "project_blocked_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_blocked_members" ADD CONSTRAINT "project_blocked_members_blocked_by_fkey" FOREIGN KEY ("blocked_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comment_votes" ADD CONSTRAINT "post_comment_votes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comment_votes" ADD CONSTRAINT "post_comment_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_likes" ADD CONSTRAINT "team_likes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_likes" ADD CONSTRAINT "team_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_comments" ADD CONSTRAINT "team_comments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_comments" ADD CONSTRAINT "team_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_teams" ADD CONSTRAINT "project_teams_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_teams" ADD CONSTRAINT "project_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_giver_id_fkey" FOREIGN KEY ("giver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_endorsements" ADD CONSTRAINT "skill_endorsements_endorser_id_fkey" FOREIGN KEY ("endorser_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_endorsements" ADD CONSTRAINT "skill_endorsements_user_skill_id_fkey" FOREIGN KEY ("user_skill_id") REFERENCES "user_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_likes" ADD CONSTRAINT "project_likes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_likes" ADD CONSTRAINT "project_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_comments" ADD CONSTRAINT "proposal_comments_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_comments" ADD CONSTRAINT "proposal_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_likes" ADD CONSTRAINT "proposal_likes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_likes" ADD CONSTRAINT "proposal_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_analytics" ADD CONSTRAINT "project_analytics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_purchases" ADD CONSTRAINT "material_purchases_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_purchases" ADD CONSTRAINT "material_purchases_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_verification_request_id_fkey" FOREIGN KEY ("verification_request_id") REFERENCES "verification_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timelines" ADD CONSTRAINT "timelines_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_proposals" ADD CONSTRAINT "membership_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_proposals" ADD CONSTRAINT "investor_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_proposals" ADD CONSTRAINT "mentor_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_proposals" ADD CONSTRAINT "team_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cofounder_proposals" ADD CONSTRAINT "cofounder_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_proposals" ADD CONSTRAINT "partner_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_proposals" ADD CONSTRAINT "customer_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "credit_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "credit_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "credit_purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_creditPurchaseId_fkey" FOREIGN KEY ("creditPurchaseId") REFERENCES "credit_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_plan" ADD CONSTRAINT "discount_to_plan_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_plan" ADD CONSTRAINT "discount_to_plan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_package" ADD CONSTRAINT "discount_to_package_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_package" ADD CONSTRAINT "discount_to_package_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "credit_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_user" ADD CONSTRAINT "discount_to_user_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_user" ADD CONSTRAINT "discount_to_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_user" ADD CONSTRAINT "promotion_to_user_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_user" ADD CONSTRAINT "promotion_to_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_plan" ADD CONSTRAINT "promotion_to_plan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_plan" ADD CONSTRAINT "promotion_to_plan_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_package" ADD CONSTRAINT "promotion_to_package_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "credit_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_package" ADD CONSTRAINT "promotion_to_package_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "usage_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "usage_credit_purchase_id_fkey" FOREIGN KEY ("credit_purchase_id") REFERENCES "credit_purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quotas" ADD CONSTRAINT "user_quotas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vector_embeddings" ADD CONSTRAINT "vector_embeddings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_message_feedback" ADD CONSTRAINT "ai_message_feedback_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ai_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_message_feedback" ADD CONSTRAINT "ai_message_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversation_feedback" ADD CONSTRAINT "ai_conversation_feedback_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversation_feedback" ADD CONSTRAINT "ai_conversation_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversation_shares" ADD CONSTRAINT "ai_conversation_shares_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversation_shares" ADD CONSTRAINT "ai_conversation_shares_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversation_shares" ADD CONSTRAINT "ai_conversation_shares_shared_with_fkey" FOREIGN KEY ("shared_with") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_message_annotations" ADD CONSTRAINT "ai_message_annotations_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ai_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_message_annotations" ADD CONSTRAINT "ai_message_annotations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
