<template>
  <v-app>
    <spin-baby-spin v-if="loading"></spin-baby-spin>
    <v-content>
    <session-modal @stop-that-fool="refreshPage()"></session-modal>
      <v-container fluid>
        <v-alert type="error" :value="error">Your deposit was unsuccesful.  If this error happens again please reach out to support on your <b>telegram channel</b> or by emailing <b>info@routefusion.co</b></v-alert>
        <v-layout row>
          <v-flex v-if="depositSubmitted">
            <v-card flat v-if="depositSubmitted">
              <v-card-title primary-title>
                <div>
                  <h2 style="color: #3F3F44">Fund Account</h2>
                </div>
              </v-card-title>

              <v-card-text>
                <h4>Funding Instructions</h4>
                <br>
                <p><b>*Important</b>: Please make sure to read and check our bank details each time you make a transfer.  Also
                please print out these instructions or copy and save them to a file.  For your security this is the only time
                they will be available.</p>

                <p>In order to finish adding funds you need to send us a bank wire using the details below. Routfusion does not accept wire transfers from third party providers. Your transfer must originate from the account and financial institution you have gotten approved by us. Any funds originating from unapproved sources will be refused.</p>

                <p>Be sure to send exactly <b>${{amount}}</b> USD from your approved bank account.</p>

                <p><b>*Remember</b> we refund any wire transfer fees for deposits of $5000 or more!</p>
              </v-card-text>


              <v-container fluid grid-list-sm>
                <v-layout row wrap>
                  <v-flex v-for="item in chargeInfo" :key=item xs6>
                    <v-list three-line subheader>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>{{item.title}}</v-list-tile-title>
                          <v-list-tile-sub-title>{{item.data}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
          <v-flex>
            <v-card v-if="!depositSubmitted">
              <v-card-title primary-title>
                <div>
                  <h2 style="color: #3F3F44">Fund Account</h2>
                </div>
              </v-card-title>
              <v-card flat v-if="user.verified == false && user.verification_submitted == false">
                <v-card-text>
                  <div>
                    <v-btn fab small dark color="indigo" v-on:click="sendToVerification">
                      <v-icon dark>assignment</v-icon>
                    </v-btn>
                    <span style="color: #4285f4; fontSize: 16px;">Submit Verification Docs</span>
                    <br>
                    <br>
                    <div>
                      <p>You haven’t been verified yet</p>
                      <p>Please Submit your verification documents</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>


              <v-card flat v-if="user.verification_submitted == true && user.verified == false">
                <v-card-text>
                  <div>
                    <div>
                      <p>Your account is in the verification process.  This can take up to 24 hours</p>
                      <p>Please email <a href="mailto:info@routefusion.co">info@routefusion.co</a> if you have any questions or concerns.</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <v-card flat v-if="user.verification_submitted == true && user.verified == true && user.wyre_payment_method_id === null">
                <v-card-text>
                  <div>
                    <div>
                      <p>Your bank account is still being verified.</p>
                      <p>Please email <a href="mailto:info@routefusion.co">info@routefusion.co</a> if you have any questions or concerns.</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>


              <v-card flat v-if="!depositSubmitted && user.verification_submitted == true && user.verified == true && user.wyre_payment_method_id !== null">
                <v-card-text>
                  <div>
                    <v-form v-model="valid">
                      <v-text-field
                        label="Amount"
                        v-model="amount"
                        type="number"
                        prefix="$"
                        :rules="numberRules"
                        :counter="10"
                        required
                      ></v-text-field>
                      <v-text-field
                        name="message"
                        label="Message"
                        v-model="message"
                      ></v-text-field>
                      <v-btn color="primary" @click="submit" :disabled="!valid">submit</v-btn>
                    </v-form>
                  </div>
                </v-card-text>
              </v-card>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import Spinner from './Spinner';
  import SessionModal from './SessionModal';
  import axios from 'axios';
  import * as decode from 'jwt-decode';
  import numeral from 'numeral';

  export default {
    data () {
      return {
        userVerified: false,
        user: {
          verified: null
        },
        amount: '',
        message: '',
        loading: true,
        valid: false,
        depositSubmitted: false,
        numberRules: [
          v => !!v || 'Amount is required',
          v => (isNaN(v) === false) || 'Amount must be a number'
        ],
        chargeInfo: {

        },
        error: false
      }
    },

    components: {
      'spin-baby-spin': Spinner,
      'session-modal': SessionModal
    },

    methods: {
      refreshPage: function () {
        axios.all([this.getUser(), this.getAccount()])
          .then(axios.spread((user, accounts) => {
            this.user = user.data;
            this.account = accounts.data[0];
            this.loading = false;
          }))
          .catch((err) => {
            console.log(err)
          })
      },

      submit: function () {
        let payload = this.formatPayload()
        let userId = this.decodeToken().userId;

        this.loading = true
        axios.post(`${process.env.API_URL}/users/${userId}/deposit`, payload, this.setHeaders())
          .then((resp) => {
            console.log(resp)
            this.chargeInfo = this.formatChargeInfo(resp.data.chargeInfo)
            this.depositSubmitted = true;
            this.loading = false;
          })
          .catch((err) => {
            console.log(err)
            this.loading = false;
            this.error = true;
          })
      },

      formatPayload () {
        return {
          "destAmount": this.amount,
          "message": this.message
        }
      },

      formatChargeInfo (obj) {
        return [
          {title: "Bank", data: obj.wireDetails.bankAddress},
          {title: "Bank Phone Number", data: obj.wireDetails.bankPhone},
          {title: "Account Number", data: obj.wireDetails.accountNumber},
          {title: "Routing Number", data: obj.wireDetails.routingNumber},
          {title: "Beneficiary", data: obj.wireDetails.beneficiary},
          {title: "Beneficiary Address", data: obj.wireDetails.beneficiaryAddress}
        ]
      },

      decodeToken () {
        return decode(localStorage.token);
      },

      setHeaders: function () {
        let token = localStorage.token;
        return { headers: {'token': token } }
      },

      getUser: function () {
        let userId = this.decodeToken().userId;
        return axios.get(`${process.env.API_URL}/users/${userId}`, this.setHeaders())
      },

      sendToVerification: function () {
        window.open('http://onboard.routefusion.co', '_blank');
      }
    },

    created () {
       if (decode(localStorage.token).verified === 'true') {
        this.userVerified = true;
      }
      let self = this;

      this.getUser()
        .then((user) => {
          console.log(user)
          self.user = user.data;
          self.loading = false;
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
</script>

