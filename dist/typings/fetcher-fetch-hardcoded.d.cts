import { HardcodedFetch } from './config.cjs';
import { FetcherRenderer, type GenerateConfig } from './fetcher.cjs';
import { SolidQueryVisitor } from './visitor.cjs';
export declare class HardcodedFetchFetcher extends FetcherRenderer {
    protected visitor: SolidQueryVisitor;
    private config;
    constructor(visitor: SolidQueryVisitor, config: HardcodedFetch);
    private getEndpoint;
    private getFetchParams;
    generateFetcherImplementation(): string;
    generateInfiniteQueryHook(config: GenerateConfig, isSuspense?: boolean): string;
    generateQueryHook(config: GenerateConfig, isSuspense?: boolean): string;
    generateMutationHook(config: GenerateConfig): string;
    generateFetcherFetch(config: GenerateConfig): string;
}
