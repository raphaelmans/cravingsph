import { TeamInviteForm } from "@/features/auth";

export const metadata = {
  title: "Team Invitation",
  description: "Accept a team invitation to join an organization",
};

type TeamInvitePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TeamInvitePage({
  searchParams,
}: TeamInvitePageProps) {
  const queryParams = await searchParams;
  const token = Array.isArray(queryParams.token)
    ? queryParams.token[0]
    : queryParams.token;

  return <TeamInviteForm token={token} />;
}
