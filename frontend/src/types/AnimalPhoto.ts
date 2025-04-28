// Based on SOFTWARE.md -> Database Design (Realtime Database)

export interface AnimalPhoto {
  id: string; // Firebase key ($photoId)
  storagePath: string; // Path in Firebase Storage (e.g., user/$uid/profiles/$profileId/...)
  createdAt: number; // Firebase timestamp (server value)
  // downloadUrl is fetched dynamically, not stored in RTDB
  // Optional: Add downloadUrl if needed frequently, but it's often better to generate it on demand
  // downloadUrl?: string;
  // Optional: Add name or caption if needed
  // name?: string;
}
