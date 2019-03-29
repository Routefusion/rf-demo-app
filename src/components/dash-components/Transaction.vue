<template>
  <v-card>
    <v-card-title primary-title>
      <span class="title font-weight-light" text-color="primary">Recent Transactions</span>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="items"
      :pagination.sync="pagination"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-left">{{ props.item.beneficiary }}</td>
        <td class="text-xs-left">${{ props.item.source_amount }}</td>
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
</template>

<script>
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


            self.items = []

            if (transactions.data.length ===  0) {
              self.noData = true;
            }

            transactions.data.forEach(transaction => {
              let fullBenName = '';
              let companyName = '';
              let type = '';
              let beneficiaryId = '';
              let transactionDate = new Date(transaction.created_at);
              transactionDate = moment(transactionDate).utc().format("YYYY-MM-DD HH:mm:ss");

              let benny = beneficiaries.data.find(benny => benny.id === transaction.beneficiary_id);

              if (benny.id === transaction.beneficiary_id) {
                fullBenName = `${benny.first_name_on_account} ${benny.last_name_on_account}`;
                companyName = benny.company_name;
                type = benny.type;
                beneficiaryId = benny.id;
              }

              self.items.push({
                id: transaction.id,
                type: type,
                beneficiary_id: beneficiaryId,
                beneficiary: fullBenName,
                company_name: companyName,
                destination_currency: transaction.destination_currency,
                destination_amount: transaction.destination_amount,
                source_amount: transaction.source_amount,
                state: transaction.state,
                created_at: transactionDate + " UTC"
              });
            });
            self.$emit('transaction-data', self.items);
          }))
          .catch((err) => {
            self.noData = true;
            console.log(err)
          })
      },
      tableHeaders () {
        return [
          { text: 'Beneficiary', value: 'beneficiary',  align: 'left', sortable: false },
          { text: 'Amount Funded', value: 'source_amount', align: 'left', sortable: false },
          { text: 'Settlement Amount', value: 'destination_amount', align: 'left', sortable: false },
          { text: 'Status', value: 'state', align: 'left', sortable: false },
          { text: 'Created', value: 'created_at', align: 'left', sortable: false }
        ];
      }
    },

    data () {
      return {
        loading: false,
        noData: false,
        headers: this.tableHeaders(),
        pagination: {
          rowsPerPage: 8,
          sortBy: 'created_at',
          descending: true
        },
        items: [

        ]
      }
    }
  }
</script>