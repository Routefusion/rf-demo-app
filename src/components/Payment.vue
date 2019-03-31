<template>
  <v-app>
    <spin-baby-spin v-if="loading"></spin-baby-spin>
    <v-content>
      <v-container fluid v-if="loading == false">
        <v-layout row>
          <v-flex>
            <v-card>
              <v-alert transition="fade-transition" type="success" :value="success">Transfer Iniated Succesfully</v-alert>
              <v-alert transition="fade-transition" type="error" v-model="insufficientFunds">You have insufficient funds in your account</v-alert>
              <v-alert transition="fade-transition" type="error" v-model="paymentError" >{{paymentErrorMessage}}</v-alert>
              <v-card-title primary-title>
                <div>
                  <h2 style="color: #3F3F44">Payments</h2>
                </div>
              </v-card-title>

              <v-card flat v-if="user.verification_submitted == false">
                <v-card-text>
                  <div>
                    <v-btn fab small dark color="primary" v-on:click="sendToVerification">
                      <v-icon dark>assignment</v-icon>
                    </v-btn>
                    <span style="fontSize: 16px;">Submit Verification Docs</span>
                    <br>
                    <br>
                    <div>
                      <p>You haven’t been verified yet</p>
                      <p>Please Submit your verification documents</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>


              <v-card flat v-if="user.verification_submitted == true && beneficiaries.length < 1">
                <v-card-text>
                  <div>
                    <v-btn fab small dark color="primary" v-on:click="sendToBeneficiaries">
                      <v-icon dark>add</v-icon>
                    </v-btn>
                    <span style="fontSize: 16px;">ADD NEW BENEFICIARY</span>
                    <br>
                    <br>
                    <div>
                      <p>You haven’t added any beneficiaries yet.</p>
                      <p>Create a new beneficiary to send payments.</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <v-card flat v-if="user.verification_submitted == true && beneficiaries.length > 0 && user.verified == false">
                <v-card-text>
                  <div>
                    <div>
                      <p>Your account is in the verification process.  This can take up to 24 hours</p>
                      <p>Please email <a href="mailto:info@routefusion.co">info@routefusion.co</a> if you have any questions or concerns.</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <v-stepper v-model="e6" vertical v-if="user.verification_submitted == true && beneficiaries.length > 0 && user.verified == true">
                <v-stepper-step step="1" :complete="e6 > 1">
                  Send To
                  <small>{{this.payment.beneficiary.text}}</small>
                </v-stepper-step>
                <v-stepper-content step="1">
                  <v-card flat class="mb-5">
                    <v-flex xs6>
                      <v-select
                        :items="beneficiaries"
                        v-model="payment.beneficiary"
                        label="Select a beneficiary to send to"
                        class="input-group--focused"
                        item-text="text"
                        item-value="id"
                        return-object
                        autocomplete
                      ></v-select>
                    </v-flex>
                  </v-card>
                  <v-btn :disabled="payment.beneficiary.id == null" color="primary" @click.native="e6 = 2">Continue</v-btn>
                </v-stepper-content>


                <!-- STEP 2 -->



                <v-stepper-step step="2" :complete="e6 > 2">
                  Payment
                  <small>
                    {{this.items[payment.originCurrency].text}} > {{this.payment.beneficiary.currency}}
                  </small>
                </v-stepper-step>
                <v-stepper-content step="2">
                  <v-card flat class="mb-5">
                    <v-form v-model="valid" ref="form">
                      <v-container grid-list-md>
                        <v-layout row wrap>
                          <v-flex xs8>
                            <v-text-field
                              label="Amount"
                              v-model="payment.amount"
                              :counter="10"
                              required
                              type="number"
                              v-on:input="updateBeneficiaryCurrency()"
                              prefix="$"
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs3>
                            <v-select
                              :items="items"
                              v-model="payment.originCurrency"
                              label="Select"
                              item-text="text"
                              item-value="id"
                              single-line
                              required
                              :disabled="true"
                            ></v-select>
                          </v-flex>
                          <!-- <v-flex xs8>
                            <v-text-field
                              label="Recieved Amount"
                              v-model="payment.beneficiaryAmount"
                              :counter="10"
                              required
                              readonly
                              prefix="$"
                            ></v-text-field>
                          </v-flex> -->
                          <v-flex xs3>
                            <v-text-field
                              label="Beneficiary Currency"
                              v-model="payment.beneficiary.currency"
                              required
                              disabled
                            ></v-text-field>
                          </v-flex>
                          <v-flex xs12 v-if="payment.beneficiary.currency !== 'USD'">
                            <strong>Note: </strong>Your exchange rate will be available once the payment begins processing. We solemnly promise to find the best exchange rate for you.
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-form>
                  </v-card>
                  <v-btn :disabled="payment.amount === '' || payment.amount === null" color="primary" @click.native="e6 = 3">Continue</v-btn>
                  <v-btn flat @click.native="e6 = 1">Back</v-btn>
                </v-stepper-content>



                <!-- STEP 3 -->



                <v-stepper-step step="3" :complete="e6 > 3">Confirm</v-stepper-step>
                <v-stepper-content step="3">
                  <v-card flat class="mb-5">
                    <v-list two-line subheader>
                      <v-subheader>Please Verify Transaction Data is Correct</v-subheader>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Amount to Send</v-list-tile-title>
                          <v-list-tile-sub-title>${{`${payment.amount} ${getOriginCurrency()}`}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Beneficiary Currency</v-list-tile-title>
                          <v-list-tile-sub-title>{{payment.beneficiary.currency}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Beneficiary</v-list-tile-title>
                          <v-list-tile-sub-title>{{this.payment.beneficiary.text}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Total</v-list-tile-title>
                          <v-list-tile-sub-title>$ {{getTotal()}} USD</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
                  </v-card>
                  <p style ="color: red" v-if="insufficientFunds">You have insufficient funds for this transfer.  Please fund your account.</p>
                  <p style ="color: green" v-if="success">Transfer initiated succesfully!</p>
                  <v-btn v-if="!success" color="primary" :disabled="disableSubmit" @click.native="submit">Submit</v-btn>
                  <v-btn  v-if="!success" :disabled="disableSubmit" flat @click.native="e6 = 2">Back</v-btn>
                  <v-btn  v-if="success" color="primary" @click.native="reload">Send Another Payment</v-btn>
                  <br>
                  <br>
                  <br>
                  <p style="font-size: .6em">
                    You acknowledge that by clicking on SUBMIT, you have agreed to execute the transaction. Use of this service is governed by AFEX’s Terms and Conditions accepted by the Client’s Authorized Signatory. A
                    confirmation of the transaction will be sent to you by AFEX.
                    The foreign exchange transaction service is provided by a financially licensed and regulated, wholly owned subsidiary of Associated Foreign Exchange, Inc. (“AFEX”). “AFEX” is the marketing trade name for the
                    International Payment Solutions and Risk Management Solutions provided by several subsidiaries of Associated Foreign Exchange, Inc. Services in Australia are provided by Associated Foreign Exchange
                    Australia Pty Ltd; in Canada by Associated Foreign Exchange, ULC; in Switzerland by Associated Foreign Exchange (Schweiz) AG; in the UK and the European Economic Area (EEA) on a cross-border basis by
                    Associated Foreign Exchange Ltd; in the Channel Islands by AFEX Offshore Ltd; in Singapore by Associated Foreign Exchange (Singapore) Pte Ltd and in the U.S. by Associated Foreign Exchange, Inc. (collectively
                    referred to as “AFEX”).
                  </p>
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
import * as rf from "../utils/sdk";
import { getLocal } from "../utils/localStorage";
import Spinner from "./Spinner";
import numeral from "numeral";
import { Decimal } from "decimal.js";

export default {
  data() {
    return {
      balance: "",
      insufficientFunds: false,
      user: null,
      fee: 0,
      rate: "",
      USDMXNRate: "",
      disableSubmit: false,
      success: false,
      valid: false,
      loading: true,
      currencyRates: null,
      e6: 1,
      beneficiaries: [],
      payment: {
        amount: "",
        originCurrency: 0,
        beneficiaryCurrency: 1,
        beneficiary: {
          text: "",
          id: null
        }
      },
      paymentError: false,
      paymentErrorMessage: "",
      e1: null,
      items: [{ id: 0, text: "USD" }, { id: 1, text: "MXN" }, { id: 2, text: "CNY" }, { id: 3, text: "BRL" }],
      nameRules: [v => !!v || "Name is required", v => (v && v.length <= 15) || "Name must be less than 15 characters"],
      clabeRules: [v => !!v || "Clabe is require", v => (v && v.length == 18) || "A Clabe number is 18 digits long"]
    };
  },

  components: {
    "spin-baby-spin": Spinner
  },

  created() {
    this.getUserBeneficiaries().then(beneficiariesArr => {
      this.checkForCurrentBenny(beneficiariesArr);
    });
    this.user = getLocal("user");
    this.loading = false;
  },

  methods: {
    submit: function() {
      this.disableSubmit = true;
      const transferPayload = this.formatTransferData();
      rf
        .createTransfer()
        .then(res => {
          this.success = true;
        })
        .catch(err => {
          this.paymentErrorMessage = err.response.data.message;
          this.paymentError = true;
          setTimeout(() => (this.paymentError = false), 10000);
          this.reload();
        });
    },

    reload: function() {
      this.loading = true;
      this.e6 = 1;
      this.valid = false;
      this.success = false;
      this.payment.amount = "";
      this.payment.originCurrency = 0;
      this.payment.beneficiaryCurrency = 1;
      this.payment.beneficiaryAmount = 0;
      this.payment.beneficiary.currency = "";
      this.payment.beneficiary.text = "";
      this.payment.beneficiary.id = null;
      this.disableSubmit = false;
      let self = this;

      this.getUserBeneficiaries()
        .then(beneficiariesArr => {
          return (this.loading = false);
        })
        .catch(err => {
          console.log(err);
        });
    },

    getTotal: function() {
      if (this.payment.amount == "") {
        return 0;
      }
      let fee = numeral(this.fee);
      let amount = numeral(this.payment.amount);
      return this.payment.amount;
    },
    // this get called with the vuetify event onchange for input
    updateBeneficiaryCurrency: function() {
      // calculate fee
      if (this.payment.beneficiary.currency !== "USD") {
        this.fee = numeral(this.payment.amount * 0.015).format("0[.]000");
        // calulate the amount with a fee
        this.payment.amountWithFee = numeral(this.payment.amount - this.payment.amount * 0.015).format("0[.]000");
        // calculate the beneficiary amount with the amount
        this.payment.beneficiaryAmount = numeral(this.payment.amountWithFee * this.rate).format("0[.]00");
      } else {
        this.fee = 0;
        this.payment.amountWithFee = numeral(this.payment.amount).format("0[.]000");
        // calculate the beneficiary amount with the amount
        this.payment.beneficiaryAmount = numeral(this.payment.amount).format("0[.]00");
      }
    },

    getRatesNew: function(ticker) {
      return axios.post(`https://api.sendwyre.com/v2/transfers/preview?sourceCurrency=USD&destCurrency=${ticker}&sourceAmount=1000&amountIncludesFees=false`);
    },

    getOriginCurrency: function() {
      return this.items.filter(obj => obj.id == this.payment.originCurrency)[0].text;
    },

    getBeneficiaryCurrency: function() {
      return this.items.filter(obj => obj.id == this.payment.beneficiaryCurrency)[0].text;
    },

    formatTransferData: function() {
      return {
        user_id: getLocal("user").uuid,
        beneficiary_id: this.payment.beneficiary.id,
        source_amount: this.payment.amount,
        exchange_rate: this.rate,
        fee: this.fee,
        total: this.getTotal(),
        source_currency: this.getOriginCurrency(),
        destination_currency: this.payment.beneficiary.currency,
        destination_amount: this.payment.beneficiaryAmount
      };
    },

    getUserBeneficiaries: function() {
      return rf
        .getBen()
        .then(resp => {
          let beneficiariesArr = [];

          for (var i = 0; i < resp.length; i++) {
            let beneficiary = resp[i];

            if (beneficiary.verified) {
              beneficiariesArr.push({
                id: beneficiary.id,
                text: `${beneficiary.first_name_on_account} ${beneficiary.last_name_on_account}`,
                currency: beneficiary.currency
              });
            }
          }

          return (this.beneficiaries = beneficiariesArr);
        })
        .catch(err => console.log(err));
    },

    sendToBeneficiaries() {
      this.$router.push("beneficiaries");
    },

    sendToVerification() {
      window.open("http://onboard.routefusion.co", "_blank");
    },

    checkForCurrentBenny(beneficiariesArr) {
      if (this.$route.query.sendTo) {
        let beneficiaryId = this.$route.query.sendTo;
        let currentBeneficiary = beneficiariesArr.find(b => {
          if (b.id === parseInt(beneficiaryId)) {
            return b;
          }
        });
        this.payment.beneficiary.id = beneficiaryId;
        this.payment.beneficiary.text = currentBeneficiary.text;
        this.payment.beneficiary.currency = currentBeneficiary.currency;
        this.e6 = 2;
      }
    }

    // getUserBalance: function () {
    //   let userId = this.decodeToken().userId;
    //   return axios.get(`${process.env.API_URL}/users/${userId}/balance`, this.setHeaders())
    // },
  },

  watch: {
    "payment.beneficiary.currency": function(new_value, old_value) {
      console.log(new_value);
      if (new_value == undefined || new_value == "" || new_value == null) {
        return;
      }
      this.getRatesNew(new_value).then(response => {
        this.rate = response.data.exchangeRate;
        this.payment.beneficiaryAmount = numeral(this.payment.amountWithFee * this.rate).format("0[.]00");
      });
    }
  }
};
</script>
