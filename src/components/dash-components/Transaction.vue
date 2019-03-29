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
import * as rf from "../../utils/sdk.js";
import * as moment from "moment";

export default {
  created() {
    this.getData();
  },

  methods: {
    getData: function() {
      rf
        .getBen()
        .then(benArr => {
          rf
            .getTransfer()
            .then(transactionArr => {
              this.items = [];
              if (transactionArr.length === 0) {
                this.noData = true;
              }
              transactionArr.forEach(transaction => {
                let fullBenName = "";
                let companyName = "";
                let type = "";
                let beneficiaryId = "";
                let transactionDate = new Date(transaction.created_at);
                transactionDate = moment(transactionDate)
                  .utc()
                  .format("YYYY-MM-DD HH:mm:ss");
                let benny = benArr.find(benny => benny.id === transaction.beneficiary_id);
                if (benny.id === transaction.beneficiary_id) {
                  fullBenName = `${benny.first_name_on_account} ${benny.last_name_on_account}`;
                  companyName = benny.company_name;
                  type = benny.type;
                  beneficiaryId = benny.id;
                }
                this.items.push({
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
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    },
    tableHeaders() {
      return [
        { text: "Beneficiary", value: "beneficiary", align: "left", sortable: false },
        { text: "Amount Funded", value: "source_amount", align: "left", sortable: false },
        { text: "Settlement Amount", value: "destination_amount", align: "left", sortable: false },
        { text: "Status", value: "state", align: "left", sortable: false },
        { text: "Created", value: "created_at", align: "left", sortable: false }
      ];
    }
  },

  data() {
    return {
      loading: false,
      noData: false,
      headers: this.tableHeaders(),
      pagination: {
        rowsPerPage: 8,
        sortBy: "created_at",
        descending: true
      },
      items: []
    };
  }
};
</script>
