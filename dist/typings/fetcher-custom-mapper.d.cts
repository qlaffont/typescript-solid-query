import { CustomFetch } from './config.cjs';
import { FetcherRenderer, type GenerateConfig } from './fetcher.cjs';
import { SolidQueryVisitor } from './visitor.cjs';
export declare class CustomMapperFetcher extends FetcherRenderer {
    protected visitor: SolidQueryVisitor;
    private _mapper;
    private _isSolidHook;
    constructor(visitor: SolidQueryVisitor, customFetcher: CustomFetch);
    private getFetcherFnName;
    generateFetcherImplementation(): string;
    generateInfiniteQueryHook(config: GenerateConfig, isSuspense?: boolean): string;
    generateQueryHook(config: GenerateConfig, isSuspense?: boolean): string;
    generateMutationHook(config: GenerateConfig): string;
    generateFetcherFetch(config: GenerateConfig): string;
}
