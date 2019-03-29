<template>
  <v-app>
    <spin-baby-spin v-if="loading"></spin-baby-spin>
    <v-content>
      <v-container fluid grid-list-lg>
        <v-layout row wrap>
          <v-flex d-flex v-for="(card, index) in cards" :key="index" height="100%" xs12 md4>
            <v-card style="display: flex;" height="100%">
              <v-flex v-if="index === 0" d-flex style="flex-grow: 1; flex-direction: row;" class="green">
                <v-icon align-content-center justify-center x-large color="white" >
                  {{card.icon}}
                </v-icon>
              </v-flex>
              <v-flex v-if="index === 1" d-flex style="flex-grow: 1; flex-direction: row;" class="primary">
                <v-icon align-content-center justify-center large color="white" >
                  {{card.icon}}
                </v-icon>
              </v-flex>
              <v-flex v-if="index === 2 && card.icon.includes('warning')" d-flex style="flex-grow: 1; flex-direction: row;" class="orange">
                <v-icon align-content-center justify-center x-large color="white" >
                  {{card.icon}}
                </v-icon>
              </v-flex>
              <v-flex v-if="index === 2 && card.icon.includes('done')" d-flex style="flex-grow: 1; flex-direction: row;" class="green">
                <v-icon align-content-center justify-center large color="white" >
                  {{card.icon}}
                </v-icon>
              </v-flex>
              <v-flex d-flex pa-1 justify-center align-center style="flex-grow: 2;">
                <v-layout column justify-center align-center>
                  <v-flex v-if="index === 0 || index === 2" d-flex align-center style="font-size: 1.25em; color: gray; text-align: center">
                    {{card.data}}
                  </v-flex>
                  <v-flex v-if="index === 1" d-flex align-center style="font-size: 1.25em; color: gray;" >
                    Processing: {{card.data.processing}} <br> Completed: {{card.data.completed}}
                  </v-flex>
                  <v-flex v-if="index === 1" d-flex align-center style="padding-top: 0px; padding-bottom: 16px">
                    {{card.title}}
                  </v-flex>
                  <v-flex v-if="index !== 1" d-flex align-center>
                    {{card.title}}
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-card>
          </v-flex>
          <v-flex d-flex xs12 md9>
          <transaction-table @transaction-data="setTransactionData"></transaction-table>
          </v-flex>
          <v-flex d-flex>
            <v-card>
              <v-card-title>
                <span class="title font-weight-light" text-color="primary">Quick Pay</span>
              </v-card-title>
              <v-card-text d-flex style="display: flex; flex-direction: column;">
                <v-chip @click="goToPayments(benny.beneficiaryId)"  v-for="(benny, index) in frequentlyUsed" :key="index" small color="indigo lighten-1"  text-color="grey lighten-2" v-bind:style="{cursor: 'pointer'}">
                  <v-avatar color="indigo lighten-1" :style="{cursor: 'pointer'}">
                    <v-icon v-if="benny.type === 'personal'">account_circle</v-icon>
                    <v-icon v-if="benny.type === 'business'">business</v-icon>
                  </v-avatar>
                  <strong :style="{cursor: 'pointer'}">{{benny.companyName || benny.name}}</strong>
                </v-chip>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Spinner from "./Spinner.vue";
import axios from "axios";
import * as decode from "jwt-decode";
import numeral from "numeral";
import TransactionTable from "./dash-components/Transaction";

export default {
  data() {
    return {
      USDMXNRate: null,
      USDCNYRate: null,
      USDBRLRate: null,
      loading: true,
      balance: null,
      email: null,
      password: null,
      tableData: null,
      transactonTableElements: [],
      bennysPayed: {},
      frequentlyUsed: [],
      paymentsCompleted: 0,
      paymentsTotal: 0,
      paymentsProcessing: 0,
      cards: [
        {
          title: "Payments Made in USD",
          icon: "attach_money",
          data: 0
        },
        {
          title: "Status",
          icon: "data_usage",
          data: {
            processing: 0,
            completed: 0
          }
        },
        {
          title: "Account Status",
          icon: "done_outline",
          data: "Verified!"
        }
      ]
    };
  },

  components: {
    "spin-baby-spin": Spinner,
    "session-modal": SessionModal,
    "transaction-table": TransactionTable
  },

  methods: {
    goToPayments(beneficaryId) {
      this.$router.push(`/rf/payments?sendTo=${beneficaryId}`);
    },

    setTransactionData(data) {
      this.transactionData = data;
      this.digestTransactionData(data);
    },

    digestTransactionData(data) {
      data.forEach(transactionData => {
        if (transactionData.state === "created") this.addFrequentlyUsedCount(transactionData);

        if (transactionData.state === "completed") {
          this.cards[1].data.completed += 1;
          this.addFrequentlyUsedCount(transactionData);
          this.cards[0].data = Number(this.cards[0].data) + Number(transactionData.source_amount);
        }

        if (transactionData.state === "processing") {
          this.cards[1].data.processing += 1;
          this.addFrequentlyUsedCount(transactionData);
        }
      });
      this.cards[0].data = this.cards[0].data.toFixed(2);
      this.getFrequentBennys(this.bennysPayed);
    },

    addFrequentlyUsedCount(data) {
      if (this.bennysPayed[data.beneficiary]) {
        this.bennysPayed[data.beneficiary].paymentCount += 1;
      } else {
        this.bennysPayed[data.beneficiary] = {
          beneficiaryId: data.beneficiary_id,
          companyName: data.company_name,
          name: data.beneficiary,
          paymentCount: 1,
          type: data.type
        };
      }
      return;
    },

    getFrequentBennys(bennys) {
      var frequents = [];
      Object.keys(bennys).forEach((key, i, a) => frequents.push(bennys[key]));
      if (frequents.length > 10) frequents.splice(10);
      return (this.frequentlyUsed = frequents);
    },

    onTableUpdate(newValue) {
      this.tableData = newValue;
    },

    decodeToken() {
      return decode(localStorage.token);
    },

    setHeaders: function() {
      let token = localStorage.token;
      return { headers: { token: token } };
    }
  },

  created() {
    this.loading = false;
    var tokenData = this.decodeToken();
    if (tokenData.verified) return;
    if (!tokenData.verified) {
      Object.assign(this.cards[2], {
        icon: "warning",
        data: "Not verified"
      });
    }
  },

  events: {
    "stop-loading": function(msg) {
      this.loading = false;
    }
  }
};
</script>
