<template>
  <v-app>
    <spin-baby-spin v-if="loading"></spin-baby-spin>
    <v-content>
      <v-alert type="error" :value="noBankStatement">No bank statemnt provided</v-alert>
      <v-alert type="error" :value="noPassport">No passport provided</v-alert>

      <v-container fluid>
        <v-layout row>
          <v-flex>
            <v-card>
              <v-card-title primary-title>
                <div>
                  <h2>Account Verification</h2>
                </div>
              </v-card-title>

              <v-card-text v-if="userVerifySubmitted">
                <div>
                  <p>Verification Docs already submitted</p>
                </div>
              </v-card-text>

              <v-stepper v-model="e6" vertical v-if="!userVerifySubmitted">

                <!-- STEP 1 -->
                <v-stepper-step step="1" :complete="e6 > 1">
                  Basic Information
                  <small>Fill account details below</small>
                </v-stepper-step>
                <v-stepper-content step="1">
                  <v-card flat class="mb-5">
                    <span>First, select the type of account you would like to add.</span>
                    <v-form v-model="valid" ref="form1">
                      <v-radio-group required v-model="user.type" row>
                            <v-radio label="Business" value="CORPORATE" color="indigo darken-3" ></v-radio>
                          <v-radio label="Personal" value="INDIVIDUAL" color="indigo darken-3"></v-radio>
                        </v-radio-group>
                      <div v-if="user.type">
                        <p>Second, fill in information fields below.</p>
                          <v-text-field v-if="user.type === 'CORPORATE'"
                            label="Company Name"
                            v-model="user.companyName"
                            :rules="rules.name"
                            required
                          ></v-text-field>
                          <v-text-field v-if="user.type === 'CORPORATE'"
                            label="Beneficiary Email"
                            v-model="user.email"
                            :rules="rules.email"
                            required
                          ></v-text-field>
                          <v-text-field
                            v-if="user.type === 'INDIVIDUAL'"
                            label="First Name"
                            v-model="user.firstName"
                            :rules="rules.name"
                            required
                          ></v-text-field>
                          <v-text-field
                            v-if="user.type === 'INDIVIDUAL'"
                            label="Last Name"
                            v-model="user.lastName"
                            :rules="rules.name"
                            required
                          ></v-text-field>
                          <v-menu
                            ref="menu"
                            lazy
                            :close-on-content-click="false"
                            v-model="menu"
                            transition="scale-transition"
                            offset-y
                            full-width
                            :nudge-right="40"
                            min-width="290px"
                          >
                            <v-text-field
                              v-if="user.type === 'INDIVIDUAL'"
                              slot="activator"
                              label="Date of Birth"
                              v-model="user.date_of_birth"
                              prepend-icon="event"
                              :rules="rules.DOB"
                              readonly
                            ></v-text-field>
                            <v-text-field
                              v-if="user.type === 'CORPORATE'"
                              slot="activator"
                              label="Date of incorporation"
                              v-model="user.date_of_birth"
                              prepend-icon="event"
                              :rules="rules.DOB"
                              readonly
                            ></v-text-field>
                            <v-date-picker
                              ref="picker"
                              v-model="user.date_of_birth"
                              @change="save"
                              min="1950-01-01"
                              :max="new Date().toISOString().substr(0, 10)"
                            ></v-date-picker>
                          </v-menu>
                          <v-text-field
                            label="Phone Number"
                            v-model="user.phoneNumber"
                            :counter="10"
                          ></v-text-field>
                      </div>
                    </v-form>
                  </v-card>
                  <v-btn color="primary" @click="stepToNext('form1', 1)">Continue</v-btn>
                </v-stepper-content>


                <!-- STEP 2 -->
                <v-stepper-step step="2" :complete="e6 > 2">Primary Address</v-stepper-step>
                <v-stepper-content step="2">
                  <v-card flat class="mb-5">
                    <v-form v-model="valid" ref="form2">
                      <v-text-field
                        label="Street Address"
                        v-model="user.street"
                        :rules="rules.street"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="City"
                        v-model="user.city"
                        :rules="rules.city"
                        required
                      ></v-text-field>
                      <!-- keeping below commented for now in case select does not scroll properly -->
                      <!-- <v-text-field
                        label="State"
                        v-model="user.state"
                        :rules="stateRules"
                        placeholder="NY"
                        hint="Abbreviations only. Example: NY"
                        :counter="2"
                        required
                      ></v-text-field> -->
                      <v-select
                        :items="states"
                        v-model="user.state"
                        label="State"
                        auto
                        single-line
                        :rules="rules.state"
                        autocomplete
                        required
                      ></v-select>
                      <v-text-field
                        label="ZipCode"
                        v-model="user.zipcode"
                        :rules="rules.zipcode"
                        type="number"
                        required
                      ></v-text-field>
                    </v-form>
                  </v-card>
                  <v-btn color="primary" @click="stepToNext('form2', 2)">Continue</v-btn>
                  <v-btn flat @click.native="e6 = 1">Back</v-btn>
                </v-stepper-content>


                <!-- STEP 3 -->
                <v-stepper-step step="3" :complete="e6 > 3">Bank Account Info</v-stepper-step>
                <v-stepper-content step="3">
                  <v-card flat class="mb-5">
                    <v-form v-model="valid" ref="form3">
                      <v-text-field
                        label="Account Name"
                        v-model="account.accountName"
                        hint="I.e. The Big Guns"
                        :rules="rules.name"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Account Number"
                        v-model="account.accountNumber"
                        :rules="rules.accountNum"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Routing Number"
                        v-model="account.routingNumber"
                        :rules="rules.routingNum"
                        required
                      ></v-text-field>
                    </v-form>
                  </v-card>
                  <v-btn color="primary" @click="stepToNext('form3', 3)">Continue</v-btn>
                  <v-btn flat @click.native="e6 = 2">Back</v-btn>
                </v-stepper-content>

                <!-- STEP 4 -->
                <v-stepper-step step="4" :complete="e6 > 4">Bank Statement</v-stepper-step>
                <v-stepper-content step="4">
                  <v-card flat class="mb-5">
                    <span>Please upload a copy of your most recent bank statement</span>
                    <br>
                    <br>
                    <br>
                    <v-form v-model="valid" ref="form4">
                      <input
                       type="file"
                       id="file"
                       ref="bankStatement"
                       v-on:change="bankStatementUpload()"
                       required
                      />
                      <br>
                      <br>
                      <br>
                      <img src="" height="200" class="bankstatment-img">
                    </v-form>
                  </v-card>
                  <v-btn color="primary" @click="stepToNext('form4', 4)">Continue</v-btn>
                  <v-btn flat @click.native="e6 = 3">Back</v-btn>
                </v-stepper-content>

                <!-- STEP 5 -->
                <v-stepper-step step="5" :complete="e6 > 5">Identification</v-stepper-step>
                <v-stepper-content step="5">
                  <v-card flat class="mb-5">
                    <span>Please upload a copy of your passport</span>
                    <br>
                    <br>
                    <br>
                    <v-form v-model="valid">
                      <input type="file" id="file" ref="passport" v-on:change="passportUpload()"/>
                      <br>
                      <br>
                      <br>
                      <img src="" height="200" class="passport-img">
                    </v-form>
                  </v-card>
                  <v-btn color="primary" @click.native="e6 = 6">Continue</v-btn>
                  <v-btn flat @click.native="e6 = 4">Back</v-btn>
                </v-stepper-content>


                <!-- STEP 6 -->
                <v-stepper-step step="6" :complete="e6 > 5">Submit</v-stepper-step>
                <v-stepper-content step="6">
                  <v-card flat class="mb-5">
                    <span>Please submit your verification documents</span>
                    <br>
                  </v-card>
                  <v-btn color="primary" :disabled='submitDis' @click.native="submit">Submit</v-btn>
                  <v-btn flat @click.native="e6 = 5">Back</v-btn>
                </v-stepper-content>
              </v-stepper>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Spinner from "./Spinner";
