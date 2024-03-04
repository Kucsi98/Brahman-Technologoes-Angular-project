import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private readonly CRYPTO_URL = 'https://rest.coinapi.io/v1/';
  private readonly API_KEY = '17F5EBEA-04BD-4BB0-B9E0-037E65E07486';
  socket$!: WebSocketSubject<any>;

  // Function to get WebSocket data for specified cryptocurrencies
  getWebSocketData(cryptos: string[]): void {
    // Prepare an array of symbol IDs for the specified cryptocurrencies
    const allSymbolId: string[] = [];
    cryptos.map((crypto) => {
      allSymbolId.push(`BITSTAMP_SPOT_${crypto}_USD$`);
    });

    // Define the initial hello message to subscribe to OHLCV data
    const helloMessage = {
      type: 'hello',
      apikey: this.API_KEY,
      heartbeat: false,
      subscribe_data_type: ['ohlcv'],
      subscribe_filter_symbol_id: allSymbolId,
      subscribe_filter_period_id: ['1MIN'],
    };

    // Create a WebSocket connection
    this.socket$ = webSocket(`${this.CRYPTO_URL}`);

    // If there are symbols to subscribe to, send the hello message
    if (allSymbolId.length > 0) {
      this.socket$.next(helloMessage);
    }

    // Subscribe to WebSocket messages
    this.socket$.subscribe(
      (message) => console.log('WebSocket message:', message),
      (error) => console.error('WebSocket error:', error),
      () => console.log('WebSocket closed')
    );
  }

  // Function to close the WebSocket connection
  closeSocket(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
