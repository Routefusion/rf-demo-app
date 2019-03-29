<template>
  <v-layout row justify-center>
    <v-dialog v-model="modalOpen" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Session Expired</v-card-title>
        <v-card-text>Please login to continue</v-card-text>
        <v-card-text>
          <v-form @keyup.native.enter="signIn">
            <v-text-field
              prepend-icon="person"
              name="login"
              label="Email"
              type="text"
              v-model="email"
              :error-messages="invalidEmail ? ['Email not found'] : []"
              disabled
            ></v-text-field>
            <v-text-field
              prepend-icon="lock"
              name="password"
              label="Password"
              id="password"
              type="password"
              v-model="password"
              :error-messages="badPassword ? ['Password does not match'] : []"
            ></v-text-field>
            <v-text-field
              v-if="mfaEnabled === 'true'"
              prepend-icon="security"
              name="Multi-Factor Authentication Code"
              label="Multi-Factor Authentication Code"
              type="password"
              v-model="mfaToken"
              :error-messages="badToken ? ['Code is invalid, please try again'] : []"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click.native="signIn">SIGN IN</v-btn>
          <v-btn color="green darken-1" flat @click.native="sendToLogin">SIGN OUT</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
  import axios from "axios";
  import * as decode from "jwt-decode";

  export default {
    data () {
      return {
        modalOpen: null,
        email: null,
        password: null,
        interval: null,
        badPassword: false,
        invalidEmail: false,
        badToken: false,
        mfaToken: null
      }
    },

    computed: {
      mfaEnabled: function () {
        return localStorage.getItem('mfaEnabled') || null;
      }
    },

    created () {
      console.log('Welcome to RouteFusion');
      this.email = decode(localStorage.token).email;
    },

    mounted () {
      this.checkAuthStatus();

      this.interval = setInterval(function () {
        this.checkAuthStatus();
      }.bind(this), 15000);
    },

    beforeDestroy() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },

    methods: {
      setHeaders: function () {
        let token = localStorage.token;
        return { headers: {'token': token} };
      },

      checkAuthStatus: function () {
        axios.get(`${process.env.API_URL}/auth_status`, this.setHeaders())
        .then((resp) => {
          this.modalOpen = false;
        })
        .catch((err) => {
          console.log('auth failed', err.message);
          this.modalOpen = true;
          clearInterval(this.interval);
          this.interval = null;
        })
      },

      sendToLogin: function () {
        this.modalOpen = false;

        delete localStorage.token;
        this.$router.push('/sign_in');
      },

      closeModal: function () {
        this.modalOpen = false;
      },

      signIn: function () {
        axios.put(`${process.env.API_URL}/login`, {email: this.email, password: this.password, token: this.mfaToken})
          .then(resp => { // Success
            this.badPassword = false;
            this.modalOpen = false;

            // set local storage
            localStorage.token = resp.data.token;

            this.$emit('stop-that-fool');

            if (this.$router.currentRoute.name === 'FundAccount') {
              this.$parent.$forceUpdate();
            }

            if (this.interval === undefined) {
              this.interval = setInterval(function () {
                this.checkAuthStatus();
              }.bind(this), 15000);
            }
          }, err => { // Failed
              console.log('error on sign in', err);
              if (err.response.status === 403) {
                this.badToken = true;
              }

              if (err.response.data.error === "Bad password") {
                this.badPassword = true;
                this.invalidEmail = false;
              }
              if (err.response.data.error === "Invalid email") this.invalidEmail = true;
          });
      }
    }
  }
</script>