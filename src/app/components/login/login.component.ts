import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  passwordReg: RegExp =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&(){}_.])[a-zA-Z\d@$!%*?&(){}_.]{9,22}$/; //password validator

  loginError?: string;
  currentUser$!: UserModel;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.checkUser();
    this.userService.logedInUser.subscribe((newvalue) => {
      this.currentUser$ = newvalue!;
      if (this.currentUser$) {
        this.router.navigate([`${this.currentUser$.username}`]);
      }
    });

    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(this.passwordReg),
      ]),
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login() {
    if (this.loginForm.valid) {
      const credential = this.loginForm.value;
      this.currentUser$ = this.userService.login(credential);
      if (this.currentUser$) {
        this.router.navigate([`${this.currentUser$.username}`]);
      }
    }
  }
}
