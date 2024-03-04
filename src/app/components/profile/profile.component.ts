import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { Color, ScaleType } from '@swimlane/ngx-charts';
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

  currentCryptoName?: string | null;
  currentCryptoRate?: number | null;

  isDollar: boolean = false;
  swap: boolean = false;
  amount!: number;
  resultConverter!: number;

  selectedCrypto!: string;
  newCryptos: string[] = [];

  isOpen: boolean = false;
  listVariable: boolean = false;

  currentUser$!: UserModel | null;
  savedCrypto: string[] = [];

  cryptoList: string[] | undefined = undefined;
  listedCryptos: { name: string; high?: number; low?: number }[] = [];

  chartData!: HistoricalCrypto[];

  //chart
  view: any = [];
  showLabels: boolean = true;
  animations: boolean = false;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = false;
  xAxisLabel: string = 'Days';
  yAxisLabel: string = 'Cost in USD';
  timeline: boolean = true;
  autoScale: boolean = true;

  colorScheme: any = {
    domain: ['#f5cac3'],
  };

  ngOnInit(): void {
    // Check if a user is already logged in
    this.userService.checkUser();

    // Subscribe to the logged-in user changes
    this.userService.logedInUser.subscribe((newvalue) => {
      this.currentUser$ = newvalue!;
      // Populate the savedCrypto array with the user's cryptocurrencies
      if (this.currentUser$.cryptocurrencis) {
        this.currentUser$.cryptocurrencis.forEach((crypto) =>
          this.savedCrypto.push(crypto)
        );
      } else this.currentUser$.cryptocurrencis = [];
    });

    //WEBSOCKET
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

  // Function to get new cryptocurrencies
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

  // Function to add a cryptocurrency to the user's portfolio
  addCrypto(user: UserModel, crypto: string) {
    this.userService.addCrypto(user, crypto);
  }

  // Function to delete a cryptocurrency from the user's portfolio
  deleteCrypto(user: UserModel, crypto: string) {
    // Reset currentCrypto details when a cryptocurrency is deleted
    this.userService.deleteCrypto(user, crypto);
    this.currentCrypto = null;
    this.currentCryptoName = null;
    this.currentCryptoRate = null;
    this.chartData = [];
  }

  // Function to choose a cryptocurrency and fetch its details
  chooseCrypto(crypto: string) {
    this.cryptoService.exchange(crypto).subscribe({
      next: (crypto) => {
        // Store current cryptocurrency details
        this.currentCrypto = crypto.rates[0];
        this.currentCryptoName = this.currentCrypto.asset_id_quote;
        this.currentCryptoRate = this.currentCrypto.rate;
        this.amount = 0;
        this.resultConverter = 0;
      },
      complete: () => {
        // Fetch historical data for the chosen cryptocurrency
        this.cryptoService
          .getHistoricalData(this.currentCryptoName!)
          .subscribe({
            next: (cryptoDatas) => {
              const currentData: HistoricalCrypto[] = [];
              cryptoDatas.reverse().forEach((cryptoData: any) => {
                const currentDate = new Date(cryptoData.time_close);

                const currentDayOfMonth = currentDate.getDate();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();
                const historyData = {
                  name: `${currentYear}. ${
                    currentMonth + 1
                  }. ${currentDayOfMonth}.`,
                  value: cryptoData.price_close,
                };

                currentData.push(historyData);
              });
              // Update chartData with historical data
              this.chartData = currentData;
            },
          });
      },
    });
  }

  // Function to convert currency based on user input
  convert() {
    if (!this.isDollar && this.currentCrypto) {
      this.resultConverter = this.amount / this.currentCryptoRate!;
    }
    if (this.isDollar && this.currentCrypto) {
      this.resultConverter = this.amount * this.currentCryptoRate!;
    }
  }

  // Function to toggle between Dollar and Cryptocurrency
  toggleIsDollar() {
    this.isDollar = !this.isDollar;
    this.swap = !this.swap;
    setTimeout(() => {
      this.swap = false;
    }, 1000);
    this.convert();
  }

  // Function to handle the selected cryptocurrency in the list
  toSelectCrypto(crypto: string) {
    this.selectedCrypto = crypto;
  }

  // Function to toggle the display of the cryptocurrency list
  toggleList() {
    this.isOpen = !this.isOpen;
    this.listVariable = !this.listVariable;
  }

  // Function to log out the user
  logout() {
    this.userService.logOut();
    this.router.navigate(['']);
  }

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
  // close() {
  //   this.webSocketService.closeSocket();
  // }
}
