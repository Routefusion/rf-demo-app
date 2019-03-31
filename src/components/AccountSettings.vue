<template>
  <v-app>
    <v-content>
    <v-alert icon="check_circle" dismissible outline transition="fade-transition" color="success" :value="userUpdated">User updated successfully.</v-alert>
    <v-alert type="error" dismissible outline :value="formError">{{errorMessage}}</v-alert>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md5>
            <v-card>
              <v-card-title primary-title class="headline primary--text">Account Settings</v-card-title>
              <v-card-text>
                <v-subheader style="padding-left: 0px">
                  General
                </v-subheader>
                <v-form v-model="valid">
                  <v-text-field
                    label="E-mail"
                    v-model="user.email"
                    :rules="rules.emailRules"
                    disabled
                  ></v-text-field>
                  <v-text-field
                    label="First Name"
                    v-model="user.firstName"
                    disabled
                  ></v-text-field>
                  <v-text-field
                    label="Last Name"
                    v-model="user.lastName"
                    disabled
                  ></v-text-field>
                  <v-subheader style="padding-left: 0px">
                    Multi-Factor Authentication
                  </v-subheader>
                  <v-switch v-model="mfaEnabled" color="primary">
                    <div slot="label">
                      <v-icon v-if="mfaEnabled" color="green">check_circle</v-icon>
                      <v-icon v-if="!mfaEnabled" color="red">block</v-icon>
                    </div>
                  </v-switch>
                </v-form>
                <router-link :to="{name: 'mfa'}">
                  <v-btn color="primary" dark :loading="loading" style="margin-left: 0px;">Get New MFA QR Code</v-btn>
                </router-link>
                <div class="caption" style="color: red; font-family: Open-Sans;"><em>Note: </em> This will revoke your current MFA QR Code.</div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" dark :loading="loading" v-on:click="submitForm">Submit</v-btn>
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
import * as rf from "../utils/sdk.js";
import { capitalize } from "../utils/helpers";
import { getLocal } from "../utils/localStorage.js";

import Footer from "./Footer";

export default {
  data() {
    return {
      loading: false,
      userUpdated: false,
      user: {
        firstName: "",
        lastName: "",
        email: "",
        mfaEnabled: null
      },
      mfaEnabled: false,
      password: "",
      passwordConfirmation: "",
      valid: null,
      formError: false,
      errorMessage: "",
      rules: {
        nameRules: [v => !!v || "Name is required", v => v.length <= 30 || "Name must be less than 30 characters"],
        emailRules: [v => !!v || "E-mail is required", v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || "E-mail must be valid"],
        passwordMatch: [v => !!v || "Password Confirmation required", v => v === this.password || "Passwords do not match"]
      }
    };
  },

  created() {
    var user = getLocal("user");
    if (!user.last_name) {
      this.formError = true;
      this.errorMessage = "There was an unknown error, please contact support@routefusion.co if the issue persists";
    } else {
      var userObj = {
        firstName: capitalize(user.first_name),
        lastName: capitalize(user.last_name),
        email: user.email,
        mfaEnabled: user.mfaEnabled
      };
      this.user = userObj;
      this.mfaEnabled = user.mfaEnabled;
    }
  },

  components: {
    "app-footer": Footer
  },

  methods: {
    submitForm() {
      // this.valid = !this.valid;
      // var self = this;
      // var tokenData = decode(localStorage.token);
      // var body = { mfa_enabled: self.mfaEnabled };
      //***
      //***do we need mfa?
      //***
      // if (self.mfaEnabled !== self.user.mfaEnabled) {
      //   return axios
      //     .put(`${process.env.API_URL}/users/${tokenData.userId}`, body, self.setHeaders())
      //     .then(function(resp) {
      //       self.loading = true;
      //       self.userUpdated = true;
      //       self.user.mfaEnabled = self.mfaEnabled;
      //       setTimeout(
      //         function() {
      //           self.userUpdated = false;
      //           self.loading = false;
      //         }.bind(self),
      //         5000
      //       );
      //     })
      //     .catch(function(err) {
      //       console.error("there was an error", err);
      //       self.formError = true;
      //       self.errorMessage = "There was an unknown error, please contact support@routefusion.co if the issue persists";
      //       if (err.response == undefined) {
      //         self.errorMessage = err.message;
      //       }
      //     });
      // }
    }
  }
};
</script>
