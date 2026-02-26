import type { DogStatus } from './constants';

export interface DogReport {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  status: DogStatus;
  description: string | null;
  photo_url: string | null;
  dog_count: number;
  created_at: string;
  updated_at: string;
  // joined
  profiles?: Profile | null;
}

export interface StatusUpdate {
  id: string;
  report_id: string;
  user_id: string;
  status: DogStatus;
  note: string | null;
  created_at: string;
  // joined
  profiles?: Profile | null;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}
