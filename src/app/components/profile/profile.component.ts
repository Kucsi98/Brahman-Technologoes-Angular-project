import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HistoricalCrypto } from 'src/app/models/historicalCrypto.model';
import { UserModel } from 'src/app/models/user.model';
import { CryptoService } from 'src/app/services/crypto.service';
import { UserService } from 'src/app/services/user.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnChanges, OnDestroy {
  currentCrypto?: any;
  //= {
  //   asset_id_base: 'USD',
  //   rates: ['', 'BTC', 0.00001535368407289838],
  // }
  //aktiális kriptovaluta

  currentCryptoName?: string | null;
  currentCryptoRate?: number | null;

  isDollar: boolean = false; //a valutaváltó ettől a változótól függ
  swap: boolean = false; //valuta cserélő gomb animációja ehhez köthető
  amount!: number; //input mezőbe beírt érték
  result!: number; //eredménye a váltásnak

  selectedCrypto!: string; //kriptovaluta hozzáadásakor a kiválasztott kripto
  newCryptos: string[] = []; //azok a kriptok amiket még nem mentett el a user

  isOpen: boolean = false; //mobil nézetben a valuta listázó modul megjelenítése
  listVariable: boolean = false; // u.a css class-t ad hozzá

  currentUser$!: UserModel | null;
  savedCrypto: string[] = [];

  cryptoList: string[] | undefined = undefined;
  listedCryptos: { name: string; high?: number; low?: number }[] = [];

  chartData!: HistoricalCrypto[];
  ngOnInit(): void {
    this.userService.checkUser();
    this.userService.logedInUser.subscribe((newvalue) => {
      this.currentUser$ = newvalue!;
      if (this.currentUser$.cryptocurrencis) {
        this.currentUser$.cryptocurrencis.forEach((crypto) =>
          this.savedCrypto.push(crypto)
        );
      } else this.currentUser$.cryptocurrencis = [];
    });

    //crypto listázása
    // this.userService.logedInUser.subscribe((user) => {
    //   this.cryptoList = user?.cryptocurrencis;

    //   this.listedCryptos =
    //     this.cryptoList?.map((crypto) => ({ name: crypto })) || [];

    //   this.listedCryptos.forEach((crypto) => {
    //     this.cryptoService
    //       .gettingCurrentData(crypto.name)
    //       .subscribe((currentData: any) => {
    //         crypto.high = currentData.price_high;
    //         crypto.low = currentData.price_low;
    //       });
    //   });
    // });

    // this.webSocketService.getWebSocketData(this.cryptoList!);
    // this.gettingCryptoData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.gettingCryptoData();
  }

  ngOnDestroy(): void {
    // this.close();
  }

  constructor(
    private userService: UserService,
    private router: Router,
    private cryptoService: CryptoService,
    private webSocketService: WebsocketService
  ) {}

  getNewCryptos(cryptonames: string[]) {
    this.newCryptos = [];
    return this.cryptoService.getAllCrypto().subscribe({
      next: (allCrypto) => {
        allCrypto.map((crypto) => {
          if (!cryptonames.includes(crypto)) {
            this.newCryptos.push(crypto);
          }
        });
      },
    });
  }

  addCrypto(user: UserModel, crypto: string) {
    this.userService.addCrypto(user, crypto);
  }

  deleteCrypto(user: UserModel, crypto: string) {
    this.userService.deleteCrypto(user, crypto);
    this.currentCrypto = null;
    this.currentCryptoName = null;
    this.currentCryptoRate = null;
  }

  //megkapja a kiválasztott kriptovalutát
  //elmenti a currentCrypto változóba és 0-ra állítja az amount és result értékeit
  chooseCrypto(crypto: string) {
    this.cryptoService.exchange(crypto).subscribe({
      next: (crypto) => {
        this.currentCrypto = crypto.rates[0];
        this.currentCryptoName = this.currentCrypto.asset_id_quote;
        this.currentCryptoRate = this.currentCrypto.rate;
        this.amount = 0;
        this.result = 0;
      },
      complete: () => {
        this.chartData = [
          {
            price_close: 66534,
            time_close: '2024-03-04T19:10:13.0710000Z',
          },
          {
            price_close: 63142,
            time_close: '2024-03-03T23:59:58.6890000Z',
          },
          {
            price_close: 62042,
            time_close: '2024-03-02T23:59:58.5960000Z',
          },
          {
            price_close: 62444,
            time_close: '2024-03-01T23:59:48.0610000Z',
          },
          {
            price_close: 61161,
            time_close: '2024-02-29T23:59:59.0920000Z',
          },
          {
            price_close: 62512,
            time_close: '2024-02-28T23:59:55.7310000Z',
          },
          {
            price_close: 57068,
            time_close: '2024-02-27T23:59:59.2940000Z',
          },
        ];
        //   this.cryptoService.gettingHistoricalData(crypto).subscribe({
        //     next: (cryptoData) => {
        //       console.log('historycal data in choose crypto: ', cryptoData);
        //     },
        //   });
      },
    });
  }

  //Crypto converter
  //isDollar változótól függően hajtja végre a váltást
  convert() {
    if (!this.isDollar && this.currentCrypto) {
      //console.log('conert crypto to dollar: ', this.currentCrypto?.rates[2]);
      this.result = this.amount / this.currentCryptoRate!;
    }
    if (this.isDollar && this.currentCrypto) {
      this.result = this.amount * this.currentCryptoRate!;
    }
  }

  //fordít az isDollar értékén
  toggleIsDollar() {
    this.isDollar = !this.isDollar;
    this.swap = !this.swap;
    setTimeout(() => {
      this.swap = false;
    }, 1000);
    this.convert();
  }

  //Elmenti a kattintott kripto nevét
  toSelectCrypto(crypto: string) {
    this.selectedCrypto = crypto;
  }

  //mobilnézetben a valuta listázó modul megnyitása és zárása
  toggleList() {
    this.isOpen = !this.isOpen;
    this.listVariable = !this.listVariable;
  }

  //meghívom a userService-ből a logOut() függvényt és a kezdőlapra navigálok
  logout() {
    this.userService.logOut();
    this.router.navigate(['']);
  }

  // //crypto list

  // // Getting HIGH and LOW values from WebSocket
  // gettingCryptoData() {
  //   this.webSocketService.socket$
  //     .pipe(
  //       map((message) => {
  //         console.log(message);
  //         const name = message.symbol_id
  //           .replace('BITSTAMP_SPOT_', '')
  //           .replace('_USD', '');
  //         let high = message.price_high;
  //         let low = message.price_low;

  //         // Getting latest data to show at first time
  //         this.cryptoService.gettingCurrentData(name).subscribe({
  //           next: (data: any) => {
  //             high = data.price_high;
  //             low = data.price_low;
  //           },
  //           error: (err) => console.log(err),
  //         });
  //         return { name: name, high: high, low: low };
  //       })
  //     )
  //     // Subscribe to WebSocket
  //     .subscribe({
  //       next: (message) => {
  //         const changeData = this.listedCryptos.find(
  //           (crypto) => crypto.name === message.name
  //         );
  //         if (!changeData) {
  //           this.listedCryptos.push({
  //             name: message.name,
  //             high: message.high,
  //             low: message.low,
  //           });
  //         } else {
  //           changeData!.high = message.high;
  //           changeData!.low = message.low;
  //         }
  //       },
  //       error: (error) => {
  //         console.log('Websocket error:', error);
  //       },
  //       complete: () => {
  //         console.log('Websocket closed');
  //       },
  //     });
  // }

  // // Close WebSocket
  // close() {
  //   this.webSocketService.closeSocket();
  // }
}
