export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    role: string;
    first_name?: string;
    last_name?: string;
  };
}
