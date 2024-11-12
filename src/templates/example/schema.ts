import { SchemaBase } from '../../core/interfaces/Schema';

/**
 * Propriedades que representam as variações do template. É utilizado para definir qual customização será gerada.
 */
export interface TemplateOptions {
  dataViewMode: 'pagination' | 'infinite-scroll';
}

/**
 * Junção de propriedades nativas do schema (Angular CDK) e propriedades personalizadas do template. Será o modelo final do schema.
 */
export interface TemplateSchema extends SchemaBase, TemplateOptions {}
