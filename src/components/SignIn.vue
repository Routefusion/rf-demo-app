<template>
  <v-app>
      <v-toolbar style="border-bottom: 1px solid #E7E7EC !important" color='white' fixed flat app>
        <router-link :to="{name: 'Home'}" style="text-decoration: none; color: inherit; padding: inherit; margin: inherit;">
          <v-toolbar-title style="color: #534A93; font-size: 22px !important;">Routefusion</v-toolbar-title>
        </router-link>
        <v-spacer></v-spacer>
        <v-toolbar-items class="hidden-sm-and-down white--text">
          <v-btn flat :to="{name: 'Sign Up'}" style="color: #534A93;">Sign Up</v-btn>
        </v-toolbar-items>
      </v-toolbar>
    <v-content>
      <v-alert outline dismissible transition="fade-transition" icon="check_circle" color="success" v-model="userCreated"><strong> User created successfully. </strong></v-alert>
      <v-alert outline dismissible transition="fade-transition" icon="check_circle" color="success" v-model="passwordReset"><strong> Password reset successfully. </strong></v-alert>
      <v-alert outline dismissible transition="fade-transition" icon="check_circle" color="success" v-model="forgotPasswordSent"><strong> Password reset instructions sent to {{this.email}} </strong></v-alert>
      <v-alert outline dismissible transition="fade-transition" type="error" v-model="unknownError">An unknown error occured, please contact engineering@routefusion.co if this issue persists.</v-alert>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card>
              <v-toolbar color="white" style="border-bottom: 1px solid #79589F !important" flat>
                <v-toolbar-title style="color: #534A93;">Login form</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form v-if="!disableEmail" v-model="verifyEmailFormValid">
                  <v-text-field
                    @keypress.13.prevent
                    prepend-icon="person"
                    label="Email"
                    type="text"
                    v-model="email"
                    :error-messages="invalidEmail ? ['Invalid email'] : []"
                  ></v-text-field>
                </v-form>
                <v-form v-if="disableEmail" @keyup.native.enter="signIn">
                  <v-text-field :disabled="disableEmail" prepend-icon="person" label="Email" type="text" v-model="email"></v-text-field>
                  <v-text-field
                    v-if="disableEmail"
                    prepend-icon="lock"
                    name="password"
                    label="Password"
                    id="password"
                    type="password"
                    v-model="password"
                    :error-messages="badPassword ? ['Password does not match'] : []"
                  ></v-text-field>
                  <v-text-field
                    v-if="mfaEnabled"
                    hint="Only required if multi-factor authentication is enabled"
                    prepend-icon="security"
                    name="mfa code"
                    label="Multi-Factor Authentication Code"
                    type="text" mask="### ###"
                    v-model="mfaToken"
                    :error-messages="badToken ? ['Bad token'] : []"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions v-if="!disableEmail" style="justify-content: center;">
                <v-btn :disabled="!verifyEmailFormValid" v-if="!disableEmail" v-on:click="verifyEmail" color="primary">Submit</v-btn>
              </v-card-actions>
              <v-card-actions v-if="disableEmail">
                <a v-if="disableEmail" d-inline-block v-on:click="forgotPasioswordModal = true" light color="primary">Forgot Password?</a>
                <v-spacer></v-spacer>
                <v-btn v-on:click="signIn" dark color="primary">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
          <v-dialog v-if="forgotPasswordModal" v-model="forgotPasswordModal" max-width="290">
            <v-card>
              <v-card-title class="headline">Forgot Password?</v-card-title>
              <v-card-text>Enter email to receive password reset instructions</v-card-text>
              <v-card-text>
                <v-form v-if="forgotPasswordModal">
                  <v-text-field
                    prepend-icon="email"
                    name="login"
                    label="Email"
                    type="text"
                    v-model="email"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" flat @click.native="forgotPasswordModal = false">CLOSE</v-btn>
                <v-btn color="green darken-1" flat @click.native="forgotPassword">SUBMIT</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-layout>
      </v-container>
    </v-content>
    <footer-meow></footer-meow>
  </v-app>
</template>

<script>
  import Footer from "./Footer";
  import axios from "axios";
  import * as decode from "jwt-decode";

  export default {
    data: () => ({
      verifyEmailFormValid: false,
      disableEmail: false,
      badToken: false,
      badTokenMessage: '',
      mfaEnabled: false,
      mfaToken: null,
      email: '',
      password: '',
      badPassword: false,
      userCreated: false,
      forgotPasswordModal: false,
      forgotPasswordSent: false,
      passwordReset: false,
      invalidEmail: false,
      unknownError: false,
      rules: {
        email: [
          v => !!v || 'E-mail is required',
          v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
        ]
      }
    }),

    components: {
      'footer-meow': Footer
    },

    created () {
      if (this.$route.query.userCreated === 'true') {
        this.userCreated = true;
        setTimeout(() => this.userCreated = false, 10000);
      }

      if (this.$route.query.passwordReset === 'true') {
        this.passwordReset = true;
        setTimeout(() => this.passwordReset = false, 10000);
      }
    },

    methods: {
      verifyEmail () {
        var self = this;
        axios.get(`${process.env.API_URL}/login`, {headers: {email: self.email}})
          .then(function(resp) {
            if (resp.data.mfaEnabled) {
              self.mfaEnabled = true;
              localStorage.mfaEnabled = true;
            }
            self.disableEmail = true;
          })
          .catch(function(err) {
            console.log('err', err);
            self.invalidEmail = true;
            setTimeout(function() { self.invalidEmail = false}.bind(self), 5000);
          })
      },

      signIn () {
        this.axios.put(`${process.env.API_URL}/login`, {email: this.email, password: this.password, token: this.mfaToken})
          .then(resp => {
            let decodedToken = decode(resp.data.token)

            // set local storage
            localStorage.token = resp.data.token;

            if (resp.data.avatar_src) localStorage.avatarSrc = resp.data.avatar_src;

            if (this.$route.query.from === 'mail') return this.$router.push('/rf/beneficiaries');

            return this.$router.push('/rf/dashboard');
          })
          .catch(err => {
            if (!err.response) {
              console.log(err);
              this.unknownError = true;
              setTimeout(() => this.unknownError = false, 10000);
              return;
            }

            if (err.response.status === 401) {
              this.badPassword = true;
              setTimeout(() => this.badPassword = false, 5000);
            }

            if (err.response.status === 403) {
              this.badToken = true;
              setTimeout(() => this.badToken = false, 5000);
            }
          });
      },

      forgotPassword () {
        this.axios.post(`${process.env.API_URL}/forgot`, {email: this.email})
          .then(resp => {
            this.forgotPasswordSent = true;
            this.forgotPasswordModal = false;
            setTimeout(() => this.forgotPasswordSent = false, 10000);
          })
          .catch(err => {
            this.invalidEmail = true;
            setTimeout(() => this.invalidEmail = false, 10000);
          })
      }
    }
  }
</script>