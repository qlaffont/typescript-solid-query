import autoBind from 'auto-bind';
import { pascalCase } from 'change-case-all';
import { ClientSideBaseVisitor, DocumentMode, getConfigValue, } from '@graphql-codegen/visitor-plugin-common';
import { CustomMapperFetcher } from './fetcher-custom-mapper.js';
import { HardcodedFetchFetcher } from './fetcher-fetch-hardcoded.js';
import { FetchFetcher } from './fetcher-fetch.js';
import { GraphQLRequestClientFetcher } from './fetcher-graphql-request.js';
export class SolidQueryVisitor extends ClientSideBaseVisitor {
    constructor(schema, fragments, rawConfig, documents) {
        super(schema, fragments, rawConfig, {
            documentMode: DocumentMode.string,
            errorType: getConfigValue(rawConfig.errorType, 'unknown'),
            exposeDocument: getConfigValue(rawConfig.exposeDocument, false),
            exposeQueryKeys: getConfigValue(rawConfig.exposeQueryKeys, false),
            exposeQueryRootKeys: getConfigValue(rawConfig.exposeQueryRootKeys, false),
            exposeMutationKeys: getConfigValue(rawConfig.exposeMutationKeys, false),
            exposeFetcher: getConfigValue(rawConfig.exposeFetcher, false),
            addInfiniteQuery: getConfigValue(rawConfig.addInfiniteQuery, false),
            addSuspenseQuery: getConfigValue(rawConfig.addSuspenseQuery, false),
            solidQueryImportFrom: getConfigValue(rawConfig.solidQueryImportFrom, ''),
        });
        this.rawConfig = rawConfig;
        this.solidQueryHookIdentifiersInUse = new Set();
        this.solidQueryOptionsIdentifiersInUse = new Set();
        this._externalImportPrefix = this.config.importOperationTypesFrom
            ? `${this.config.importOperationTypesFrom}.`
            : '';
        this._documents = documents;
        this.fetcher = this.createFetcher(rawConfig.fetcher || 'fetch');
        autoBind(this);
    }
    get imports() {
        return this._imports;
    }
    createFetcher(raw) {
        if (raw === 'fetch') {
            return new FetchFetcher(this);
        }
        if (typeof raw === 'object' && 'endpoint' in raw) {
            return new HardcodedFetchFetcher(this, raw);
        }
        if (raw === 'graphql-request' || (typeof raw === 'object' && 'clientImportPath' in raw)) {
            return new GraphQLRequestClientFetcher(this, raw);
        }
        return new CustomMapperFetcher(this, raw);
    }
    get hasOperations() {
        return this._collectedOperations.length > 0;
    }
    getImports() {
        const baseImports = super.getImports();
        if (!this.hasOperations) {
            return baseImports;
        }
        const hookAndTypeImports = [
            ...Array.from(this.solidQueryHookIdentifiersInUse),
            ...Array.from(this.solidQueryOptionsIdentifiersInUse).map(identifier => `${this.config.useTypeImports ? 'type ' : ''}${identifier}`),
        ];
        const moduleName = this.config.solidQueryImportFrom
            ? this.config.solidQueryImportFrom
            : '@tanstack/solid-query';
        return [...baseImports, `import { ${hookAndTypeImports.join(', ')} } from '${moduleName}';`];
    }
    getFetcherImplementation() {
        return this.fetcher.generateFetcherImplementation();
    }
    _getHookSuffix(name, operationType) {
        if (this.config.omitOperationSuffix) {
            return '';
        }
        if (!this.config.dedupeOperationSuffix) {
            return pascalCase(operationType);
        }
        if (name.includes('Query') || name.includes('Mutation') || name.includes('Subscription')) {
            return '';
        }
        return pascalCase(operationType);
    }
    buildOperation(node, documentVariableName, operationType, operationResultType, operationVariablesTypes, hasRequiredVariables) {
        var _a, _b;
        const nodeName = (_b = (_a = node.name) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
        const suffix = this._getHookSuffix(nodeName, operationType);
        const operationName = this.convertName(nodeName, {
            suffix,
            useTypesPrefix: false,
            useTypesSuffix: false,
        });
        const generateConfig = {
            node,
            documentVariableName,
            operationResultType,
            operationVariablesTypes,
            hasRequiredVariables,
            operationName,
        };
        operationResultType = this._externalImportPrefix + operationResultType;
        operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;
        const queries = [];
        const getOutputFromQueries = () => `\n${queries.join('\n\n')}\n`;
        if (operationType === 'Query') {
            const addQuery = (generateConfig, isSuspense = false) => {
                const { hook, getKey, rootKey, document } = this.fetcher.generateQueryOutput(generateConfig, isSuspense);
                queries.push(hook);
                if (this.config.exposeDocument)
                    queries.push(document);
                if (this.config.exposeQueryKeys)
                    queries.push(getKey);
                if (this.config.exposeQueryRootKeys)
                    queries.push(rootKey);
            };
            addQuery(generateConfig);
            if (this.config.addSuspenseQuery)
                addQuery(generateConfig, true);
            if (this.config.addInfiniteQuery) {
                const addInfiniteQuery = (generateConfig, isSuspense = false) => {
                    const { hook, getKey, rootKey } = this.fetcher.generateInfiniteQueryOutput(generateConfig, isSuspense);
                    queries.push(hook);
                    if (this.config.exposeQueryKeys)
                        queries.push(getKey);
                    if (this.config.exposeQueryRootKeys)
                        queries.push(rootKey);
                };
                addInfiniteQuery(generateConfig);
                if (this.config.addSuspenseQuery) {
                    addInfiniteQuery(generateConfig, true);
                }
            }
            // The reason we're looking at the private field of the CustomMapperFetcher to see if it's a solid hook
            // is to prevent calling generateFetcherFetch for each query since all the queries won't be able to generate
            // a fetcher field anyways.
            if (this.config.exposeFetcher && !this.fetcher._isSolidHook) {
                queries.push(this.fetcher.generateFetcherFetch(generateConfig));
            }
            return getOutputFromQueries();
        }
        if (operationType === 'Mutation') {
            const { hook, getKey } = this.fetcher.generateMutationOutput(generateConfig);
            queries.push(hook);
            if (this.config.exposeMutationKeys)
                queries.push(getKey);
            if (this.config.exposeFetcher && !this.fetcher._isSolidHook) {
                queries.push(this.fetcher.generateFetcherFetch(generateConfig));
            }
            return getOutputFromQueries();
        }
        if (operationType === 'Subscription') {
            // eslint-disable-next-line no-console
            console.warn(`Plugin "typescript-solid-query" does not support GraphQL Subscriptions at the moment! Ignoring "${node.name.value}"...`);
        }
        return null;
    }
}
