import type { DogStatus } from './constants';

export type PetType = 'dog' | 'cat';

export interface DogReport {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  status: DogStatus;
  pet_type: PetType;
  description: string | null;
  photo_url: string | null;
  dog_count: number;
  created_at: string;
  updated_at: string;
  // joined
  profiles?: Profile | null;
}

export type AdoptionStatus = 'pending' | 'approved' | 'rejected';

export interface AdoptionApplication {
  id: string;
  report_id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line_id: string | null;
  address: string;
  housing_type: 'house' | 'condo' | 'apartment';
  housing_ownership: 'own' | 'rent';
  has_outdoor_space: boolean;
  num_adults: number;
  num_children: number;
  has_allergies: boolean;
  current_pets: string | null;
  past_experience: string | null;
  reason: string;
  status: AdoptionStatus;
  admin_note: string | null;
  created_at: string;
  // joined
  report?: DogReport | null;
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
