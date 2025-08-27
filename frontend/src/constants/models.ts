// Model type constants
export const MODEL_TYPES = {
  OPENAI: "openai",
  GOOGLE_IMAGEN: "google_imagen",
} as const;

// Model definitions
export const MODELS = {
  OPENAI: {
    "gpt-image-1": MODEL_TYPES.OPENAI,
  },
  GOOGLE_IMAGEN: {
    "imagen-4.0-fast-generate-001": MODEL_TYPES.GOOGLE_IMAGEN,
    "imagen-4.0-generate-001": MODEL_TYPES.GOOGLE_IMAGEN,
    "imagen-3.0-fast-generate-001": MODEL_TYPES.GOOGLE_IMAGEN,
    "imagen-3.0-generate-001": MODEL_TYPES.GOOGLE_IMAGEN,
  },
} as const;

// Frontend model options for the UI
export const MODEL_OPTIONS: { value: string; label: string }[] = [
  { value: "gpt-image-1", label: "OpenAI Image" },
  { value: "imagen-4.0-fast-generate-001", label: "Google Imagen 4" },
];

/**
 * Determines the model type based on the model name
 * @param {string} modelName - The name of the model to check
 * @return {string | null} The model type or null if unknown
 */
export function getModelType(modelName: string): string | null {
  // Check OpenAI models
  if (MODELS.OPENAI[modelName as keyof typeof MODELS.OPENAI]) {
    return MODEL_TYPES.OPENAI;
  }

  // Check Google Imagen models
  if (MODELS.GOOGLE_IMAGEN[modelName as keyof typeof MODELS.GOOGLE_IMAGEN]) {
    return MODEL_TYPES.GOOGLE_IMAGEN;
  }

  // Fallback: check if it starts with "imagen-" (for future Google models)
  if (modelName.startsWith("imagen-")) {
    return MODEL_TYPES.GOOGLE_IMAGEN;
  }

  // Fallback: check if it starts with "gpt-" (for future OpenAI models)
  if (modelName.startsWith("gpt-")) {
    return MODEL_TYPES.OPENAI;
  }

  return null;
}
