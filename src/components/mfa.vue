<template>
  <v-app>
    <v-content>
    <v-alert v-model="this.success" outline dismissible transition="fade-transition" icon="check_circle" color="success">Multi-Factor Authentication Activated!</v-alert>
    <v-alert v-model="error" outline dismissible transition="fade-transition" type="error">Something went wrong, please try again</v-alert>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex d-flex justify-center xs12 sm8 md5>
            <v-card>
              <v-card-title style="justify-content: center;" >
                <div class="headline primary--text">Multi-Factor Authentication</div>
              </v-card-title>
              <div  style="text-align: center; padding-bottom: 5px;">
                <img :src="qrCode">
              </div>
              <v-card-text>
                <div v-if="!disableGenerate" style="display: flex; justify-content: center;">
                    <v-btn large color="primary" dark :disabled="disableGenerate" v-on:click="abracadabra">Click for QR code</v-btn>
                </div>
              </v-card-text>
              <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                <div class="title primary--text" v-if="disableGenerate">Please verify below</div>
              </div>
              <div width="50%" style="display: flex; justify-content: center;">
                <v-form v-model="valid">
                  <v-text-field
                    label="Code"
                    v-model="authCode"
                    mask="### - ###"
                    :rules="[v => v.length === 6 || 'Code contains 6 numbers']"
                    :disabled="!qrCode"
                  ></v-text-field>
                </v-form>
              </div>
              <v-card-text style="display: flex; justify-content: center;">
                <v-btn color="primary" dark :disabled="success" v-on:click="alacazam">Submit</v-btn>
              </v-card-text>
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
  import * as decode from 'jwt-decode';
  import SessionModal from './SessionModal';

  export default {
    data () {
      return {
        success: false,
        error: false,
        disableGenerate: false,
        qrCode: null,
        authCode: null,
        verified: false,
        valid: null
      }
    },
    components: {
      'app-footer': Footer
    },
    methods: {
      setHeaders () {
        let token = localStorage.token;
        return { headers: {'token': token } }
      },

      abracadabra () {
        var id = decode(localStorage.token).userId;
        var self = this;
        axios.get(`${process.env.API_URL}/users/${id}/mfa/generate`, this.setHeaders())
          .then(function(resp) {
            self.qrCode = resp.data;
            self.disableGenerate = true;
            return;
          })
          .catch(function(err) {
            console.log(err);
          })
      },

      alacazam () {
        var id = decode(localStorage.token).userId;
        var self = this;
        axios.post(`${process.env.API_URL}/users/${id}/mfa/verify`, {token: this.authCode}, this.setHeaders())
          .then(function(resp) {
            if (resp.data.verified) {
              self.verified = true;
              self.success = true;
              setTimeout(function() {
                self.$router.push('dashboard');
              }.bind(self), 3000);
            }

            if (!resp.data.verified) {
              self.error = true;
            }

            return;
          })
          .catch(function(err) {
            console.log(err);
          })
      },

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