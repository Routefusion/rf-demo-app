<template>
  <v-content>
    <spin-baby-spin v-if="loading"></spin-baby-spin>
    <!-- TODO this needs to be a better error -->
    <v-alert type="error" :value="error">
      There was an error, please contact RouteFusion support at <strong>support@routefusion.co</strong> if the problem continues.
    </v-alert>
    <v-container fluid v-if="addNewBeneficiary === false && editBeneficiary === false">
      <v-layout row>
        <v-flex>
          <v-card>
            <v-alert type="success" :value="createSuccess">
              Beneficiary created!
            </v-alert>

            <v-alert type="success" :value="updateSuccess">
              Beneficiary updated!
            </v-alert>

            <v-alert type="success" :value="userVerifySubmitted">
              Docs Submitted Succesfully!  Create a beneficiary to send your first payment!
            </v-alert>

            <v-card-title primary-title>
              <div>
                <h2 style="color: #3F3F44">Beneficiaries</h2>
              </div>
            </v-card-title>
            <v-tabs grow slider-color="primary lighten-2">
              <v-tab v-for="n in tabs" :key="n.id">
                {{n.title}}
              </v-tab>
              <v-tab-item v-for="n in tabs" :key="n.id">
                <v-card flat>
                  <v-card-text>
                    <div>
                      <!-- when button is clicked it does the opposite boolean of addNewBeneficiary data field-->
                      <v-btn fab small dark color="primary" v-on:click="addNewBeneficiary = !addNewBeneficiary">
                        <v-icon dark>add</v-icon>
                      </v-btn>
                      <span style="color: #3F3F44; fontSize: 16px;">ADD NEW BENEFICIARY</span>
                      <!-- This eventually needs to check if the Accounts object that comes back from
                          the server is empty, if it is, then it needs to display this-->
                      <br>
                      <br>
                      <div v-if="listItems.length < 2">
                        <p>You haven’t added any beneficiaries yet.</p>
                        <p>Create a new beneficiary to send and recieve payments.</p>
                      </div>
                    </div>
                    <v-list two-line>
                      <template v-for="(item, index) in listItems[n.id]">
                        <v-subheader v-if="item.header" :key="item.header">{{ item.header }}</v-subheader>
                        <v-divider v-else-if="item.divider" :inset="item.inset" :key="index"></v-divider>
                        <v-list-tile avatar v-else :key="item.title">
                          <v-list-tile-avatar>
                            <v-icon v-if="item.type === 'personal'" color="primary">account_circle</v-icon>
                            <v-icon v-if="item.type === 'business'" color="primary">business</v-icon>
                          </v-list-tile-avatar>
                          <v-list-tile-content>
                            <v-list-tile-title v-html="item.title"></v-list-tile-title>
                            <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
                          </v-list-tile-content>
                          <v-list-tile-content v-if="!item.verified" class="verified-symbol">
                            <v-tooltip
                              left
                              content-class="toolytippy"
                              open-delay="150"
                              style="align-self: flex-end"
                            >
                              <v-btn @click="getBeneficiary(item.beneficaryId)" slot="activator" icon ripple>
                                <v-icon style="color: #FF0000;" >error</v-icon>
                              </v-btn>
                              <span>{{item.tooltip}}</span>
                            </v-tooltip>
                          </v-list-tile-content>

                          <v-list-tile-content v-if="item.verified" class="verified-symbol">
                            <v-tooltip
                              left
                              style="align-self: flex-end"
                            >
                              <v-btn @click="sendMoney(item.beneficaryId)" slot="activator" icon ripple>
                                <v-icon title="Verified" style="color: #008000;">check_circle</v-icon>
                              </v-btn>
                              <span>{{item.tooltip}}</span>
                            </v-tooltip>
                          </v-list-tile-content>
                          <v-list-tile-action class="mobile-tile-action">
                            <v-menu bottom left>
                              <v-btn icon slot="activator" dark>
                                <v-icon color="primary">more_vert</v-icon>
                              </v-btn>
                              <v-list>
                                <v-list-tile v-if="item.verified" @click="sendMoney(item.beneficaryId)">
                                  <v-list-tile-title style="color: #3F3F44">Send Money</v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="!item.verified" @click="getBeneficiary(item.beneficaryId)">
                                  <v-list-tile-title style="color: #3F3F44">Edit Beneficiary</v-list-tile-title>
                                </v-list-tile>
                              </v-list>
                            </v-menu>
                          </v-list-tile-action>
                        </v-list-tile>
                      </template>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container fluid v-if="addNewBeneficiary">
      <v-layout row>
        <v-flex>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h2 style="color: #3F3F44">Add New Beneficiary</h2>
              </div>
              <v-spacer></v-spacer>
              <v-btn flat v-on:click="cancelForm()">Cancel</v-btn>
            </v-card-title>
            <v-stepper v-model="e1">
              <v-stepper-header>
                <v-stepper-step step="1" :complete="e1 > 1">Beneficiary Info</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="2" :complete="e1 > 2">Bank Account Info</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="3">Verify</v-stepper-step>
              </v-stepper-header>
              <v-stepper-items>
                <v-stepper-content step="1">
                  <v-card flat class="mb-2">
                    <span style="color: #3F3F44">First, select the type of beneficiary you would like to add.</span>
                      <v-form v-model="valid">
                        <v-radio-group v-model="beneficiary.type" row color="primary">
                          <v-radio label="Business" value="business" color="primary" ></v-radio>
                          <v-radio label="Personal" value="personal" color="primary"></v-radio>
                        </v-radio-group>
                      <div v-if="beneficiary.type">
                        <p>Second, fill in information fields below.</p>
                          <v-select
                            label="Account Origin"
                            :items="countries"
                            v-model="beneficiary.country"
                            class="select-drop-down"
                            item-value="countryAbbr"
                            item-text="name"
                            autocomplete
                          >
                            <template slot="item" slot-scope="data">
                              <flag squared="false" :iso="data.item.countryAbbr"></flag>&nbsp;{{data.item.name}}
                            </template>
                          </v-select>
                          <v-text-field v-if="beneficiary.type == 'business'"
                            label="Company Name"
                            v-model="beneficiary.companyName"
                            :rules="rules.name"
                          ></v-text-field>
                          <v-text-field
                            label="First Name"
                            v-model="beneficiary.firstName"
                            :rules="rules.name"
                          ></v-text-field>
                          <v-text-field
                            label="Last Name"
                            v-model="beneficiary.lastName"
                            :rules="rules.name"
                          ></v-text-field>
                          <v-text-field
                            label="Phone Number"
                            v-model="beneficiary.phoneNumber"
                            type="number"
                          ></v-text-field>
                          <v-text-field
                            label="Email"
                            v-model="beneficiary.email"
                            :rule="rules.email"
                          ></v-text-field>
                      </div>
                    </v-form>
                  </v-card>
                  <v-btn v-if="beneficiary.type" :disabled="!valid" color="primary" @click.native="e1 = 2">Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content step="2">
                  <v-card flat class="mb-5">
                    <p>Third, fill in bank account info below.</p>
                    <v-form v-model="valid2">
                      <v-text-field
                        label="Account Number"
                        v-if="beneficiary.country === 'US' || beneficiary.country === 'AU' || beneficiary.country === 'CN' || beneficiary.country === 'PH' || beneficiary.country === 'MX'"
                        v-model="beneficiary.accountNumber"
                        :rules="rules.accountNumber"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'MX'"
                        label="Clabe"
                        v-model="beneficiary.clabe"
                        :counter="18"
                        :rules="rules.clabe"
                      ></v-text-field>
                      <v-text-field
                        label="IBAN"
                        v-if="beneficiaryCurrency === 'EUR' || beneficiaryCurrency === 'GBP'"
                        v-model="beneficiary.accountNumber"
                        :rules="rules.iban"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'GB' || beneficiary.country === 'US' || beneficiary.country === 'PH'"
                        v-model="beneficiary.routingNumber"
                        :rules="beneficiary.country === 'GB' ? rules.sortCode : rules.routingNumber"
                      >
                        <div slot="label" v-if="beneficiary.country === 'GB'">
                          Sort Code
                        </div>
                        <div slot="label" v-if="beneficiary.country === 'US' || beneficiary.country === 'PH'">
                          Routing Number
                        </div>
                      </v-text-field>
                      <v-text-field
                        label="Bank-State-Branch number (bsb number)"
                        v-if="beneficiary.country === 'AU'"
                        v-model="beneficiary.bsb"
                        :rules="rules.bsb"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiaryCurrency === 'EUR' || beneficiaryCurrency === 'GBP' || beneficiaryCurrency === 'MXN' || beneficiaryCurrency === 'PHP'"
                        label="Swift BIC Code"
                        v-model="beneficiary.swiftBIC"
                        :rules="rules.swiftBIC"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'CN' || beneficiary.country === 'BR' || beneficiary.country === 'PH'"
                        label="Bank Name"
                        v-model="beneficiary.bankName"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'CN'"
                        label="Branch Name"
                        v-model="beneficiary.branchName"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'CN'"
                        label="Bank City"
                        v-model="beneficiary.bankCity"
                        :rules="rules.required"
                      ></v-text-field>
                        <v-text-field
                        v-if="beneficiary.country === 'CN'"
                        label="Bank Province"
                        v-model="beneficiary.bankProvince"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'BR'"
                        label="Bank Code"
                        v-model="beneficiary.bankCode"
                        :counter="3"
                        :rules="rules.bankCode"
                      ></v-text-field>
                        <v-text-field
                        v-if="beneficiary.country === 'BR'"
                        label="Branch Code"
                        v-model="beneficiary.branchCode"
                        :counter="4"
                        :rules="rules.branchCode"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'BR' && beneficiary.type === 'personal'"
                        label="CPF"
                        v-model="beneficiary.cpf"
                        :counter="11"
                        :rules="rules.cpf"
                      ></v-text-field>
                      <!-- Does CNPJ always end in '-00'? If so we should change this field to always incude -00  -->
                      <v-text-field
                        v-if="beneficiary.country === 'BR' && beneficiary.type === 'business'"
                        label="CNPJ"
                        v-model="beneficiary.cnpj"
                        :counter="14"
                        :rules="rules.cnpj"
                      ></v-text-field>
                      <v-select
                        v-if="beneficiary.country === 'AU' || beneficiary.country === 'PH'"
                        label="Beneficiary Territoy"
                        :rules="rules.required"
                        :items="regions[beneficiary.country]"
                        v-model="beneficiary.stateProvince"
                        class="select-drop-down"
                        item-value="id"
                        item-text="name"
                        autocomplete
                      ></v-select>
                      <v-text-field
                        v-if="beneficiaryCurrency === 'EUR' || beneficiaryCurrency === 'GBP' || beneficiaryCurrency === 'AUD' || beneficiaryCurrency === 'PHP'"
                        label="Beneficiary City"
                        v-model="beneficiary.city"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiaryCurrency === 'EUR' || beneficiaryCurrency === 'GBP' || beneficiaryCurrency === 'AUD' || beneficiaryCurrency === 'PHP'"
                        label="Beneficiary Street Address"
                        v-model="beneficiary.address"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'AU'"
                        label="Beneficiary Postal Code"
                        v-model="beneficiary.postalCode"
                        :rules="rules.required"
                      ></v-text-field>
                    </v-form>
                  </v-card>
                  <v-btn :disabled="!valid2" color="primary" @click.native="e1 = 3">Continue</v-btn>
                  <v-btn flat @click.native="e1 = 1">Back</v-btn>
                </v-stepper-content>
                <v-stepper-content step="3">
                  <v-card flat class="mb-5">
                    <v-list three-line subheader>
                      <v-subheader>Verify Data Below is Correct</v-subheader>
                      <v-list-tile v-if="beneficiary.type === 'business'">
                        <v-list-tile-content>
                          <v-list-tile-title>Company Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.companyName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>First Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.firstName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Last Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.lastName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.phoneNumber">
                        <v-list-tile-content>
                          <v-list-tile-title>Phone Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.phoneNumber}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.email">
                        <v-list-tile-content>
                          <v-list-tile-title>Email</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.email}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.country">
                        <v-list-tile-content>
                          <v-list-tile-title>Account Origin</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.country}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.bsb">
                        <v-list-tile-content>
                          <v-list-tile-title>BSB Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.bsb}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.swiftBIC">
                        <v-list-tile-content>
                          <v-list-tile-title>Beneficiary Bank Swift BIC</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.swiftBIC}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.city">
                        <v-list-tile-content>
                          <v-list-tile-title>Beneficiary City</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.city}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.address">
                        <v-list-tile-content>
                          <v-list-tile-title>Beneficiary Address</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.address}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.accountNumber">
                        <v-list-tile-content>
                          <v-list-tile-title>Account Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.accountNumber}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.routingNumber">
                        <v-list-tile-content>
                          <v-list-tile-title v-if="beneficiary.country !== 'GB'">Routing Number</v-list-tile-title>
                          <v-list-tile-title v-if="beneficiary.country === 'GB'">Sort Code</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.routingNumber}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.clabe">
                        <v-list-tile-content>
                          <v-list-tile-title>Clabe</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.clabe}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.bankName">
                        <v-list-tile-content>
                          <v-list-tile-title>Bank Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.bankName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.branchName">
                        <v-list-tile-content>
                          <v-list-tile-title>Branch Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.branchName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.bankCity">
                        <v-list-tile-content>
                          <v-list-tile-title>Bank City</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.bankCity}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.bankProvince">
                        <v-list-tile-content>
                          <v-list-tile-title>Bank Province</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.bankProvince}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.bankCode">
                        <v-list-tile-content>
                          <v-list-tile-title>Bank Code</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.bankCode}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.branchCode">
                        <v-list-tile-content>
                          <v-list-tile-title>Branch Code</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.branchCode}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.cpf">
                        <v-list-tile-content>
                          <v-list-tile-title>CPF</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.cpf}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.cnpj">
                        <v-list-tile-content>
                          <v-list-tile-title>CNPJ</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.cnpj}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
                  </v-card>
                  <v-btn color="primary" @click.native="submitForm">Submit</v-btn>
                  <v-btn flat @click.native="e1 = 2">Back</v-btn>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container fluid v-if="editBeneficiary">
      <v-layout row>
        <v-flex>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h2 style="color: #3F3F44">Edit Beneficiary</h2>
              </div>
              <v-spacer></v-spacer>
              <v-btn flat v-on:click="cancelForm()">Cancel</v-btn>
            </v-card-title>
            <v-stepper v-model="e2">
              <v-stepper-header>
                <v-stepper-step step="1" :complete="e2 > 1">Edit Beneficiary</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="2" :complete="e2 > 2">Verify</v-stepper-step>
              </v-stepper-header>
              <v-stepper-items>
                <v-stepper-content step="1">
                  <v-card flat class="mb-2">
                    <br/>
                    <v-form v-model="valid3">
                      <v-text-field v-if="beneficiary.type === 'personal'"
                        label="Beneficiary Type"
                        value="Personal"
                        disabled
                      ></v-text-field>
                      <v-text-field v-if="beneficiary.type === 'business'"
                        label="Beneficiary Type"
                        value="Business"
                        disabled
                      ></v-text-field>
                      <v-text-field v-if="beneficiary.type === 'business'"
                        label="Company Name"
                        v-model="beneficiary.companyName"
                        :rules="rules.name"
                      ></v-text-field>
                      <v-text-field
                        label="First Name"
                        v-model="beneficiary.firstName"
                        :rules="rules.name"
                      ></v-text-field>
                      <v-text-field
                        label="Last Name"
                        v-model="beneficiary.lastName"
                        :rules="rules.name"
                      ></v-text-field>
                      <v-text-field
                        label="Phone Number"
                        v-model="beneficiary.phoneNumber"
                        :rules="rules.phone"
                      ></v-text-field>
                      <v-text-field
                        label="Email"
                        v-model="beneficiary.email"
                        :rule="rules.email"
                      ></v-text-field>
                      <v-text-field
                        label="Account Origin"
                        :items="countries"
                        v-model="beneficiary.country"
                        item-value="text"
                        disabled
                      ></v-text-field>
                      <v-text-field
                        label="Account Number"
                        v-if="beneficiaryCurrency !== 'MXN' && beneficiaryCurrency !== 'EUR' && beneficiaryCurrency !== 'GBP'"
                        v-model="beneficiary.accountNumber"
                        :rules="rules.accountNumber"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'GB' || beneficiary.country === 'US' || beneficiary.country === 'PH'"
                        v-model="beneficiary.routingNumber"
                        :rules="beneficiary.country === 'GB' ? rules.sortCode : rules.routingNumber"
                      >
                        <div slot="label" v-if="beneficiary.country === 'GB'">
                          Sort Code
                        </div>
                        <div slot="label" v-if="beneficiary.country === 'US' || beneficiary.country === 'PH'">
                          Routing Number
                        </div>
                      </v-text-field>
                      <v-text-field
                        label="IBAN"
                        v-if="beneficiaryCurrency === 'EUR' || beneficiaryCurrency === 'GBP'"
                        :append-icon="beneficiary.ibanError ? 'error' : ''"
                        v-model="beneficiary.accountNumber"
                        :rules="rules.iban"
                      ></v-text-field>
                      <v-text-field
                        label="Bank-State-Branch number (bsb number)"
                        v-if="beneficiary.country === 'AU'"
                        v-model="beneficiary.bsb"
                        :rules="rules.bsb"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiaryCurrency === 'EUR' || beneficiaryCurrency === 'GBP' || beneficiaryCurrency === 'MXN' || beneficiaryCurrency === 'PHP'"
                        label="Swift BIC Code"
                        :append-icon="beneficiary.swiftError ? 'error' : ''"
                        v-model="beneficiary.swiftBIC"
                        :rules="rules.swiftBIC"
                      ></v-text-field>
                      <v-select
                        v-if="beneficiary.country === 'AU' || beneficiary.country === 'PH'"
                        label="Beneficiary Territoy"
                        :items="regions[beneficiary.country]"
                        v-model="beneficiary.stateProvince"
                        class="select-drop-down"
                        item-value="id"
                        item-text="name"
                        autocomplete
                      ></v-select>
                      <v-text-field
                        v-if="beneficiaryCurrency == 'EUR' || beneficiaryCurrency == 'GBP' || beneficiaryCurrency === 'AUD' || beneficiaryCurrency === 'PHP'"
                        label="Beneficiary Street Address"
                        v-model="beneficiary.address"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiaryCurrency == 'EUR' || beneficiaryCurrency == 'GBP' || beneficiaryCurrency === 'AUD' || beneficiaryCurrency === 'PHP'"
                        label="Beneficiary City"
                        v-model="beneficiary.city"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'AU'"
                        label="Beneficiary Postal Code"
                        v-model="beneficiary.postalCode"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'MX'"
                        label="Clabe"
                        :append-icon="beneficiary.clabeError ? 'error' : ''"
                        v-model="beneficiary.clabe"
                        :counter="18"
                        :rules="rules.clabe"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'CN' || beneficiary.country === 'PH' || beneficiary.country === 'BR'"
                        label="Bank Name"
                        v-model="beneficiary.bankName"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'CN'"
                        label="Branch Name"
                        v-model="beneficiary.branchName"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'CN'"
                        label="Bank City"
                        v-model="beneficiary.bankCity"
                        :rules="rules.required"
                      ></v-text-field>
                        <v-text-field
                        v-if="beneficiary.country === 'CN'"
                        label="Bank Province"
                        v-model="beneficiary.bankProvince"
                        :rules="rules.required"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'BR'"
                        label="Bank Code"
                        v-model="beneficiary.bankCode"
                        :counter="3"
                        :rules="rules.bankCode"
                      ></v-text-field>
                        <v-text-field
                        v-if="beneficiary.country === 'BR'"
                        label="Branch Code"
                        v-model="beneficiary.branchCode"
                        :counter="4"
                        :rules="rules.branchCode"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'BR' && beneficiary.type === 'personal'"
                        label="CPF"
                        v-model="beneficiary.cpf"
                        :counter="11"
                        :rules="rules.cpf"
                      ></v-text-field>
                      <v-text-field
                        v-if="beneficiary.country === 'BR' && beneficiary.type === 'business'"
                        label="CNPJ"
                        v-model="beneficiary.cnpj"
                        :counter="14"
                        :rules="rules.cnpj"
                      ></v-text-field>
                    </v-form>
                  </v-card>
                  <v-btn :disabled="!valid3" color="primary" @click.native="e2 = 2">Continue</v-btn>
                </v-stepper-content>

                <v-stepper-content step="2">
                  <v-card flat class="mb-5">
                    <v-list three-line subheader>
                      <v-subheader>Verify Data Below is Correct</v-subheader>
                      <v-list-tile v-if="beneficiary.type === 'business'">
                        <v-list-tile-content>
                          <v-list-tile-title>Company Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.companyName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>First Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.firstName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Last Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.lastName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.phoneNumber">
                        <v-list-tile-content>
                          <v-list-tile-title>Phone Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.phoneNumber}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.email">
                        <v-list-tile-content>
                          <v-list-tile-title>Email</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.email}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.country">
                        <v-list-tile-content>
                          <v-list-tile-title>Account Origin</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.country}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.accountNumber">
                        <v-list-tile-content>
                          <v-list-tile-title>Account Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.accountNumber}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.routingNumber">
                        <v-list-tile-content>
                          <v-list-tile-title v-if="beneficiary.country !== 'GB'">Routing Number</v-list-tile-title>
                          <v-list-tile-title v-if="beneficiary.country === 'GB'">Sort Code</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.routingNumber}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.bsb">
                        <v-list-tile-content>
                          <v-list-tile-title>BSB Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.bsb}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.swiftBIC">
                        <v-list-tile-content>
                          <v-list-tile-title>Beneficiary Bank Swift BIC</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.swiftBIC}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.city">
                        <v-list-tile-content>
                          <v-list-tile-title>Beneficiary City</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.city}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.address">
                        <v-list-tile-content>
                          <v-list-tile-title>Beneficiary Address</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.address}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.clabe">
                        <v-list-tile-content>
                          <v-list-tile-title>Clabe</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.clabe}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.bankName">
                        <v-list-tile-content>
                          <v-list-tile-title>Bank Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.bankName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.branchName">
                        <v-list-tile-content>
                          <v-list-tile-title>Branch Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.branchName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.bankCity">
                        <v-list-tile-content>
                          <v-list-tile-title>Bank City</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.bankCity}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.bankProvince">
                        <v-list-tile-content>
                          <v-list-tile-title>Bank Province</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.bankProvince}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.bankCode">
                        <v-list-tile-content>
                          <v-list-tile-title>Bank Code</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.bankCode}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.branchCode">
                        <v-list-tile-content>
                          <v-list-tile-title>Branch Code</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.branchCode}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.cpf">
                        <v-list-tile-content>
                          <v-list-tile-title>CPF</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.cpf}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="beneficiary.cnpj">
                        <v-list-tile-content>
                          <v-list-tile-title>CNPJ</v-list-tile-title>
                          <v-list-tile-sub-title>{{beneficiary.cnpj}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
                  </v-card>
                  <v-btn color="primary" v-if="!editBeneficiary" @click.native="submitForm">Submit</v-btn>
                  <v-btn color="primary" v-if="editBeneficiary" @click.native="updateBeneficiary">Update</v-btn>
                  <v-btn flat @click.native="e2 = 1">Back</v-btn>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
import Spinner from "./Spinner.vue";
import axios from "axios";
import * as decode from "jwt-decode";
import * as countryRegions from "../lib/countryRegions.js";
import * as countries from "../lib/countries";

export default {
  data() {
    return {
      loading: true,
      editBeneficiary: false,
      userVerifySubmitted: null,
      createSuccess: false,
      updateSuccess: false,
      error: false,
      valid: false,
      valid2: false,
      valid3: false,
      menu: false,
      e1: 0,
      e2: 0,
      countries: countries,
      countryMap: {
        AT: { name: "Austria", currencyCode: "EUR" },
        AU: { name: "Australia", currencyCode: "AUD" },
        BE: { name: "Belgium", currencyCode: "EUR" },
        BR: { name: "Brazil", currencyCode: "BRL" },
        CN: { name: "China", currencyCode: "CNY" },
        CY: { name: "Cyprus", currencyCode: "EUR" },
        EE: { name: "Estonia", currencyCode: "EUR" },
        FI: { name: "Finland", currencyCode: "EUR" },
        FR: { name: "France", currencyCode: "EUR" },
        DE: { name: "Germany", currencyCode: "EUR" },
        GR: { name: "Greece", currencyCode: "EUR" },
        IE: { name: "Ireland", currencyCode: "EUR" },
        IT: { name: "Italy", currencyCode: "EUR" },
        LV: { name: "Latvia", currencyCode: "EUR" },
        LT: { name: "Lithuania", currencyCode: "EUR" },
        LU: { name: "Luxembourg", currencyCode: "EUR" },
        MT: { name: "Malta", currencyCode: "EUR" },
        MX: { name: "Mexico", currencyCode: "MXN" },
        NL: { name: "Netherlands", currencyCode: "EUR" },
        PT: { name: "Portugal", currencyCode: "EUR" },
        SK: { name: "Slovakia", currencyCode: "EUR" },
        SI: { name: "Slovenia", currencyCode: "EUR" },
        ES: { name: "Spain", currencyCode: "EUR" },
        GB: { name: "United Kingdom", currencyCode: "GBP" },
        US: { name: "United States", currencyCode: "USD" },
        PH: { name: "Republic of the Philippines", currencyCode: "PHP" }
      },
      regions: countryRegions,
      beneficiary: {
        defaultCurrency: "EUR",
        country: null,
        type: undefined
      },
      addNewBeneficiary: false,
      tabs: [
        {
          id: 0,
          title: "ALL",
          content: "Ciao"
        },
        {
          id: 1,
          title: "BUSINESS",
          content: "Hola"
        },
        {
          id: 2,
          title: "PERSONAL",
          content: "Bonjour"
        }
      ],
      //TODO We need better validation, rules are not enough.
      rules: {
        phone: [v => !v || !/[a-zA-Z\[-\]={}\/\\\|?><!@#$%^&*;'"]+/.test(v) || "Field contains invalid characters"],
        required: [v => !!v || "Field is required"],
        name: [v => !!v || "Name is required", v => (v && v.length <= 60) || "Name must be less than 60 characters"],
        routingNumber: [v => !!v || "Must provide routing number", v => !/[a-zA-Z]/.test(v) || "Must contain only numbers", v => (v && v.length === 9) || "Routing number must be 9 digits"],
        sortCode: [v => !!v || "Must provide sort code", v => !/[a-zA-Z]/.test(v) || "Must contain only numbers", v => (v && v.length === 6) || "Sort code must be 6 digits"],
        accountNumber: [v => !!v || "Must provide account number", v => !/[a-zA-Z]/.test(v) || "Must contain only numbers"],
        iban: [
          v => !!v || "Must provide IBAN",
          v => (!!v && /^[A-Za-z]{2}/.test(v)) || "First 2 characters much be country code e.g. FR7630006000011234567890189",
          v => (!!v && !/[\[-\]={}\/\\\|?><!@#$%^&*;'"]+/.test(v)) || "Only letters and numbers are valid"
        ],
        bankCode: [v => !!v || "Bank Code required", v => (v && v.length === 3) || "Bank Code can only be 3 digits"],
        bsb: [v => !!v || "Bank Code required", v => (v && v.length === 6) || "BSB number can only be 6 digits"],
        swiftBIC: [v => !!v || "Swift or BIC Code is required", v => (v && v.length === 8) || v.length === 11 || "Swift/BIC code can only be 8 or 11 digits"],
        branchCode: [v => !!v || "Branch Code required", v => (v && v.length === 4) || "Branch Code can only be 4 digits"],
        clabe: [v => !/[a-zA-Z]/.test(v) || "Must contain only numbers", v => !!v || "Clabe is required", v => (v && v.length === 18) || "A Clabe number is 18 digits long"],
        cpf: [v => !/[a-zA-Z]/.test(v) || "Must contain only numbers", v => !!v || "CPF (Natural Persons Register) is required", v => (v && v.length == 11) || "A CPF number is 11 digits long"],
        cnpj: [
          v => !/[a-zA-Z]/.test(v) || "Must contain only numbers",
          v => !!v || "CPNJ (National Juridicial Persons Register) is required",
          v => (v && v.length == 14) || "A CNPJ number is 14 digits long"
        ],
        //TODO fix email rule, does not seem to be doing anything
        email: [v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || "E-mail must be valid"]
      },
      listItems: [[{ id: 0, title: "ALL", header: "Beneficiaries" }], [{ id: 0, title: "BUSINESS", header: "Beneficiaries" }], [{ id: 0, title: "PERSONAL", header: "Beneficiaries" }]],
      verificationErrors: null
    };
  },

  components: {
    "spin-baby-spin": Spinner
  },

  created() {
    // gets beneficiaries then sets up the data structure for the list
    if (this.$route.query.userVerifySubmitted === true) {
      this.userVerifySubmitted = true;
    }

    this.getUserBeneficiaries()
      .then(resp => {
        let business = resp.filter(b => {
          if (b.type === "business") return b;
        });
        let individual = resp.filter(b => {
          if (b.type === "personal") return b;
        });
        let all = resp;
        let arr;

        this.getBeneficiaryErrors(all).then(beneficiaryErrors => {
          for (var n = 0; n < 3; n++) {
            if (n === 0) {
              arr = all;
            } else if (n === 1) {
              arr = business;
            } else {
              arr = individual;
            }

            this.setListItems(arr, n);
          }
        });
      })
      .catch(err => console.log(err));
  },

  mounted() {
    this.loading = false;
  },

  watch: {
    createSuccess: function(newVal, oldVal) {
      if (newVal) {
        setTimeout(
          function() {
            this.createSuccess = false;
          }.bind(this),
          10000
        );
      }
    },
    updateSuccess: function(newVal, oldVal) {
      if (newVal) {
        setTimeout(
          function() {
            this.updateSuccess = false;
          }.bind(this),
          10000
        );
      }
    },
    error: function(newVal, oldVal) {
      if (newVal) {
        setTimeout(
          function() {
            this.error = false;
          }.bind(this),
          20000
        );
      }
    }
  },

  computed: {
    beneficiaryCurrency: function() {
      if (this.beneficiary.country == null) {
        return;
      }
      return this.countryMap[this.beneficiary.country].currencyCode;
    }
  },

  methods: {
    getBeneficiaryErrors(beneficiaries) {
      beneficiaries = beneficiaries || [];
      var userId = this.decodeToken().userId;
      var unverifiedBennyIds = [];
      beneficiaries.forEach(b => {
        if (!b.verified) unverifiedBennyIds.push(b.id);
      });

      return axios
        .get(`${process.env.API_URL}/users/${userId}/logs?type=verification_errors`, this.setHeaders())
        .then(resp => {
          this.verificationErrors = resp.data.filter(log => {
            if (unverifiedBennyIds.includes(log.beneficiary_id)) return log;
          });
        })
        .catch(err => console.log(err));
    },

    translateVerificationErrors(bennyError, country) {
      if (typeof bennyError === "object" && bennyError.data instanceof Array) {
        var errArr = [];
        bennyError.data.forEach(error => {
          if ((error.Code === 53 || error.Code === 55) && country !== "AU") {
            errArr.push("- Swift / BIC code is invalid");
          }

          if (error.Code === 54 && country === "GB") {
            errArr.push("- Sort key is invalid");
          }

          if (error.Code === 54 && country === "AU") {
            errArr.push("- BSB number is invalid");
          }

          if (error.Code === 72) {
            errArr.push("- IBAN is invalid");
          }

          if (error.Code === 2 && country !== "AU") {
            errArr.push("- IBAN is invalid");
          }
        });

        if (errArr.length < 1) return "Awaiting verification";

        return errArr.join(" ");
      }
      return "Awaiting verification";
    },

    checkError(bennyError, field) {
      if (typeof bennyError === "object" && bennyError.data instanceof Array) {
        var result = false;
        bennyError.data.forEach(error => {
          if ((error.Code === 53 || error.Code === 55) && field === "swift") result = true;
          if ((error.Code === 72 || error.Code === 2) && field === "iban") result = true;
          if (error.Code === 54 && field === "sortCode") result = true;
        });
        return result;
      }
    },

    refreshPage() {
      if (this.$route.query.userVerifySubmitted === true) {
        this.userVerifySubmitted = true;
      }

      if (typeof this.beneficiaries === "undefined") {
        this.getUserBeneficiaries().then(resp => {
          let business = resp.filter(b => {
            if (b.type === "business") {
              return b;
            }
          });
          let individual = resp.filter(b => {
            if (b.type === "personal") {
              return b;
            }
          });
          let all = resp;
          let arr;

          this.getBeneficiaryErrors(all).then(bennyErrors => {
            for (var n = 0; n < 3; n++) {
              if (n === 0) {
                arr = all;
              } else if (n === 1) {
                arr = business;
              } else {
                arr = individual;
              }

              this.setListItems(arr, n);
            }
          });
          return this.listItems;
        });
      }
    },

    setListItems(beneficiariesArr, listIndex) {
      var bennyErr;
      for (let i = 0; i < beneficiariesArr.length; i++) {
        bennyErr = this.verificationErrors.find(e => {
          return e.beneficiary_id === beneficiariesArr[i].id;
        });
        if (i === beneficiariesArr.length - 1) {
          if (beneficiariesArr.length > 0) {
            this.listItems[listIndex].push({
              title: beneficiariesArr[i].company_name || beneficiariesArr[i].first_name_on_account,
              subtitle: `<span class='text--primary'>Type: ${beneficiariesArr[i].type}</span> &mdash; ${beneficiariesArr[i].country}`,
              type: beneficiariesArr[i].type,
              verified: beneficiariesArr[i].verified,
              beneficaryId: beneficiariesArr[i].id,
              tooltip: beneficiariesArr[i].verified ? "Send payment" : this.translateVerificationErrors(bennyErr, beneficiariesArr[i].country)
            });
          }
        } else {
          this.listItems[listIndex].push(
            {
              title: beneficiariesArr[i].company_name || beneficiariesArr[i].first_name_on_account,
              subtitle: `<span class='text--primary'>Type: ${beneficiariesArr[i].type}</span> &mdash; ${beneficiariesArr[i].country}`,
              type: beneficiariesArr[i].type,
              verified: beneficiariesArr[i].verified,
              beneficaryId: beneficiariesArr[i].id,
              tooltip: beneficiariesArr[i].verified ? "Send payment" : this.translateVerificationErrors(bennyErr, beneficiariesArr[i].country)
            },
            { divider: true, inset: true }
          );
        }
      }
    },

    decodeToken() {
      return decode(localStorage.token);
    },

    setHeaders() {
      let token = localStorage.token;
      return { headers: { token: token } };
    },

    sendMoney(beneficaryId) {
      this.$router.push(`/rf/payments?sendTo=${beneficaryId}`);
    },

    getUserBeneficiaries() {
      let userId = this.decodeToken().userId;
      return axios
        .get(`${process.env.API_URL}/users/${userId}/beneficiaries`, this.setHeaders())
        .then(resp => {
          let beneficiariesArr = [];
          this.beneficiaries = resp.data;

          for (var i = 0; i < resp.data.length; i++) {
            let beneficiary = resp.data[i];
            beneficiariesArr.push(beneficiary);
          }

          return beneficiariesArr;
        })
        .catch(err => {
          console.log("error", err);
        });
    },

    getBeneficiary(beneficiaryId) {
      let userId = this.decodeToken().userId;
      this.error = false;
      this.loading = true;

      axios.get(`${process.env.API_URL}/users/${userId}/beneficiaries/${beneficiaryId}`, this.setHeaders()).then(resp => {
        this.beneficiary.id = resp.data.id;
        this.beneficiary.companyName = resp.data.company_name;
        this.beneficiary.firstName = resp.data.first_name_on_account;
        this.beneficiary.lastName = resp.data.last_name_on_account;
        this.beneficiary.type = resp.data.type;
        this.beneficiary.accountNumber = resp.data.account_number;
        this.beneficiary.routingNumber = resp.data.routing_number;
        this.beneficiary.country = resp.data.country;
        this.beneficiary.clabe = resp.data.clabe;
        this.beneficiary.bankName = resp.data.bank_name;
        this.beneficiary.bankCity = resp.data.bank_city;
        this.beneficiary.bankProvince = resp.data.bank_state_province;
        this.beneficiary.branchName = resp.data.branch_name;
        this.beneficiary.bankCode = resp.data.bank_city;
        this.beneficiary.branchCode = resp.data.branch_code;
        this.beneficiary.cpf = resp.data.cpfcnpj;
        this.beneficiary.cnpj = resp.data.cpfcnpj;
        this.beneficiary.email = resp.data.email;
        this.beneficiary.phoneNumber = resp.data.phone_number;
        this.beneficiary.bsb = resp.data.bsb_number;
        this.beneficiary.swiftBIC = resp.data.swift_bic;
        this.beneficiary.address = resp.data.address1;
        this.beneficiary.stateProvince = resp.data.state_province;
        this.beneficiary.city = resp.data.city;
        this.beneficiary.postalCode = resp.data.postal_code;
        this.editBeneficiary = true;
        this.loading = false;
        this.e2 = 1;

        // we run the below checks for the appended icons on the edit form
        var bennyErr = this.verificationErrors.find(e => {
          return e.beneficiary_id === resp.data.id;
        });

        // form errors
        this.beneficiary.swiftError = this.checkError(bennyErr, "swift");
        this.beneficiary.clabeError = this.checkError(bennyErr, "clabe");
        this.beneficiary.ibanError = this.checkError(bennyErr, "iban");

        return;
      });
    },

    updateBeneficiary() {
      let userId = this.decodeToken().userId;
      let body = this.formatData();

      axios
        .put(`${process.env.API_URL}/users/${userId}/beneficiaries/${this.beneficiary.id}`, body, this.setHeaders())
        .then(resp => {
          this.editBeneficiary = false;
          this.updateSuccess = true;
          this.resetFormData();
        })
        .catch(err => {
          console.log("error", err);
          this.error = true;
          this.editBeneficiary = false;
          this.resetFormData();
        });
    },

    submitForm() {
      let userId = this.decodeToken().userId;
      let body = this.formatData();

      axios
        .post(`${process.env.API_URL}/users/${userId}/beneficiaries`, body, this.setHeaders())
        .then(resp => {
          this.error = false;
          this.createSuccess = true;
          this.addNewBeneficiary = false;
          this.userVerifySubmitted = false;
          var item = {
            avatar: "",
            title: resp.data.first_name_on_account,
            subtitle: `<span class='text--primary'>Type: ${resp.data.type}</span> &mdash; ${resp.data.country}`,
            type: resp.data.type,
            beneficaryId: resp.data.id,
            tooltip: "Awaiting verification"
          };

          // add to all
          this.listItems[0].push(item);

          if (resp.data.type === "business") {
            this.listItems[1].push(item);
          } else {
            this.listItems[2].push(item);
          }
          this.resetFormData();
        })
        .catch(error => {
          console.log("error", error);
          this.error = true;
        });
    },

    cancelForm() {
      this.editBeneficiary = false;
      this.addNewBeneficiary = false;
      this.updateSuccess = false;
      this.createSuccess = false;
      this.resetFormData();
    },

    //? what is the difference between type and account_type
    formatData() {
      return {
        company_name: this.beneficiary.companyName || "",
        first_name_on_account: this.beneficiary.firstName || "",
        last_name_on_account: this.beneficiary.lastName || "",
        type: this.beneficiary.type || "",
        account_type: this.beneficiary.type || "",
        account_number: this.beneficiary.accountNumber || "",
        routing_number: this.beneficiary.routingNumber || "",
        country: this.beneficiary.country || "",
        address1: this.beneficiary.address || "",
        city: this.beneficiary.city || "",
        state_province: this.beneficiary.stateProvince || "",
        postal_code: this.beneficiary.postalCode || "",
        bsb_number: this.beneficiary.bsb || null,
        swift_bic: this.beneficiary.swiftBIC || "",
        currency: this.beneficiaryCurrency || "",
        clabe: this.beneficiary.clabe || "",
        bank_name: this.beneficiary.bankName || "",
        bank_city: this.beneficiary.bankCity || "",
        bank_state_province: this.beneficiary.bankProvince || "",
        branch_name: this.beneficiary.branchName || "",
        bank_code: this.beneficiary.bankCode || "",
        branch_code: this.beneficiary.branchCode || "",
        cpfcnpj: this.beneficiary.cpf || this.beneficiary.cnpj || "",
        email: this.beneficiary.email || "",
        phone_number: this.beneficiary.phoneNumber || ""
      };
    },

    resetFormData() {
      this.beneficiary.swiftBIC = "";
      this.beneficiary.address = "";
      this.beneficiary.city = "";
      this.beneficiary.companyName = "";
      this.beneficiary.firstName = "";
      this.beneficiary.lastName = "";
      this.beneficiary.type = "";
      this.beneficiary.type = "";
      this.beneficiary.accountNumber = "";
      this.beneficiary.routingNumber = "";
      this.beneficiary.clabe = "";
      this.beneficiary.bankName = "";
      this.beneficiary.bankCity = "";
      this.beneficiary.bankProvince = "";
      this.beneficiary.branchName = "";
      this.beneficiary.bankCode = "";
      this.beneficiary.branchCode = "";
      this.beneficiary.cpf = "";
      this.beneficiary.cnpj = "";
      this.beneficiary.email = "";
      this.beneficiary.phoneNumber = "";
      this.beneficiary.bsb = "";
      this.e1 = 0;
    }
  }
};
</script>

<style>
@media (min-width: 415px) {
  .toolytippy {
    max-width: 160px;
  }
}

@media (max-width: 415px) {
  .mobile-tile-action {
    margin-left: -25px;
  }
}

.input-group__append-icon:hover {
  color: red;
}

.theme--light .input-group:not(.input-group--error):not(.input-group--focused):not(.input-group--disabled) .input-group__input .input-group__append-icon:not(:hover) {
  color: red;
}

.select-drop-down {
  color: rgba(0, 0, 0, 0.54) !important;
}
</style>

