import autoBind from 'auto-bind';
import { buildMapperImport, parseMapper, } from '@graphql-codegen/visitor-plugin-common';
import { FetcherRenderer } from './fetcher.js';
export class CustomMapperFetcher extends FetcherRenderer {
    constructor(visitor, customFetcher) {
        super(visitor);
        this.visitor = visitor;
        if (typeof customFetcher === 'string') {
            customFetcher = { func: customFetcher };
        }
        this._mapper = parseMapper(customFetcher.func);
        this._isSolidHook = customFetcher.isSolidHook;
        autoBind(this);
    }
    getFetcherFnName(operationResultType, operationVariablesTypes) {
        return `${this._mapper.type}<${operationResultType}, ${operationVariablesTypes}>`;
    }
    generateFetcherImplementation() {
        if (this._mapper.isExternal) {
            return buildMapperImport(this._mapper.source, [
                {
                    identifier: this._mapper.type,
                    asDefault: this._mapper.default,
                },
            ], this.visitor.config.useTypeImports);
        }
        return null;
    }
    generateInfiniteQueryHook(config, isSuspense = false) {
        const { documentVariableName, operationResultType, operationVariablesTypes } = config;
        const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
        const implHookOuter = this._isSolidHook
            ? `const query = ${typedFetcher}(${documentVariableName})`
            : '';
        const implFetcher = this._isSolidHook
            ? `(metaData) => query({...variables, ...(metaData.pageParam ?? {})})`
            : `(metaData) => ${typedFetcher}(${documentVariableName}, {...variables, ...(metaData.pageParam ?? {})})()`;
        const { generateBaseInfiniteQueryHook } = this.generateInfiniteQueryHelper(config, isSuspense);
        return generateBaseInfiniteQueryHook({
            implHookOuter,
            implFetcher,
        });
    }
    generateQueryHook(config, isSuspense = false) {
        const { generateBaseQueryHook } = this.generateQueryHelper(config, isSuspense);
        const { documentVariableName, operationResultType, operationVariablesTypes } = config;
        const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
        const implFetcher = this._isSolidHook
            ? `${typedFetcher}(${documentVariableName}).bind(null, variables)`
            : `${typedFetcher}(${documentVariableName}, variables)`;
        return generateBaseQueryHook({
            implFetcher,
        });
    }
    generateMutationHook(config) {
        const { documentVariableName, operationResultType, operationVariablesTypes } = config;
        const { generateBaseMutationHook, variables } = this.generateMutationHelper(config);
        const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
        const implFetcher = this._isSolidHook
            ? `${typedFetcher}(${documentVariableName})`
            : `(${variables}) => ${typedFetcher}(${documentVariableName}, variables)()`;
        return generateBaseMutationHook({
            implFetcher,
        });
    }
    generateFetcherFetch(config) {
        const { documentVariableName, operationResultType, operationVariablesTypes, hasRequiredVariables, operationName, } = config;
        // We can't generate a fetcher field since we can't call solid hooks outside of a Solid Fucntion Component
        // Related: https://solidjs.org/docs/hooks-rules.html
        if (this._isSolidHook)
            return '';
        const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
        const typedFetcher = this.getFetcherFnName(operationResultType, operationVariablesTypes);
        const impl = `${typedFetcher}(${documentVariableName}, variables, options)`;
        return `\ncreate${operationName}.fetcher = (${variables}, options?: RequestInit['headers']) => ${impl};`;
    }
}
