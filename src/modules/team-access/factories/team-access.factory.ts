import { makeOrganizationRepository } from "@/modules/organization/factories/organization.factory";
import { getContainer } from "@/shared/infra/container";
import { AssignmentRepository } from "../repositories/assignment.repository";
import { MembershipRepository } from "../repositories/membership.repository";
import { TeamInviteRepository } from "../repositories/team-invite.repository";
import { AssignmentService } from "../services/assignment.service";
import { MembershipService } from "../services/membership.service";

let membershipRepository: MembershipRepository | null = null;
let assignmentRepository: AssignmentRepository | null = null;
let teamInviteRepository: TeamInviteRepository | null = null;
let membershipService: MembershipService | null = null;
let assignmentService: AssignmentService | null = null;

export function makeMembershipRepository() {
  if (!membershipRepository) {
    membershipRepository = new MembershipRepository(getContainer().db);
  }
  return membershipRepository;
}

export function makeAssignmentRepository() {
  if (!assignmentRepository) {
    assignmentRepository = new AssignmentRepository(getContainer().db);
  }
  return assignmentRepository;
}

export function makeTeamInviteRepository() {
  if (!teamInviteRepository) {
    teamInviteRepository = new TeamInviteRepository(getContainer().db);
  }
  return teamInviteRepository;
}

export function makeMembershipService() {
  if (!membershipService) {
    membershipService = new MembershipService(makeMembershipRepository());
  }
  return membershipService;
}

export function makeAssignmentService() {
  if (!assignmentService) {
    assignmentService = new AssignmentService(
      makeAssignmentRepository(),
      makeOrganizationRepository(),
    );
  }
  return assignmentService;
}
