export interface ExchangeCryptoModel {
  asset_id_base: string;
  rates: [time: string, asset_id_quote: string, rate: number];
}
