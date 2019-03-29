<template>
  <v-app>
    <v-toolbar style="border-bottom: 1px solid #E7E7EC !important" color='white' fixed flat app>
      <router-link :to="{name: 'SignIn'}" style="text-decoration: none; color: inherit; padding: inherit; margin: inherit;">
        <v-toolbar-title style="color: #534A93; font-size: 22px !important;">Routefusion</v-toolbar-title>
      </router-link>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down white--text">
        <v-btn flat :to="{name: 'SignIn'}" style="color: #534A93;">Sign In</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
    <v-alert outline dismissible transition="fade-transition" icon="check_circle" color="success" v-model="passwordReset"> Password reset successfully. </v-alert>
    <v-alert outline dismissible transition="fade-transition" type="error" v-model="formError">{{errorMessage}}</v-alert>

      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <v-card>
              <v-toolbar color="white" style="border-bottom: 1px solid #79589F !important" flat>
                <v-toolbar-title style="color: #534A93;">Reset Password</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form v-model="valid">
                  <v-text-field
                    label="E-mail"
                    v-model="email"
                    disabled
                  ></v-text-field>
                  <v-text-field
                    label="Password"
                    v-model="password"
                    type="password"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="Password Confirmation"
                    v-model="passwordConfirmation"
                    type="password"
                    :rules="rules.passwordMatch"
                    required
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" dark v-on:click="backToSignIn">Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" dark :disabled="!valid" v-on:click="submitForm">Submit</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <app-footer></app-footer>
  </v-app>
</template>

<script>
  import Footer from "./Footer";
  import axios from "axios";

  export default {
    data () {
      return {
        disableSignup: true,
        email: '',
        password: '',
        passwordConfirmation: '',
        valid: null,
        passwordReset: false,
        invalidToken: false,
        formError: false,
        errorMessage: '',
        rules: {
          emailRules: [
            v => !!v || 'E-mail is required',
            v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
          ],
          passwordMatch: [
            (v) => !!v || 'Password Confirmation required',
            (v) => v === this.password || 'Passwords do not match'
          ]
        }
      }
    },
    components: {
      'app-footer': Footer
    },
    methods: {

      validateForm () {
        if (this.password.length < 6) {
          this.formError = true;
          this.errorMessage = "Password must be at least 6 characters long";
          setTimeout(() => this.formError = false, 10000);
          return false;
        } else if (this.password !== this.passwordConfirmation) {
          this.formError = true;
          this.errorMessage = "Password must much password confirmation";
          setTimeout(() => this.formError = false, 10000);
          return false;
        } else {
          return true;
        }
      },

      submitForm () {
        this.valid = !this.valid;
        if (this.validateForm()) {
          var body = {
            email: this.email,
            password: this.password
          }

          var resetToken = this.$route.params.token;

          return axios.put(`${process.env.API_URL}/reset/${resetToken}`, body)
            .then((resp) => {
              this.passwordReset = true;
              this.$router.push('/sign_in?passwordReset=true')
            })
            .catch((err) => {
              this.formError = true;
              this.errorMessage = "There was an error reseting your password. Please contact engineering@routefusion.co if this issue continues."
              setTimeout(() => this.formError = false, 10000);
              this.valid = !this.valid;
            })
        }
      },

      backToSignIn () {
        this.$router.push('/sign_in');
      }
    },

    created () {
      var resetToken = this.$route.params.token;

      return axios.get(`${process.env.API_URL}/reset/${resetToken}`)
        .then((resp) => {
          this.email = resp.data.email;
        })
        .catch((err) => {
          this.formError = true;
          this.errorMessage = "Password reset token invalid, please request a new token"
          setTimeout(() => this.formError = false, 10000);
        })
    }
  }
</script>