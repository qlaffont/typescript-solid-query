import { GraphQlRequest } from './config.cjs';
import { FetcherRenderer, type GenerateConfig } from './fetcher.cjs';
import { SolidQueryVisitor } from './visitor.cjs';
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
