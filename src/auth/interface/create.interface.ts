export interface CreateUserObject {
  email: string;
  hashedPassword: string;
  isEmailVerified: boolean;
  firstName: string;
  lastName: string;
}
