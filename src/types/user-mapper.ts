import { AuthenticatedUser, User, UserRole } from "./user";

export function mapAuthenticatedUserToUser(
  authenticatedUser: AuthenticatedUser,
): User {
  return {
    id: authenticatedUser.id,
    email: authenticatedUser.email,
    name: authenticatedUser.name,
    lastName: authenticatedUser.lastName,
    secondLastName: authenticatedUser.secondLastName,
    username: authenticatedUser.username,
    roles: authenticatedUser.roles as unknown as UserRole[],
    verified: authenticatedUser.verified,
    createdAt: authenticatedUser.createdAt,
  };
}
