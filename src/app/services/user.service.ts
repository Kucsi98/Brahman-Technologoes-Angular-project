import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  _logedInUser = new BehaviorSubject<UserModel | undefined | null>(null);
  users: UserModel[] = [];
  usersString: string | null = '';
  currentUser?: UserModel;
  cryptoID?: number;

  constructor(private http: HttpClient, private router: Router) {}

  // Observable to listen for changes in the logged-in user
  public get logedInUser(): Observable<UserModel | undefined | null> {
    return this._logedInUser.asObservable();
  }

  // Helper function to get users from local storage
  private getUsersFromLocalStorage(): Observable<UserModel[]> {
    this.usersString = localStorage.getItem('users');
    return this.users ? JSON.parse(this.usersString as string) : [];
  }

  // Helper function to save usernames to local storage
  private saveUsernamesToLocalStorage(users: UserModel[]): void {
    this.usersString = JSON.stringify(users);
    localStorage.setItem('users', this.usersString);
  }

  // Function to handle user login
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
      // If the user doesn't exist, sign them up
      this.signUp(logInUser);
      this.currentUser = logInUser;
    }
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  // Function to handle user registration
  signUp(regUser: UserModel) {
    this.users.push(regUser);
    this.saveUsernamesToLocalStorage(this.users);
    this._logedInUser.next(regUser);
  }

  // Function to check if the user is already logged in
  checkUser() {
    this._logedInUser.next(JSON.parse(localStorage.getItem('currentUser')!));
  }

  // Function to log out the user
  logOut() {
    this._logedInUser.next(null);
    localStorage.removeItem('currentUser');
  }

  // Function to add a new cryptocurrency to the user's portfolio
  addCrypto(user: UserModel, newCrypto: string) {
    user.cryptocurrencis.push(newCrypto);
    this._logedInUser.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Function to delete a cryptocurrency from the user's portfolio
  deleteCrypto(user: UserModel, crypto: string) {
    this.cryptoID = user.cryptocurrencis?.indexOf(crypto);
    user.cryptocurrencis?.splice(this.cryptoID as number, 1);
    this._logedInUser.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}
