// Based on SOFTWARE.md -> Database Design (Realtime Database)

export interface AnimalPhoto {
  id: string; // The unique key ($photoId) from Firebase RTDB
  storagePath: string; // Path in Firebase Storage (e.g., user/$uid/profiles/$profileId/...) 
  createdAt: number; // Stored as Unix timestamp (milliseconds)
  // Optional: Add downloadUrl if needed frequently, but it's often better to generate it on demand
  // downloadUrl?: string; 
  // Optional: Add name or caption if needed
  // name?: string;
} 