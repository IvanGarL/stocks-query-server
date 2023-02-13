/**
 * Server Stock Request response
 */
export interface StooqDataResponse {
    symbols: StooqAsset[]
}

/**
 * Stooq Asset representation
 */
export interface StooqAsset {
    symbol: string;
    date: string;
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    name: string;
}