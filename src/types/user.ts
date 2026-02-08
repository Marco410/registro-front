export interface User {
  id: string;
  name: string;
  lastName?: string;
  secondLastName?: string;
  username: string;
  email: string;
  password?: string;
  phone?: string;
  roles: UserRole[];
  profileImage?: string;
  birthday?: string;
  age?: string;
  verified?: boolean;
  createdAt?: string;
}

export interface UserRole {
  id: string;
  name: string;
}

export interface AuthenticatedUser extends User {}

export interface LoginSuccessResponse {
  sessionToken: string;
  item: AuthenticatedUser;
}

export interface LoginFailureResponse {
  message: string;
}

export interface LoginResponse {
  authenticateUserWithPassword: LoginSuccessResponse | LoginFailureResponse;
}

export interface AuthenticatedItemResponse {
  authenticatedItem: AuthenticatedUser | null;
}