import axios from "axios";
import fetch from "node-fetch";
import * as decode from "jwt-decode";

export default {
  data() {
    return {
      submitDis: false,
      loading: true,
      userVerifySubmitted: null,
      account: {
        default_currency: "USD"
      },
      user: {},
      menu: false,
      valid: false,
      loading: true,
      e6: 1,
      e1: null,
      bankStatement: "",
      passport: "",
      noBankStatement: null,
      noPassport: null,
      rules: {
        DOB: [v => !!v || "Must provide date of birth"],
        street: [v => !!v || "Must provide a street address"],
        city: [v => !!v || "Must provide city"],
        state: [v => !!v || "State is required"],
        zipcode: [v => !!v || "Zip code is required", v => (v && v.length === 5) || "Zip code must have 5 numbers"],
        name: [v => !!v || "Name is required", v => (v && v.length <= 20) || "Name must be less than 20 characters"],
        email: [v => !!v || "E-mail is required", v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || "E-mail must be valid"],
        accountNum: [v => !!v || "Must provide account number", v => !/[a-zA-Z]/.test(v) || "Must contain only numbers"],
        routingNum: [v => !!v || "Must provide routing number", v => !/[a-zA-Z]/.test(v) || "Must contain only numbers"]
      },

      states: [
        "Alabama",
        "Alaska",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "District of Columbia",
        "Florida",
        "Georgia",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Marshall Islands",
        "Maryland",
        "Massachusetts",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Northern Mariana Islands",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Palau",
        "Pennsylvania",
        "Puerto Rico",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virgin Island",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming"
      ]
    };
  },

  components: {
    "spin-baby-spin": Spinner
  },

  watch: {
    menu(val) {
      val && this.$nextTick(() => (this.$refs.picker.activePicker = "YEAR"));
    }
  },

  methods: {
    refreshPage() {
      this.getUser().then(
        user => {
          this.userData = user.data;
          this.submitDis = false;
          // pre populate fields from user
          this.user.firstName = this.userData.first_name;
          this.user.lastName = this.userData.last_name;

          this.userVerifySubmitted = user.data.verification_submitted;
          this.loading = false;
          this.rules.zipcode = [v => !!v || "Zip code is required", v => v.length === 5 || "Zip code must have 5 numbers"];
          this.rules.name = [v => !!v || "Name is required", v => (v && v.length <= 20) || "Name must be less than 20 characters"];
        },
        error => {
          console.log("error loading page", error);
        }
      );
    },

    // validate step and continue if valid
    stepToNext(form, formNum) {
      if (this.$refs[form].validate()) {
        this.e6 = formNum + 1;
      }
    },

    save: function(date) {
      this.$refs.menu.save(date);
    },

    bankStatementUpload: function() {
      this.bankStatement = this.$refs.bankStatement.files[0];

      var preview = document.querySelector(".bankstatment-img");
      var file = this.$refs.bankStatement.files[0];
      var reader = new FileReader();

      reader.addEventListener(
        "load",
        function() {
          preview.src = reader.result;
        },
        false
      );

      if (file) {
        reader.readAsDataURL(file);
      }
    },

    passportUpload: function() {
      this.passport = this.$refs.passport.files[0];

      var preview = document.querySelector(".passport-img");
      var file = this.passport;
      var reader = new FileReader();

      reader.addEventListener(
        "load",
        function() {
          preview.src = reader.result;
        },
        false
      );

      if (file) {
        reader.readAsDataURL(file);
      }
    },

    setHeaders() {
      let token = localStorage.token;
      return { headers: { token: token } };
    },

    getUser: function() {
      let userId = this.decodeToken().userId;
      return axios.get(`${process.env.API_URL}/users/${userId}`, this.setHeaders());
    },

    decodeToken() {
      return decode(localStorage.token);
    },

    sendToBeneficiaries() {
      this.$router.push("beneficiaries");
    },

    submit: function() {
      let formData = new FormData();
      this.submitDis = true;

      if (this.bankStatement !== "") {
        formData.append("bankstatement", this.bankStatement);
        this.noBankStatement = false;
      } else {
        // return alert value to prevent network call
        this.submitDis = false;
        return (this.noBankStatement = true);
      }

      if (this.passport !== "") {
        formData.append("passport", this.passport);
        this.noPassport = false;
      } else {
        // return alert value to prevent network call
        this.submitDis = false;
        return (this.noPassport = true);
      }

      for (let property in this.account) {
        formData.append(property, this.account[property]);
      }

      for (let property in this.user) {
        formData.append(property, this.user[property]);
      }

      let token = localStorage.token;
      let userId = this.decodeToken().userId;

      fetch(`${process.env.API_URL}/users/${userId}/verify`, { method: "PUT", body: formData, headers: { token: token } })
        .then(response => {
          if (response.ok == true) {
            this.$router.push({ path: "beneficiaries", query: { userVerifySubmitted: true } });
          }
        })
        .catch(error => {
          this.submitDis = false;
          console.log(error);
        });
    }
  },

  created() {
    this.getUser().then(
      user => {
        this.userData = user.data;
        this.submitDis = false;
        // pre populate fields from user
        this.user.firstName = this.userData.first_name;
        this.user.lastName = this.userData.last_name;

        this.userVerifySubmitted = user.data.verification_submitted;
        this.loading = false;
        this.rules.zipcode = [v => !!v || "Zip code is required", v => v.length === 5 || "Zip code must have 5 numbers"];
        this.rules.name = [v => !!v || "Name is required", v => (v && v.length <= 20) || "Name must be less than 20 characters"];
      },
      error => {
        console.log("error loading page", error);
      }
    );
  }
};
</script>
