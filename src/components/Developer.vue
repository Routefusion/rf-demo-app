<template>
  <v-app>
    <spin-baby-spin v-if="loading"></spin-baby-spin>
    <v-content>
    <session-modal @stop-that-fool="refreshPage()"></session-modal>
      <v-alert type="error" :value="error">Error</v-alert>

      <v-container fluid>
        <v-layout row>
          <v-flex>
            <v-card>
              <v-card-title primary-title>
                <div>
                  <h2 style="color: #3F3F44">API Keys</h2>
                </div>
              </v-card-title>
              <v-card-text>
                <div>
                  <p>
                    Our API keys consist of a Client Id and a Secret Key.
                    <br/>
                    You may generate dev api keys at your leisure. Once you are ready to move to production let us know at <a href=mailto:engineering@routefusion.co>engineering@routefusion.co</a>
                  </p>
                </div>
                <v-btn @click="createKey()">
                  Create key
                </v-btn>
                <div v-if="clientId !== null">
                  <br/>
                  <strong>Client ID:</strong> {{clientId}}
                  <br/>
                  <strong>Secret Key:</strong> {{secretKey}}
                </div>
              </v-card-text>
            </v-card>
            <v-data-table
              v-if="keys.length > 0"
              :headers="tableHeaders"
              :items="keys"
              hide-actions
              item-key="id"
            >
              <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                  <td>{{ props.item.id }}</td>
                  <td class="text-xs-left">{{ props.item.created_at.replace(/T\d*:\d*:\d*.\d*Z/, '') }}</td>
                </tr>
              </template>
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <td class="text-xs-left pt-2"><strong>Secret:</strong> {{props.item.secretKey}}</td>
                  <td><v-btn d-flex right @click="removeKey(props.item.id)">Revoke Key</v-btn></td>
                </v-card>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import axios from 'axios';
import SessionModal from './SessionModal';
import * as decode from "jwt-decode";

export default {
  data () {
    return {
      clientId: null,
      secretKey: null,
      loading: false,
      error: false,
      keys: null,
      tableHeaders: [
        {
          text: 'Client ID',
          align: 'left',
          sortable: false,
          value: 'id'
        },
        // {
        //   text: 'Secret Key ID',
        //   align: 'left',
        //   sortable: false,
        //   value: 'secret'
        // },
        { text: 'Date Created',
          value: 'created_at',
          sortable: true
        }
      ]
    }
  },

  components: {
    'session-modal': SessionModal
  },

  methods: {
    decodeToken () {
      return decode(localStorage.token);
    },

    setHeaders () {
      let token = localStorage.token;
      return { headers: {'token': token } }
    },

    createKey: function () {
      let userId = this.decodeToken().userId;

      axios.post(`${process.env.API_URL}/users/${userId}/clients`, null, this.setHeaders())
        .then(resp => {
          this.clientId = resp.data.id;
          this.secretKey = resp.data.secret;
          this.keys.push({created_at: resp.data.created_at, id: resp.data.id, secretKey: resp.data.secret})
        })
        .catch(err => console.log(err))
    },

    removeKey: function (id) {
      let userId = this.decodeToken().userId;
      console.log('id', id);
      axios.delete(`${process.env.API_URL}/users/${userId}/clients/${id}`, this.setHeaders())
        .then(resp => {
          // filter out deleted key
          let keysArr = this.keys.filter(function (key) {
            return key.id !== id
          })
          //set new props array
          this.keys = keysArr;
        })
        .catch(err => {
          console.log(err);
        })

    }
  },

  created () {
    let userId = this.decodeToken().userId;

    axios.get(`${process.env.API_URL}/users/${userId}/clients`, this.setHeaders())
      .then(resp => {
        if (!(resp.data instanceof Array)) this.keys = [];
        this.keys = resp.data;
      })
      .catch(err => {
        console.log('No keys error', err);
        this.keys = [];
      })
  },

}
</script>
