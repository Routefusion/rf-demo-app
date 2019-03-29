<template>
  <v-app>
    <spin-baby-spin v-if="loading"></spin-baby-spin>
    <v-content>
      <session-modal @stop-that-fool="loading = false"></session-modal>
      <v-container fluid v-if="loading == false">
        <v-layout row>
            <v-card>
              <v-card-title primary-title>
                <h2 style="color: #3F3F44">Transactions</h2>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  append-icon="search"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
              <v-data-table
                :headers="headers"
                :items="items"
                :pagination.sync="pagination"
                :search="search"
                class="elevation-1"
                disable-initial-sort
              >
                <template slot="items" slot-scope="props">
                  <td >{{ props.item.id }}</td>
                  <td class="text-xs-left">{{ props.item.beneficiary }}</td>
                  <td class="text-xs-left">{{ props.item.source_currency }}</td>
                  <td class="text-xs-left">${{ props.item.source_amount }}</td>
                  <td class="text-xs-left">{{ props.item.exchange_rate }}</td>
                  <td class="text-xs-left">{{ props.item.destination_currency }}</td>
                  <td class="text-xs-left">{{ props.item.destination_amount }}</td>
                  <td class="text-xs-left">{{ props.item.state }}</td>
                  <td class="text-xs-left">{{ props.item.created_at }}</td>
                </template>
                <template slot="no-data">
                  <v-alert :value="noData" color="error" icon="warning">
                    Sorry, nothing to display here :(
                  </v-alert>
                </template>
              </v-data-table>
            </v-card>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import Spinner from './Spinner.vue';
  import SessionModal from './SessionModal';
  import axios from 'axios';
  import * as decode from 'jwt-decode';
  import * as moment from 'moment';

  export default {
    created () {
      this.getData();
    },

    methods: {
      decodeToken () {
        return decode(localStorage.token);
      },

      setHeaders: function () {
        let token = localStorage.token;
        return { headers: {'token': token} }
      },

      getData: function () {
        // we set self to this becasue we use the spread callback and we cannot access the vue this inside of it
        let self = this;
        let userId = this.decodeToken().userId;
        let getTransactions = axios.get(`${process.env.API_URL}/users/${userId}/transactions/`, this.setHeaders())
        let getBeneficiaries = axios.get(`${process.env.API_URL}/users/${userId}/beneficiaries`, this.setHeaders())
        axios.all([getTransactions, getBeneficiaries])
          .then(axios.spread((transactions, beneficiaries) => {
            self.items = [];

            if (transactions.data.length ===  0) {
              self.noData = true;
            }

            transactions.data.forEach(transaction => {
              let fullBenName = '';
              let transactionDate = new Date(transaction.created_at);
              transactionDate = moment(transactionDate).utc().format("YYYY-MM-DD HH:mm:ss");

              if ( beneficiaries.data.find(benny => benny.id === transaction.beneficiary_id) ) {
                fullBenName = `${beneficiaries.data.find(benny => benny.id === transaction.beneficiary_id).first_name_on_account} ${beneficiaries.data.find(benny => benny.id === transaction.beneficiary_id).last_name_on_account}`
              }

              self.items.push({
                id: transaction.uuid,
                beneficiary: fullBenName,
                exchange_rate: transaction.exchange_rate,
                currency_pairs: transaction.currency_pairs,
                source_currency: transaction.source_currency,
                source_amount: transaction.source_amount,
                destination_currency: transaction.destination_currency,
                destination_amount: transaction.destination_amount,
                state: transaction.state,
                created_at: transactionDate + " UTC"
              });
            });
          }))
          .catch((err) => {
            self.noData = true;
            console.log(err)
          })
      }
    },

    components: {
      'spin-baby-spin': Spinner,
      'session-modal': SessionModal
    },

    data () {
      return {
        loading: false,
        noData: false,
        headers: [
          { text: 'Transaction ID', align: 'left', sortable: false, value: 'id'},
          { text: 'Beneficiary', value: 'beneficiary',  align: 'left', sortable: true },
          { text: 'Funded with', value: 'source_currency',  align: 'left', sortable: true },
          { text: 'Amount Funded', value: 'source_amount',  align: 'left', sortable: true },
          { text: 'Exchange Rate', value: 'exchange_rate',  align: 'left',sortable: true },
          { text: 'Settled in', value: 'destination_currency', align: 'left', sortable: true },
          { text: 'Settlment amount', value: 'destination_amount', align: 'left', sortable: true },
          { text: 'Status', value: 'state', align: 'left', sortable: true },
          { text: 'Created', value: 'created_at', align: 'left', sortable: true }
        ],
        pagination: {
          rowsPerPage: 10
        },
        items: [

        ],
        search: ''
      }
    }
  }
</script>
<style>
  .theme--light .input-group:not(.input-group--error):not(.input-group--focused):not(.input-group--disabled) .input-group__input .input-group__append-icon:not(:hover) {
    color: 'inherit'!important;
  }
</style>
