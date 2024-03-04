import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ExchangeCryptoModel } from '../models/exchangeCrypto.model';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private readonly CRYPTO_URL = 'https://rest.coinapi.io/v1/';
  private readonly headers = {
    'X-CoinAPI-Key': 'DCA48354-D7E0-4986-8466-D5D959A73AEF',
  };

  constructor(private http: HttpClient) {}

  // Function to get all available cryptocurrencies
  getAllCrypto(): Observable<any[]> {
    return this.http
      .get<any>(
        `${this.CRYPTO_URL}symbols?filter_exchange_id=BITSTAMP&filter_asset_id=USD`,
        {
          headers: this.headers,
        }
      )
      .pipe(
        map((result) => {
          // Extract and return the base asset_id from the API response
          return result.map((item: any) => item.asset_id_base);
        })
      );
  }

  // Function to get exchange rate for a specific cryptocurrency
  exchange(currentCrypto: string): Observable<ExchangeCryptoModel> {
    return this.http.get<ExchangeCryptoModel>(
      `${this.CRYPTO_URL}exchangerate/USD?filter_asset_id=${currentCrypto}`,
      {
        headers: this.headers,
      }
    );
  }

  // Function to get the latest data for a specific cryptocurrency
  getCurrentData(cryptoName: string): Observable<[number, string][]> {
    return this.http
      .get<any>(
        `${this.CRYPTO_URL}ohlcv/BITSTAMP_SPOT_${cryptoName}_USD/latest?period_id=10SEC&limit=1`,
        {
          headers: this.headers,
        }
      )
      .pipe(
        map((result) => {
          return result.map((result: any) => ({
            price_high: result.price_high,
            price_low: result.time_low,
          }));
        })
      );
  }

  // Function to get historical data for a specific cryptocurrency
  getHistoricalData(cryptoName: string): Observable<[number, string][]> {
    return this.http
      .get<any>(
        `${this.CRYPTO_URL}ohlcv/BITSTAMP_SPOT_${cryptoName}_USD/history?period_id=1DAY&limit=7`,
        {
          headers: this.headers,
        }
      )
      .pipe(
        map((cryptos) => {
          return cryptos.map((crypto: any) => ({
            price_close: crypto.price_close,
            time_close: crypto.time_close,
          }));
        })
      );
  }
}
