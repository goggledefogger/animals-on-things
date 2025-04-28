// Based on SOFTWARE.md -> Database Design (Realtime Database)

export interface AnimalProfile {
  id: string; // Firebase key
  name: string;
  createdAt: number; // Firebase timestamp (server value)
  // Optionally add a field for a primary photo URL later
  // primaryPhotoUrl?: string;
  // photos?: { [photoId: string]: AnimalPhoto }; // Optional: Might add later if needed directly here
}
