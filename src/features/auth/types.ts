export interface UserMeDto {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  pictureUrl: string | null;
  roles: UserRole[];
}

export type UserRole = 'USER' | 'ADMIN';
