import { Schema } from '@schematics/angular/component/schema';

/**
 * Propriedades do schema que representam as variações no template.
 */
export interface SchemaProps {
  pagePreference: 'pagination' | 'infinite-scroll';
}

/**
 * Junção de propriedades nativa do schema (Angular CDK) e propriedades personalizadas do template.
 */
export interface SchemaModel extends Schema, SchemaProps {}
