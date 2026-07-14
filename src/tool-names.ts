// Auto-generated at build time
export const toolNames: Array<{ name: string; description: string }>= [
  {
    "name": "get-tx-reference",
    "description": "Get Cloudinary transformation rules documentation from official docs\n\n🚨 WHEN TO USE:\n- MANDATORY before creating, modifying, or discussing Cloudinary transformations\n- REQUIRED when user asks for image/video effects, resizing, cropping, filters, etc.\n- NOT needed for simple asset management (upload, list, delete, etc.)\n- ⚠️ CALL ONLY ONCE per session - documentation doesn't change, reuse the knowledge\n\n🚨 STRICT REQUIREMENTS (when transformations are involved):\n- MUST call this tool BEFORE any transformation-related task (but only once)\n- MUST read and understand the returned documentation\n- DO NOT attempt transformations without consulting this reference\n- DO NOT make up transformation parameters\n- DO NOT guess syntax - only use documented parameters\n- DO NOT call this tool multiple times - the docs are static, remember them\n\nThis tool returns the complete, authoritative Cloudinary transformation reference that contains all valid parameters, syntax rules, and best practices."
  },
  {
    "name": "transform-asset",
    "description": "Generate derived transformations for existing assets using Cloudinary's explicit API with eager transformations\n\n⚠️ CRITICAL PREREQUISITES:\n1. MUST call get-tx-reference tool first\n2. MUST validate transformation syntax against official docs\n3. MUST use only documented parameters from the reference\n4. MUST follow proper URL component structure (slashes between components, commas within)\n\n📋 VALIDATION CHECKLIST:\n- ✅ Called get-tx-reference tool\n- ✅ Verified all parameters exist in official docs\n- ✅ Used correct syntax (e.g., f_auto/q_auto not f_auto,q_auto)\n- ✅ Applied proper component chaining rules\n- ✅ Included crop mode when using width/height\n\nThis tool creates actual derived assets on Cloudinary using the explicit API."
  }
];
