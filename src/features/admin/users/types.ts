export interface AdminUserDto {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  pictureUrl: string | null;
  createdOn: string;
}

export interface AdminUsersResponse {
  content: AdminUserDto[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
