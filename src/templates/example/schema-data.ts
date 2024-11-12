import { TemplateOptions } from './schema';

/**
 * Mapeia todas os valores possíveis (personalizações) do template.
 */
export type TemplateCustomizations = TemplateOptions[keyof TemplateOptions];
