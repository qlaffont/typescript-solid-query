import { FetcherRenderer, type GenerateConfig } from './fetcher.js';
import { SolidQueryVisitor } from './visitor.js';
export declare class FetchFetcher extends FetcherRenderer {
    protected visitor: SolidQueryVisitor;
    constructor(visitor: SolidQueryVisitor);
    generateFetcherImplementation(): string;
    generateInfiniteQueryHook(config: GenerateConfig, isSuspense?: boolean): string;
    generateQueryHook(config: GenerateConfig, isSuspense?: boolean): string;
    generateMutationHook(config: GenerateConfig): string;
    generateFetcherFetch(config: GenerateConfig): string;
}
