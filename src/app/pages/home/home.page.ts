import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, combineLatest, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  acceptedKeys = ['CHANGEDAY', 'CHANGEPCTDAY', 'FROMSYMBOL', 'PRICE'];
  data$;
  httpOptions;
  initUrl = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,XMR&tsyms=USD';
  loadedMore$: BehaviorSubject<boolean>;
  loadingMore = true;
  loadMoreHidden = false;
  loadMoreUrl = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,XMR,ETN,RYO,AEON&tsyms=USD';
  maxIndex = 3;
  priceData = [];
  priceMap = {};
  sortAsc = false;
  sortAsc$: BehaviorSubject<boolean>;
  sortType = null;
  sortType$: BehaviorSubject<string>;
  uidMap = {
    'BTC': '5200',
    'ETH': '0146',
    'XMR': '2019',
    'ETN': '1812',
    'RYO': '3810',
    'AEON': '0029'
  }

  constructor(private http: HttpClient) {
    this.sortAsc$ = new BehaviorSubject(false);
    this.sortType$ = new BehaviorSubject(null);
    this.loadedMore$ = new BehaviorSubject(false);
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  ngOnInit() {
    // Make API call whenever filters are changed or every 30s
    this.data$ = combineLatest(
      this.sortAsc$,
      this.sortType$,
      this.loadedMore$,
      interval(30000).pipe(startWith(0))
    ).pipe(
      switchMap(() => {
        // If sorting has been enabled then make the call to the API with the full data set
        if (this.sortType || this.maxIndex > 3) {
          return this.http.get(this.loadMoreUrl, this.httpOptions);
        } else {
          return this.http.get(this.initUrl, this.httpOptions);
        }
      })).subscribe(res => {
        this.handleData(res);
      });
  }

  changeFilter(type) {
    if (type === 'ITEMUID') {
      if (this.sortType === 'ITEMUID') {
        this.sortAsc = !this.sortAsc;
        this.sortAsc$.next(this.sortAsc);
      } else {
        this.sortType = 'ITEMUID';
        this.sortType$.next('ITEMUID');
      }
    } else if (type === 'PRICE') {
      if (this.sortType === 'PRICE') {
        this.sortAsc = !this.sortAsc;
        this.sortAsc$.next(this.sortAsc);
      } else {
        this.sortType = 'PRICE';
        this.sortType$.next('PRICE');
      }
    }
  }

  handleData(data) {
    const raw = data['RAW'];
    this.loadingMore = false;
    if (this.maxIndex > 3) {
      this.loadMoreHidden = true;
    }
    // Cycle through all the different coin price data
    for (const key of Object.keys(raw)) {
      const updates = {};
      const currencyData = raw[key]['USD'];
      const ticker = currencyData['FROMSYMBOL'];
      // Cycle through each key in a coin's price data
      for (const priceKey of Object.keys(currencyData)) {
        // Make sure key is in the this.acceptedKeys array - this makes sure unwanted data is not included in our model
        if (this.acceptedKeys.indexOf(priceKey) !== -1) {
          // Initialize map item if it does not already exist
          if (!this.priceMap.hasOwnProperty(ticker)) {
            this.priceMap[ticker] = {};
            // Add a key index to the map for detecting times to push to the view array
            this.priceMap[ticker].key = Object.keys(this.priceMap).length;
          }
          // Detect if value was already added to view. If so, only update data that has changed - increased performance
          if (this.priceMap[ticker][priceKey] !== currencyData[priceKey]) {
            updates[priceKey] = currencyData[priceKey];
            this.priceMap[ticker][priceKey] = currencyData[priceKey];
          }
        }
      }
      // If item is a new item with a new index, then it should be added to the this.priceData array
      if (this.priceData.length < this.priceMap[ticker].key) {
        const newItemData = {};
        this.acceptedKeys.forEach(value => {
          newItemData[value] = currencyData[value];
        });
        newItemData['ITEMUID'] = this.uidMap[ticker];
        this.priceData.push(newItemData);
        // Else the item in the view's array should only be changed with updates
      } else {
        // Find index to insert new priceData
        let priceIndex;
        for (let i = 0; i < this.priceData.length; i++) {
          if (this.priceData[i]['FROMSYMBOL'] === ticker) {
            priceIndex = i;
          }
        }
        // Only modify items that were changed
        for (const updateKey of Object.keys(updates)) {
          this.priceData[priceIndex][updateKey] = currencyData[updateKey];
        }
      }
    }
  }

  loadMore() {
    this.loadingMore = true;
    this.maxIndex = 6;
    this.loadedMore$.next(true);
  }
}
