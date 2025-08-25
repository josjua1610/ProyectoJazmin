export const API = "http://localhost:8000/api";
export const headersJson = { Accept: "application/json", "Content-Type": "application/json" };

// IDs por defecto mientras no tengas selects de catálogos en el UI.
// Asegúrate de haber creado en la BD: type=1, brand=1, size=1, color=1.
export const DEFAULTS = {
  type_id: 1,
  brand_id: 1,
  size_id: 1,
  color_id: 1,
  gender: "unisex",
};
