import { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { SolidQueryRawPluginConfig } from './config.cjs';
import { SolidQueryVisitor } from './visitor.cjs';
export declare const plugin: PluginFunction<SolidQueryRawPluginConfig, Types.ComplexPluginOutput>;
export declare const validate: PluginValidateFn<any>;
export { SolidQueryVisitor };
