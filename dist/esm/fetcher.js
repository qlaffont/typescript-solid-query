import autoBind from 'auto-bind';
export class FetcherRenderer {
    constructor(visitor) {
        this.visitor = visitor;
        autoBind(this);
    }
    createQueryMethodMap(isSuspense = false) {
        const suspenseText = isSuspense ? 'Suspense' : '';
        const queryMethodMap = {
            infiniteQuery: {
                getHook: (operationName = 'Query') => `create${suspenseText}Infinite${operationName}`,
                getOptions: () => `Create${suspenseText}InfiniteQueryOptions`,
                getOtherTypes: () => ({ infiniteData: 'InfiniteData' }),
            },
            query: {
                getHook: (operationName = 'Query') => `create${suspenseText}${operationName}`,
                getOptions: () => `Create${suspenseText}QueryOptions`,
            },
            mutation: {
                getHook: (operationName = 'Mutation') => `create${operationName}`,
                getOptions: () => `CreateMutationOptions`,
            },
        };
        return queryMethodMap;
    }
    generateInfiniteQueryHelper(config, isSuspense) {
        const { operationResultType, operationName } = config;
        const { infiniteQuery } = this.createQueryMethodMap(isSuspense);
        this.visitor.solidQueryHookIdentifiersInUse.add(infiniteQuery.getHook());
        this.visitor.solidQueryOptionsIdentifiersInUse.add(infiniteQuery.getOptions());
        this.visitor.solidQueryOptionsIdentifiersInUse.add(infiniteQuery.getOtherTypes().infiniteData);
        const variables = this.generateInfiniteQueryVariablesSignature(config);
        const options = this.generateInfiniteQueryOptionsSignature(config, isSuspense);
        const generateBaseInfiniteQueryHook = (hookConfig) => {
            const { implArguments, implHookOuter = '', implFetcher } = hookConfig;
            const argumentsResult = implArguments !== null && implArguments !== void 0 ? implArguments : `
      ${variables},
      ${options}
    `;
            return `export const ${infiniteQuery.getHook(operationName)} = <
      TData = ${`${infiniteQuery.getOtherTypes().infiniteData}<${operationResultType}>`},
      TError = ${this.visitor.config.errorType}
    >(${argumentsResult}) => {
    ${implHookOuter}
    return ${infiniteQuery.getHook()}<${operationResultType}, TError, TData>(
      ${this.generateInfiniteQueryFormattedParameters(this.generateInfiniteQueryKey(config, isSuspense), implFetcher)}
    )};`;
        };
        return { generateBaseInfiniteQueryHook, variables, options };
    }
    generateQueryHelper(config, isSuspense) {
        const { operationName, operationResultType } = config;
        const { query } = this.createQueryMethodMap(isSuspense);
        this.visitor.solidQueryHookIdentifiersInUse.add(query.getHook());
        this.visitor.solidQueryOptionsIdentifiersInUse.add(query.getOptions());
        const variables = this.generateQueryVariablesSignature(config);
        const options = this.generateQueryOptionsSignature(config, isSuspense);
        const generateBaseQueryHook = (hookConfig) => {
            const { implArguments, implHookOuter = '', implFetcher } = hookConfig;
            const argumentsResult = implArguments !== null && implArguments !== void 0 ? implArguments : `
      ${variables},
      ${options}
    `;
            return `export const ${query.getHook(operationName)} = <
      TData = ${operationResultType},
      TError = ${this.visitor.config.errorType}
    >(${argumentsResult}) => {
    ${implHookOuter}
    return ${query.getHook()}<${operationResultType}, TError, TData>(
      ${this.generateQueryFormattedParameters(this.generateQueryKey(config, isSuspense), implFetcher)}
    )};`;
        };
        return {
            generateBaseQueryHook,
            variables,
            options,
        };
    }
    generateMutationHelper(config) {
        const { operationResultType, operationVariablesTypes, operationName } = config;
        const { mutation } = this.createQueryMethodMap();
        this.visitor.solidQueryHookIdentifiersInUse.add(mutation.getHook());
        this.visitor.solidQueryOptionsIdentifiersInUse.add(mutation.getOptions());
        const variables = `variables?: ${operationVariablesTypes}`;
        const options = `options?: ${mutation.getOptions()}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>`;
        const generateBaseMutationHook = (hookConfig) => {
            const { implArguments, implHookOuter = '', implFetcher } = hookConfig;
            const argumentsResult = implArguments !== null && implArguments !== void 0 ? implArguments : `${options}`;
            return `export const ${mutation.getHook(operationName)} = <
      TError = ${this.visitor.config.errorType},
      TContext = unknown
    >(${argumentsResult}) => {
    ${implHookOuter}
    return ${mutation.getHook()}<${operationResultType}, TError, ${operationVariablesTypes}, TContext>(
      ${this.generateMutationFormattedParameters(this.generateMutationKey(config), implFetcher)}
    )};`;
        };
        return {
            generateBaseMutationHook,
            variables,
            options,
        };
    }
    generateQueryVariablesSignature({ hasRequiredVariables, operationVariablesTypes, }) {
        return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
    }
    generateQueryOptionsSignature({ operationResultType }, isSuspense) {
        const { query } = this.createQueryMethodMap(isSuspense);
        return `options?: Omit<${query.getOptions()}<${operationResultType}, TError, TData>, 'queryKey'> & { queryKey?: ${query.getOptions()}<${operationResultType}, TError, TData>['queryKey'] }`;
    }
    generateInfiniteQueryVariablesSignature(config) {
        return `variables: ${config.operationVariablesTypes}`;
    }
    generateInfiniteQueryOptionsSignature({ operationResultType }, isSuspense) {
        const { infiniteQuery } = this.createQueryMethodMap(isSuspense);
        return `options: Omit<${infiniteQuery.getOptions()}<${operationResultType}, TError, TData>, 'queryKey'> & { queryKey?: ${infiniteQuery.getOptions()}<${operationResultType}, TError, TData>['queryKey'] }`;
    }
    generateInfiniteQueryKey(config, isSuspense) {
        const identifier = isSuspense ? 'infiniteSuspense' : 'infinite';
        if (config.hasRequiredVariables)
            return `['${config.node.name.value}.${identifier}', variables]`;
        return `variables === undefined ? ['${config.node.name.value}.${identifier}'] : ['${config.node.name.value}.${identifier}', variables]`;
    }
    generateInfiniteQueryOutput(config, isSuspense = false) {
        const { infiniteQuery } = this.createQueryMethodMap(isSuspense);
        const signature = this.generateQueryVariablesSignature(config);
        const { operationName, node } = config;
        return {
            hook: this.generateInfiniteQueryHook(config, isSuspense),
            getKey: `${infiniteQuery.getHook(operationName)}.getKey = (${signature}) => ${this.generateInfiniteQueryKey(config, isSuspense)};`,
            rootKey: `${infiniteQuery.getHook(operationName)}.rootKey = '${node.name.value}.infinite';`,
        };
    }
    generateQueryKey(config, isSuspense) {
        const identifier = isSuspense ? `${config.node.name.value}Suspense` : config.node.name.value;
        if (config.hasRequiredVariables)
            return `['${identifier}', variables]`;
        return `variables === undefined ? ['${identifier}'] : ['${identifier}', variables]`;
    }
    generateQueryOutput(config, isSuspense = false) {
        const { query } = this.createQueryMethodMap(isSuspense);
        const signature = this.generateQueryVariablesSignature(config);
        const { operationName, node, documentVariableName } = config;
        return {
            hook: this.generateQueryHook(config, isSuspense),
            document: `${query.getHook(operationName)}.document = ${documentVariableName};`,
            getKey: `${query.getHook(operationName)}.getKey = (${signature}) => ${this.generateQueryKey(config, isSuspense)};`,
            rootKey: `${query.getHook(operationName)}.rootKey = '${node.name.value}';`,
        };
    }
    generateMutationKey({ node }) {
        return `['${node.name.value}']`;
    }
    generateMutationOutput(config) {
        const { mutation } = this.createQueryMethodMap();
        const { operationName } = config;
        return {
            hook: this.generateMutationHook(config),
            getKey: `${mutation.getHook(operationName)}.getKey = () => ${this.generateMutationKey(config)};`,
        };
    }
    generateInfiniteQueryFormattedParameters(queryKey, queryFn) {
        return `(() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return () => ({
      queryKey: optionsQueryKey ?? ${queryKey},
      queryFn: ${queryFn},
      ...restOptions
    }
  }))()`;
    }
    generateQueryFormattedParameters(queryKey, queryFn) {
        return `() => ({
    queryKey: ${queryKey},
    queryFn: ${queryFn},
    ...options
  })`;
    }
    generateMutationFormattedParameters(mutationKey, mutationFn) {
        return `() => ({
    mutationKey: ${mutationKey},
    mutationFn: ${mutationFn},
    ...options
  })`;
    }
}
