<template>
  <v-app>
    <v-toolbar style="border-bottom: 1px solid #E7E7EC !important" color='white' fixed flat app>
      <router-link :to="{name: 'SignIn'}" style="text-decoration: none; color: inherit; padding: inherit; margin: inherit;">
        <v-toolbar-title style="color: #534A93; font-size: 22px !important;">Routefusion</v-toolbar-title>
      </router-link>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down white--text">
        <!-- <v-btn flat :to="{name: 'SignIn'}" style="color: #534A93;">Sign In</v-btn> -->
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
    <v-alert icon="check_circle" dismissible outline color="success" :value="userCreated">Thank you for reaching out, we will get back to you ASAP!</v-alert>
    <v-alert type="error" :value="formError">{{errorMessage}}</v-alert>

      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <v-card>
              <v-toolbar color="white" style="border-bottom: 1px solid #79589F !important" flat>
                <v-toolbar-title style="color: #534A93;">Contact Form</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form lazy-validation v-model="valid">
                  <v-text-field
                    label="Full Name"
                    v-model="fullName"
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
                    label="Title"
                    v-model="title"
                  ></v-text-field>
                  <v-text-field
                    multi-line=true
                    label="Message"
                    v-model="message"
                    placeholder='I am the CEO of a small-medium sized nearshore software company, would love to learn more about Routefusion!'
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <!-- <v-btn color="primary" dark :disabled=disableSignup v-on:click="submitForm">Submit</v-btn> -->
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
  data() {
    return {
      disableSignup: false,
      firstName: "",
      lastName: "",
      email: "",
      message: "",
      title: "",
      valid: null,
      userCreated: false,
      formError: false,
      errorMessage: "",
      rules: {
        nameRules: [v => !!v || "Name is required"],
        emailRules: [v => !!v || "E-mail is required", v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || "E-mail must be valid"]
      }
    };
  },
  components: {
    "app-footer": Footer
  },
  methods: {
    validateForm() {
      if (this.fullName.length < 1 || this.fullName.length > 50) {
        this.formError = true;
        this.errorMessage = "Full Name must be between 1 and 50 characters long";
        return false;
      } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
        this.formError = true;
        this.errorMessage = "Please provide a valid email";
        return false;
      } else {
        return true;
      }
    },

    submitForm() {
      this.valid = !this.valid;
      if (this.validateForm()) {
        var params = {
          full_name: this.fullName,
          email: this.email,
          title: this.title,
          message: this.message
        };
        return axios
          .post(`${process.env.API_URL}/contact`, params)
          .then(resp => {
            this.userCreated = true;
            this.disableSignup = true;
          })
          .catch(err => {
            console.error("there was an error", err);
            this.formError = true;
            if (err.response == undefined) {
              this.errorMessage = err.message;
            }

            if (err.response.data == 'duplicate key value violates unique constraint "users_email_key"') {
              this.errorMessage = "Email is already in use";
            }

            this.valid = !this.valid;
          });
      }
    }
  }
};
</script>
