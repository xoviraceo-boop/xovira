-- CreateEnum
CREATE TYPE "public"."AttachmentType" AS ENUM ('DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'LINK', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'MEMBERS_ONLY');

-- CreateEnum
CREATE TYPE "public"."Urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."ContactMethod" AS ENUM ('EMAIL', 'PHONE', 'LINKEDIN', 'TELEGRAM', 'DISCORD');

-- CreateEnum
CREATE TYPE "public"."InvestorKind" AS ENUM ('ANGEL', 'VC', 'STRATEGIC', 'CROWDFUNDING', 'GOVERNMENT', 'FAMILY_OFFICE');

-- CreateEnum
CREATE TYPE "public"."MentorDirection" AS ENUM ('SEEKING_MENTOR', 'OFFERING_MENTORSHIP');

-- CreateEnum
CREATE TYPE "public"."MentorCompensation" AS ENUM ('FREE', 'EQUITY', 'ADVISORY_SHARES', 'PAID', 'BARTER');

-- CreateEnum
CREATE TYPE "public"."TeamDirection" AS ENUM ('HIRING', 'SEEKING_POSITION');

-- CreateEnum
CREATE TYPE "public"."WorkArrangement" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."SeniorityLevel" AS ENUM ('INTERN', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'PRINCIPAL', 'DIRECTOR', 'VP', 'C_LEVEL');

-- CreateEnum
CREATE TYPE "public"."CompanySize" AS ENUM ('STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000', 'ENTERPRISE_1000_PLUS');

-- CreateEnum
CREATE TYPE "public"."CofounderDirection" AS ENUM ('SEEKING_COFOUNDER', 'OFFERING_COFOUNDING');

-- CreateEnum
CREATE TYPE "public"."PartnerDirection" AS ENUM ('SEEKING_PARTNER', 'OFFERING_PARTNERSHIP');

-- CreateEnum
CREATE TYPE "public"."PartnershipModel" AS ENUM ('REVENUE_SHARE', 'FIXED_FEE', 'COMMISSION_BASED', 'EQUITY_BASED', 'BARTER', 'JOINT_VENTURE');

-- CreateEnum
CREATE TYPE "public"."ExclusivityType" AS ENUM ('EXCLUSIVE', 'NON_EXCLUSIVE', 'SEMI_EXCLUSIVE');

-- CreateEnum
CREATE TYPE "public"."CustomerDirection" AS ENUM ('SELLING', 'BUYING');

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('FOUNDER', 'INVESTOR', 'MEMBER', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."VerificationLevel" AS ENUM ('UNVERIFIED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'IDENTITY_VERIFIED', 'BUSINESS_VERIFIED', 'PREMIUM_VERIFIED');

-- CreateEnum
CREATE TYPE "public"."InvestorType" AS ENUM ('ANGEL', 'VC_FUND', 'FAMILY_OFFICE', 'CORPORATE_VC', 'CROWDFUNDING', 'GOVERNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Commitment" AS ENUM ('PART_TIME', 'FULL_TIME', 'CONTRACT', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "public"."FundingType" AS ENUM ('EQUITY', 'DEBT', 'GRANT', 'SAFE', 'CONVERTIBLE_NOTE', 'REVENUE_SHARE');

-- CreateEnum
CREATE TYPE "public"."StartupStage" AS ENUM ('IDEA', 'MVP', 'BETA', 'LAUNCHED', 'GROWTH', 'SCALE');

-- CreateEnum
CREATE TYPE "public"."EngagementType" AS ENUM ('ONE_OFF', 'ONGOING', 'MENTORSHIP', 'CONSULTING');

-- CreateEnum
CREATE TYPE "public"."PartnershipType" AS ENUM ('STRATEGIC', 'TECHNOLOGY', 'DISTRIBUTION', 'MARKETING', 'JOINT_VENTURE');

-- CreateEnum
CREATE TYPE "public"."PartnershipDuration" AS ENUM ('SHORT_TERM', 'MID_TERM', 'LONG_TERM');

-- CreateEnum
CREATE TYPE "public"."PricingModel" AS ENUM ('FIXED', 'HOURLY', 'SUBSCRIPTION', 'TIERED', 'USAGE_BASED');

-- CreateEnum
CREATE TYPE "public"."Availability" AS ENUM ('IMMEDIATE', 'WITHIN_WEEK', 'WITHIN_MONTH', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "public"."ProjectStage" AS ENUM ('IDEA', 'MVP', 'BETA', 'LAUNCHED', 'GROWTH', 'SCALE', 'EXIT');

-- CreateEnum
CREATE TYPE "public"."TeamType" AS ENUM ('DEVELOPMENT', 'MARKETING', 'SALES', 'DESIGN', 'ADVISORY', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."CompensationType" AS ENUM ('CASH_ONLY', 'EQUITY_ONLY', 'CASH_AND_EQUITY', 'DEFERRED_CASH', 'PROFIT_SHARING', 'HOURLY_RATE', 'PROJECT_BASED', 'REVENUE_SHARE');

-- CreateEnum
CREATE TYPE "public"."MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "public"."AvailabilityType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'CONSULTANT', 'INTERN');

-- CreateEnum
CREATE TYPE "public"."RemotePreference" AS ENUM ('REMOTE_ONLY', 'HYBRID', 'ON_SITE', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "public"."InvestmentType" AS ENUM ('EQUITY', 'CONVERTIBLE_NOTE', 'SAFE', 'DEBT', 'REVENUE_SHARE', 'GRANT');

-- CreateEnum
CREATE TYPE "public"."InvestmentStatus" AS ENUM ('PROPOSED', 'UNDER_REVIEW', 'DUE_DILIGENCE', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."InvestmentStage" AS ENUM ('INITIAL', 'SERIES_A', 'SERIES_B', 'SERIES_C', 'BRIDGE', 'MEZZANINE');

-- CreateEnum
CREATE TYPE "public"."ProposalType" AS ENUM ('INVESTOR', 'MENTOR', 'TEAM', 'COFOUNDER', 'PARTNER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."ProposalStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."TeamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ApplicationTargetType" AS ENUM ('PROJECT', 'TEAM', 'INVESTMENT', 'COLLABORATION');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."ReviewContextType" AS ENUM ('PROJECT', 'TEAM', 'INVESTMENT', 'GENERAL', 'PROPOSAL');

-- CreateEnum
CREATE TYPE "public"."VerificationType" AS ENUM ('IDENTITY', 'EDUCATION', 'WORK_EXPERIENCE', 'COMPANY', 'INVESTOR_ACCREDITATION', 'TECHNICAL_SKILLS');

-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('APPLICATION_RECEIVED', 'APPLICATION_STATUS', 'INVITATION_RECEIVED', 'INVITATION_STATUS', 'MESSAGE_RECEIVED', 'CONNECTION_REQUEST', 'PROJECT_UPDATE', 'INVESTMENT_UPDATE', 'MILESTONE_COMPLETED', 'TEAM_INVITATION', 'REVIEW_RECEIVED', 'VERIFICATION_STATUS', 'SYSTEM_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "public"."ProfileVisibility" AS ENUM ('PUBLIC', 'CONNECTIONS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'PROJECT_CREATE', 'PROJECT_UPDATE', 'APPLICATION_SEND', 'INVESTMENT_PROPOSE', 'MESSAGE_SEND', 'CONNECTION_REQUEST', 'REVIEW_GIVE');

-- CreateEnum
CREATE TYPE "public"."Permission" AS ENUM ('VIEW_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT', 'MANAGE_MEMBERS', 'MANAGE_FINANCES', 'MANAGE_INVESTORS', 'VIEW_ANALYTICS', 'EDIT_PROFILE', 'MANAGE_APPLICATIONS', 'MANAGE_INVITATIONS', 'CREATE_UPDATES', 'MANAGE_MILESTONES', 'ADMIN_ACCESS');

-- CreateTable
CREATE TABLE "public"."accounts" (
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
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
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
    "user_type" "public"."UserType" NOT NULL DEFAULT 'FOUNDER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_step" INTEGER NOT NULL DEFAULT 0,
    "credibility_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verification_level" "public"."VerificationLevel" NOT NULL DEFAULT 'UNVERIFIED',
    "is_kyc_verified" BOOLEAN NOT NULL DEFAULT false,
    "kyc_documents" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_active_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."founder_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_experience" INTEGER,
    "previous_exits" TEXT[],
    "linkedin_profile" TEXT,
    "industry_preferences" TEXT[],
    "location_preferences" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "founder_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."investor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "investor_type" "public"."InvestorType" NOT NULL,
    "firm_name" TEXT,
    "investment_range" TEXT,
    "min_investment" DOUBLE PRECISION,
    "max_investment" DOUBLE PRECISION,
    "preferred_stages" "public"."ProjectStage"[],
    "preferred_industries" TEXT[],
    "geographic_focus" TEXT[],
    "investment_thesis" TEXT,
    "value_add_services" TEXT[],
    "portfolio_size" INTEGER DEFAULT 0,
    "successful_exits" INTEGER DEFAULT 0,
    "average_check_size" DOUBLE PRECISION,
    "is_accredited" BOOLEAN NOT NULL DEFAULT false,
    "accreditation_proof" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_title" TEXT,
    "experience" INTEGER,
    "current_salary" DOUBLE PRECISION,
    "salary_expectation" DOUBLE PRECISION,
    "availability_type" "public"."AvailabilityType" NOT NULL DEFAULT 'FULL_TIME',
    "hours_per_week" INTEGER,
    "start_date" TIMESTAMP(3),
    "accepts_equity" BOOLEAN NOT NULL DEFAULT true,
    "accepts_cash" BOOLEAN NOT NULL DEFAULT true,
    "accepts_deferred" BOOLEAN NOT NULL DEFAULT false,
    "min_equity_percentage" DOUBLE PRECISION,
    "remote_preference" "public"."RemotePreference" NOT NULL DEFAULT 'HYBRID',
    "role_preferences" TEXT[],
    "industry_preferences" TEXT[],
    "portfolio_url" TEXT,
    "linkedin_url" TEXT,
    "github_url" TEXT,
    "achievements" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tagline" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "stage" "public"."ProjectStage" NOT NULL,
    "industry" TEXT[],
    "tags" TEXT[],
    "revenue_model" TEXT[],
    "target_market" TEXT NOT NULL,
    "competitive_edge" TEXT,
    "funding_goal" DOUBLE PRECISION,
    "funding_raised" DOUBLE PRECISION DEFAULT 0,
    "valuation_cap" DOUBLE PRECISION,
    "team_size" INTEGER NOT NULL DEFAULT 1,
    "is_hiring" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "is_remote_friendly" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "launched_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "title" TEXT,
    "permissions" "public"."Permission"[],
    "is_cofounder" BOOLEAN NOT NULL DEFAULT false,
    "is_investor" BOOLEAN NOT NULL DEFAULT false,
    "is_member" BOOLEAN NOT NULL DEFAULT false,
    "compensation_type" "public"."CompensationType" NOT NULL,
    "salary_amount" DOUBLE PRECISION,
    "equity_percentage" DOUBLE PRECISION,
    "profit_share_percent" DOUBLE PRECISION,
    "status" "public"."MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teams" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "avatar" TEXT,
    "teamType" "public"."TeamType" NOT NULL,
    "industry" TEXT[],
    "skills" TEXT[],
    "status" "public"."TeamStatus" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_hiring" BOOLEAN NOT NULL DEFAULT false,
    "size" INTEGER NOT NULL DEFAULT 1,
    "max_size" INTEGER,
    "location" TEXT,
    "is_remote" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "title" TEXT,
    "status" "public"."MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "permissions" "public"."Permission"[],
    "compensation_type" "public"."CompensationType",
    "salary_amount" DOUBLE PRECISION,
    "equity_percentage" DOUBLE PRECISION,
    "hourly_rate" DOUBLE PRECISION,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_teams" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."investments" (
    "id" TEXT NOT NULL,
    "investor_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "investment_type" "public"."InvestmentType" NOT NULL,
    "equity_percent" DOUBLE PRECISION,
    "valuation" DOUBLE PRECISION,
    "liquidation_pref" DOUBLE PRECISION DEFAULT 1,
    "antidilution" BOOLEAN NOT NULL DEFAULT false,
    "board_seat" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."InvestmentStatus" NOT NULL DEFAULT 'PROPOSED',
    "stage" "public"."InvestmentStage" NOT NULL DEFAULT 'INITIAL',
    "due_diligence_completed" BOOLEAN NOT NULL DEFAULT false,
    "legal_docs_complete" BOOLEAN NOT NULL DEFAULT false,
    "proposed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "target_type" "public"."ApplicationTargetType" NOT NULL,
    "project_id" TEXT,
    "team_id" TEXT,
    "proposal_id" TEXT,
    "role_applied" "public"."ProposalType",
    "role" TEXT,
    "message" TEXT NOT NULL,
    "proposed_terms" JSONB,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "target_type" "public"."ApplicationTargetType" NOT NULL,
    "project_id" TEXT,
    "team_id" TEXT,
    "role" TEXT,
    "message" TEXT NOT NULL,
    "terms" JSONB,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3),
    "response" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "giver_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "context_type" "public"."ReviewContextType" NOT NULL,
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
CREATE TABLE "public"."verification_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."VerificationType" NOT NULL,
    "linkedin_profile" TEXT,
    "website_url" TEXT,
    "company_email" TEXT,
    "status" "public"."VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_skills" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "proficiency" "public"."ProficiencyLevel" NOT NULL,
    "years_of_exp" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."skill_endorsements" (
    "id" TEXT NOT NULL,
    "user_skill_id" TEXT NOT NULL,
    "endorser_id" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_endorsements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_interests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "interest_id" TEXT NOT NULL,

    CONSTRAINT "user_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."connections" (
    "id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status" "public"."ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "attachments" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proposal_comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proposal_likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
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
CREATE TABLE "public"."user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile_visibility" "public"."ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "show_email" BOOLEAN NOT NULL DEFAULT false,
    "show_phone" BOOLEAN NOT NULL DEFAULT false,
    "allow_messages" BOOLEAN NOT NULL DEFAULT true,
    "allow_connections" BOOLEAN NOT NULL DEFAULT true,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "new_application_email" BOOLEAN NOT NULL DEFAULT true,
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

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "public"."ActivityType" NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_analytics" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "unique_views" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "application_count" INTEGER NOT NULL DEFAULT 0,
    "accepted_apps" INTEGER NOT NULL DEFAULT 0,
    "investment_requests" INTEGER NOT NULL DEFAULT 0,
    "total_funding" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."proposals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdBy" VARCHAR(255) NOT NULL,
    "category" "public"."ProposalType" NOT NULL,
    "project_id" TEXT,
    "team_id" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "shortSummary" VARCHAR(500) NOT NULL,
    "detailedDesc" TEXT NOT NULL,
    "industry" TEXT[],
    "keywords" TEXT[],
    "status" "public"."ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "public"."Visibility" NOT NULL DEFAULT 'PUBLIC',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "slug" TEXT NOT NULL,
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

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attachments" (
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
    "type" "public"."AttachmentType" NOT NULL,
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
CREATE TABLE "public"."budgets" (
    "id" TEXT NOT NULL,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
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
CREATE TABLE "public"."timelines" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "duration" TEXT,
    "commitment" "public"."Commitment" NOT NULL,
    "availability" TEXT,
    "urgency" "public"."Urgency" NOT NULL DEFAULT 'MEDIUM',
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contacts" (
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
    "preferred_contact" "public"."ContactMethod" NOT NULL DEFAULT 'EMAIL',
    "public_profile" BOOLEAN NOT NULL DEFAULT true,
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."investor_proposals" (
    "id" TEXT NOT NULL,
    "funding_needed" DOUBLE PRECISION,
    "funding_type" "public"."FundingType",
    "startup_stage" "public"."StartupStage",
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
    "investor_kind" "public"."InvestorKind"[],
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "investor_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mentor_proposals" (
    "id" TEXT NOT NULL,
    "seeking_or_offering" "public"."MentorDirection" NOT NULL,
    "guidance_areas" TEXT[],
    "specific_challenges" TEXT,
    "current_stage" "public"."StartupStage",
    "preferred_mentor_bg" TEXT[],
    "expertise_areas" TEXT[],
    "years_experience" INTEGER,
    "industries_served" TEXT[],
    "success_stories" TEXT,
    "mentees_criteria" TEXT,
    "preferred_engage" "public"."EngagementType",
    "session_frequency" TEXT,
    "compensation_exp" "public"."MentorCompensation" NOT NULL DEFAULT 'FREE',
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "mentor_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_proposals" (
    "id" TEXT NOT NULL,
    "hiring_or_seeking" "public"."TeamDirection" NOT NULL,
    "role_title" VARCHAR(100) NOT NULL,
    "department" VARCHAR(50),
    "seniority_level" "public"."SeniorityLevel",
    "must_have_skills" TEXT[],
    "nice_to_have_skills" TEXT[],
    "certifications" TEXT[],
    "languages_required" TEXT[],
    "work_arrangement" "public"."WorkArrangement" NOT NULL DEFAULT 'HYBRID',
    "compensation_type" "public"."CompensationType",
    "salary_range" JSONB,
    "benefits" TEXT[],
    "company_size" "public"."CompanySize",
    "company_stage" "public"."StartupStage",
    "team_culture" TEXT,
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "team_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cofounder_proposals" (
    "id" TEXT NOT NULL,
    "seeking_or_offering" "public"."CofounderDirection" NOT NULL,
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
    "business_stage" "public"."StartupStage",
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
CREATE TABLE "public"."partner_proposals" (
    "id" TEXT NOT NULL,
    "seeking_or_offering" "public"."PartnerDirection" NOT NULL,
    "partnership_type" "public"."PartnershipType" NOT NULL,
    "value_offered" TEXT NOT NULL,
    "value_expected" TEXT NOT NULL,
    "mutual_benefits" TEXT[],
    "partnership_model" "public"."PartnershipModel",
    "revenue_sharing" DOUBLE PRECISION,
    "exclusivity" "public"."ExclusivityType" NOT NULL DEFAULT 'NON_EXCLUSIVE',
    "partnership_duration" "public"."PartnershipDuration",
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
CREATE TABLE "public"."customer_proposals" (
    "id" TEXT NOT NULL,
    "selling_or_buying" "public"."CustomerDirection" NOT NULL,
    "product_service" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100),
    "description" TEXT NOT NULL,
    "pricing_model" "public"."PricingModel",
    "price_range" JSONB,
    "availability" "public"."Availability",
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

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "public"."accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "public"."sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "founder_profiles_user_id_key" ON "public"."founder_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "investor_profiles_user_id_key" ON "public"."investor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_profiles_user_id_key" ON "public"."member_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "public"."project_members"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "public"."team_members"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_teams_project_id_team_id_key" ON "public"."project_teams"("project_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_giver_id_receiver_id_context_type_project_id_team_i_key" ON "public"."reviews"("giver_id", "receiver_id", "context_type", "project_id", "team_id", "proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "public"."skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_skills_user_id_skill_id_key" ON "public"."user_skills"("user_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_endorsements_user_skill_id_endorser_id_key" ON "public"."skill_endorsements"("user_skill_id", "endorser_id");

-- CreateIndex
CREATE UNIQUE INDEX "interests_name_key" ON "public"."interests"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_interests_user_id_interest_id_key" ON "public"."user_interests"("user_id", "interest_id");

-- CreateIndex
CREATE UNIQUE INDEX "connections_requester_id_receiver_id_key" ON "public"."connections"("requester_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_likes_user_id_project_id_key" ON "public"."project_likes"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_likes_user_id_proposal_id_key" ON "public"."proposal_likes"("user_id", "proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "public"."user_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_analytics_project_id_date_key" ON "public"."project_analytics"("project_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_slug_key" ON "public"."proposals"("slug");

-- CreateIndex
CREATE INDEX "proposals_user_id_idx" ON "public"."proposals"("user_id");

-- CreateIndex
CREATE INDEX "proposals_project_id_idx" ON "public"."proposals"("project_id");

-- CreateIndex
CREATE INDEX "proposals_team_id_idx" ON "public"."proposals"("team_id");

-- CreateIndex
CREATE INDEX "proposals_category_status_created_at_idx" ON "public"."proposals"("category", "status", "created_at");

-- CreateIndex
CREATE INDEX "proposals_industry_idx" ON "public"."proposals"("industry");

-- CreateIndex
CREATE INDEX "proposals_slug_idx" ON "public"."proposals"("slug");

-- CreateIndex
CREATE INDEX "attachments_proposal_id_idx" ON "public"."attachments"("proposal_id");

-- CreateIndex
CREATE INDEX "attachments_type_idx" ON "public"."attachments"("type");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_proposal_id_key" ON "public"."budgets"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "locations_proposal_id_key" ON "public"."locations"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "timelines_proposal_id_key" ON "public"."timelines"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_proposal_id_key" ON "public"."contacts"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "investor_proposals_proposal_id_key" ON "public"."investor_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_proposals_proposal_id_key" ON "public"."mentor_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_proposals_proposal_id_key" ON "public"."team_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "cofounder_proposals_proposal_id_key" ON "public"."cofounder_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_proposals_proposal_id_key" ON "public"."partner_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_proposals_proposal_id_key" ON "public"."customer_proposals"("proposal_id");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."founder_profiles" ADD CONSTRAINT "founder_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."investor_profiles" ADD CONSTRAINT "investor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_profiles" ADD CONSTRAINT "member_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_teams" ADD CONSTRAINT "project_teams_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_teams" ADD CONSTRAINT "project_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."investments" ADD CONSTRAINT "investments_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."investments" ADD CONSTRAINT "investments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_giver_id_fkey" FOREIGN KEY ("giver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_endorsements" ADD CONSTRAINT "skill_endorsements_user_skill_id_fkey" FOREIGN KEY ("user_skill_id") REFERENCES "public"."user_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_endorsements" ADD CONSTRAINT "skill_endorsements_endorser_id_fkey" FOREIGN KEY ("endorser_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_interests" ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_interests" ADD CONSTRAINT "user_interests_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "public"."interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connections" ADD CONSTRAINT "connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connections" ADD CONSTRAINT "connections_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_likes" ADD CONSTRAINT "project_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_likes" ADD CONSTRAINT "project_likes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_comments" ADD CONSTRAINT "project_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_comments" ADD CONSTRAINT "project_comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposal_comments" ADD CONSTRAINT "proposal_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposal_comments" ADD CONSTRAINT "proposal_comments_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposal_likes" ADD CONSTRAINT "proposal_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposal_likes" ADD CONSTRAINT "proposal_likes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_analytics" ADD CONSTRAINT "project_analytics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposals" ADD CONSTRAINT "proposals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposals" ADD CONSTRAINT "proposals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachments" ADD CONSTRAINT "attachments_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachments" ADD CONSTRAINT "attachments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachments" ADD CONSTRAINT "attachments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachments" ADD CONSTRAINT "attachments_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "public"."investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachments" ADD CONSTRAINT "attachments_verification_request_id_fkey" FOREIGN KEY ("verification_request_id") REFERENCES "public"."verification_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budgets" ADD CONSTRAINT "budgets_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."timelines" ADD CONSTRAINT "timelines_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."investor_proposals" ADD CONSTRAINT "investor_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mentor_proposals" ADD CONSTRAINT "mentor_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_proposals" ADD CONSTRAINT "team_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cofounder_proposals" ADD CONSTRAINT "cofounder_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_proposals" ADD CONSTRAINT "partner_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_proposals" ADD CONSTRAINT "customer_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
