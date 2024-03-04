import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Log in-hoz tartozó változók
  _logedInUser = new BehaviorSubject<UserModel | undefined | null>(null);
  users: UserModel[] = [];
  usersString: string | null = '';
  currentUser?: UserModel;

  updateUser!: UserModel | undefined | null;
  cryptoID?: number;

  constructor(private http: HttpClient, private router: Router) {}

  public get logedInUser(): Observable<UserModel | undefined | null> {
    return this._logedInUser.asObservable();
  }

  private getUsersFromLocalStorage(): Observable<UserModel[]> {
    this.usersString = localStorage.getItem('users');
    return this.users ? JSON.parse(this.usersString as string) : [];
  }

  private saveUsernamesToLocalStorage(users: UserModel[]): void {
    this.usersString = JSON.stringify(users);
    localStorage.setItem('users', this.usersString);
  }

  login(logInUser: UserModel) {
    this.getUsersFromLocalStorage();
    this.currentUser = this.users?.find(
      (user) =>
        user.username === logInUser.username &&
        user.password === logInUser.password
    );
    if (this.currentUser) {
      this._logedInUser.next(this.currentUser);
    } else {
      this.signUp(logInUser);
      this.currentUser = logInUser;
    }
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  signUp(regUser: UserModel) {
    this.users.push(regUser);
    this.saveUsernamesToLocalStorage(this.users);
    this._logedInUser.next(regUser);
  }

  checkUser() {
    this._logedInUser.next(JSON.parse(localStorage.getItem('currentUser')!));
  }

  logOut() {
    this._logedInUser.next(null);
    localStorage.removeItem('currentUser');
  }

  addCrypto(user: UserModel, newCrypto: string) {
    user.cryptocurrencis.push(newCrypto);
    this._logedInUser.next(user);
  }

  deleteCrypto(user: UserModel, crypto: string) {
    this.cryptoID = user.cryptocurrencis?.indexOf(crypto);
    user.cryptocurrencis?.splice(this.cryptoID as number, 1);
    this._logedInUser.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('user service delete Crypto: ', this.logedInUser);
  }
}
