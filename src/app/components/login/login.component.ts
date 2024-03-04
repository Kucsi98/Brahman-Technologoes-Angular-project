import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  passwordReg: RegExp =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&(){}_.])[a-zA-Z\d@$!%*?&(){}_.]{9,22}$/; //password validator

  loginError?: string;
  currentUser$!: UserModel;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    // Check if a user is already logged in
    this.userService.checkUser();
    this.userService.logedInUser.subscribe((newvalue) => {
      this.currentUser$ = newvalue!;
      // Redirect to user-specific page if already logged in
      if (this.currentUser$) {
        this.router.navigate([`${this.currentUser$.username}`]);
      }
    });

    // Initialize the login form with form controls and validators
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(this.passwordReg),
      ]),
    });
  }

  // Getter for username form control
  get username() {
    return this.loginForm.get('username');
  }

  // Getter for password form control
  get password() {
    return this.loginForm.get('password');
  }

  // Function to handle user login
  login() {
    if (this.loginForm.valid) {
      const credential = this.loginForm.value;
      this.currentUser$ = this.userService.login(credential);
      // If login is successful, navigate to the user-specific page
      if (this.currentUser$) {
        this.router.navigate([`${this.currentUser$.username}`]);
      }
    }
  }
}
