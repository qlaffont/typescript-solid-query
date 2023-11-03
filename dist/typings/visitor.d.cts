import { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { ClientSideBasePluginConfig, ClientSideBaseVisitor, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { BaseSolidQueryPluginConfig, SolidQueryRawPluginConfig } from './config.cjs';
import { FetcherRenderer } from './fetcher.cjs';
export type SolidQueryPluginConfig = BaseSolidQueryPluginConfig & ClientSideBasePluginConfig;
export declare class SolidQueryVisitor extends ClientSideBaseVisitor<SolidQueryRawPluginConfig, SolidQueryPluginConfig> {
    protected rawConfig: SolidQueryRawPluginConfig;
    private _externalImportPrefix;
    fetcher: FetcherRenderer;
    solidQueryHookIdentifiersInUse: Set<string>;
    solidQueryOptionsIdentifiersInUse: Set<string>;
    constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: SolidQueryRawPluginConfig, documents: Types.DocumentFile[]);
    get imports(): Set<string>;
    private createFetcher;
    get hasOperations(): boolean;
    getImports(): string[];
    getFetcherImplementation(): string;
    private _getHookSuffix;
    protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string, hasRequiredVariables: boolean): string;
}
