import { router } from "@/trpc/init";
import { proposalRouter } from "@/trpc/routers/proposal";
import { projectRouter } from "@/trpc/routers/project";
import { teamRouter } from "@/trpc/routers/team";
import { requestRouter } from "@/trpc/routers/request";
import { userRouter } from "@/trpc/routers/user";
import { profileRouter } from "@/trpc/routers/profile";
import { onboardingRouter } from "@/trpc/routers/onboarding";
import { notificationRouter } from "@/trpc/routers/notification";
import { postsRouter } from "@/trpc/routers/posts";
import { commentsRouter } from "@/trpc/routers/comments";
import { logsRouter } from "@/trpc/routers/logs";
import { discussionsRouter } from "@/trpc/routers/discussions";
import { billingRouter } from "@/trpc/routers/billing";
import { usageRouter } from "@/trpc/routers/usage";

export const appRouter = router({
  proposal: proposalRouter,
  project: projectRouter,
  team: teamRouter,
  request: requestRouter,
  user: userRouter,
  profile: profileRouter,
  onboarding: onboardingRouter,
  notification: notificationRouter,
  posts: postsRouter,
  comments: commentsRouter,
  logs: logsRouter,
  discussions: discussionsRouter,
  billing: billingRouter,
  usage: usageRouter,
});

export type AppRouter = typeof appRouter;


