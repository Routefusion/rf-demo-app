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
    <v-alert icon="check_circle" dismissible outline color="success" :value="userCreated"> User created successfully. </v-alert>
    <v-alert type="error" :value="formError">{{errorMessage}}</v-alert>

      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <v-card>
              <v-toolbar color="white" style="border-bottom: 1px solid #79589F !important" flat>
                <v-toolbar-title style="color: #534A93;">Sign Up Form</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form v-model="valid">
                  <v-text-field
                    label="First Name"
                    v-model="firstName"
                    :rules="rules.nameRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="Last Name"
                    v-model="lastName"
                    :rules="rules.nameRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    label="E-mail"
                    v-model="email"
                    :rules="rules.emailRules"
                    required
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
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        valid: null,
        userCreated: false,
        formError: false,
        errorMessage: '',
        rules: {
          nameRules: [
            v => !!v || 'Name is required',
            v => v.length <= 30 || 'Name must be less than 30 characters'
          ],
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
        if (this.firstName.length < 1 || this.firstName.length > 30) {
          this.formError = true;
          this.errorMessage = "First name must be between 1 and 30 characters long";
          return false;
        } else if (this.lastName.length < 1 || this.lastName.length > 30) {
          this.formError = true;
          this.errorMessage = "Last name must be between 1 and 30 characters long";
          return false;
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
          this.formError = true;
          this.errorMessage = "Please provide a valid email";
          return false;
        } else if (this.password.length < 6) {
          this.formError = true;
          this.errorMessage = "Password must be at least 6 characters long";
          return false;
        } else if (this.password !== this.passwordConfirmation) {
          this.formError = true;
          this.errorMessage = "Password must much password confirmation";
          return false;
        } else {
          return true;
        }
      },

      submitForm () {
        this.valid = !this.valid;
        if (this.validateForm()) {
          var params = {
            first_name: this.firstName,
            last_name: this.lastName,
            email: this.email,
            password: this.password
          }
          return axios.post(`${process.env.API_URL}/sign_up`, params)
            .then((resp) => {
              console.log("USER CREATED!!!!!!")
              this.userCreated = true;
              this.$router.push('/sign_in?userCreated=true')
            })
            .catch((err) => {
              console.error("there was an error", err)
              this.formError = true;
              if (err.response == undefined) {
                this.errorMessage = err.message;
              }

              if (err.response.data == "duplicate key value violates unique constraint \"users_email_key\"") {
                this.errorMessage = "Email is already in use";
              }

              this.valid = !this.valid;
            })
        }
      }
    }
  }
</script>