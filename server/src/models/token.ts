// src/models/token.ts
export interface AuthToken {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  lastUsedAt: string | null;
  isActive: boolean;
}
