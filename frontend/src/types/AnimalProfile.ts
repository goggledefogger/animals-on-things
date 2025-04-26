// Based on SOFTWARE.md -> Database Design (Realtime Database)

export interface AnimalProfile {
  id: string; // The unique key ($profileId) from Firebase RTDB
  name: string;
  createdAt: number; // Stored as Unix timestamp (milliseconds)
  // photos?: { [photoId: string]: AnimalPhoto }; // Optional: Might add later if needed directly here
} 