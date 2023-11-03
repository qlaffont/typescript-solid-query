import { GraphQlRequest } from './config.js';
import { FetcherRenderer, type GenerateConfig } from './fetcher.js';
import { SolidQueryVisitor } from './visitor.js';
export declare class GraphQLRequestClientFetcher extends FetcherRenderer {
    protected visitor: SolidQueryVisitor;
    private clientPath;
    constructor(visitor: SolidQueryVisitor, config: GraphQlRequest);
    generateFetcherImplementation(): string;
    generateInfiniteQueryHook(config: GenerateConfig, isSuspense?: boolean): string;
    generateQueryHook(config: GenerateConfig, isSuspense?: boolean): string;
    generateMutationHook(config: GenerateConfig): string;
    generateFetcherFetch(config: GenerateConfig): string;
}
