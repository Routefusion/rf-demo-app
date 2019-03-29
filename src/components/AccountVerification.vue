<template>
  <v-content>
    <v-container fluid>
      <v-layout row>
        <v-flex>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h2>Account Setup</h2>
              </div>
              <v-spacer></v-spacer>
              <v-btn flat v-on:click="clearForm">Cancel</v-btn>
            </v-card-title>
            <v-stepper v-model="e1">
              <v-stepper-header>
                <v-stepper-step step="1" :complete="e1 > 1">Account Origin</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="2" :complete="e1 > 2">Company Details</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="3" :complete="e1 > 3">Payments</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="4" :complete="e1 > 4">Personel</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="5" :complete="e1 > 5">Owners</v-stepper-step>
                <v-divider></v-divider>
                <!-- <v-stepper-step step="6" :complete="e1 > 6">Bank Account Info</v-stepper-step> -->
                <v-divider></v-divider>
                <v-stepper-step step="6">Verify</v-stepper-step>
              </v-stepper-header>
              <v-stepper-items>
                <v-stepper-content step="1">
                  <v-form v-model="valid">
                    <v-select
                      label="Company Origin"
                      placeholder="United States"
                      value="countries[0]"
                      :items="countries"
                      v-model="client.country"
                      class="select-drop-down"
                      item-value="countryAbbr"
                      item-text="name"
                      autocomplete
                      required
                    >
                      <template slot="item" slot-scope="data">
                        <flag :squared="false" :iso="data.item.countryAbbr"></flag>&nbsp;{{data.item.name}}
                      </template>
                    </v-select>
                  </v-form>
                  <v-btn color="primary" @click.native="e1 = 2">Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content step="2">
                  <v-card flat class="mb-2">
                    <h3>Company Information</h3>
                    <v-form v-model="valid">
                      <v-text-field
                        label="Legal Company Name"
                        v-model="client.companyName"
                        required
                      ></v-text-field>
                      <v-checkbox
                        label="Does company use DBA/fictitious business name?"
                        v-model="client.dba"
                        color="primary"
                      ></v-checkbox>
                      <v-text-field
                        v-if="client.dba === true"
                        label="DBA/Fictitious Business Name"
                        v-model="client.dbaName"
                        :rules="rules.name"
                        required
                      ></v-text-field>
                      <v-select
                        label="Legal Structure"
                        :items="businessTypes"
                        item-text="name"
                        item-value="value"
                        v-model="client.structure"
                        autocomplete
                        required
                      ></v-select>
                      <v-text-field
                        label="Company Registration / Incorporation Number"
                        v-model="client.incorporationNumber"
                        :rules="rules.incorporationNumberUS"
                        required
                      ></v-text-field>
                      <v-menu
                        v-if="e1 === 2"
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
                          slot="activator"
                          label="Date of Business Formation / Incorporation"
                          v-model="client.dateOfIncorporation"
                          append-icon="event"
                          readonly
                          required
                        ></v-text-field>
                        <v-date-picker header-color="primary" color="primary lighten-1" v-model="client.dateOfIncorporation" scrollable :show-current="false" :max="new Date().toISOString().substr(0, 10)">
                          <v-spacer></v-spacer>
                          <v-btn flat color="primary" @click="menu = false">Cancel</v-btn>
                          <v-btn flat color="primary" @click="$refs.menu.save(client.dateOfIncorporation)">OK</v-btn>
                        </v-date-picker>
                      </v-menu>
                      <v-text-field
                        label="Business Website"
                        v-model="client.website"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Business Phone Number"
                        v-model="client.phone"
                        mask="phone"
                      ></v-text-field>
                      <br>
                      <br>
                      <h3>Business Primary Address</h3>
                      <br>
                      <v-text-field
                        label="Street Address"
                        v-model="client.address"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="City"
                        v-model="client.city"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="State"
                        v-model="client.state"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Postal Code"
                        v-model="client.postalCode"
                        required
                      ></v-text-field>
                    </v-form>
                    <v-btn color="primary" @click.native="e1 = 3">Continue</v-btn>
                    <v-btn flat @click.native="e1 = 1">Back</v-btn>
                  </v-card>
                </v-stepper-content>
                <v-stepper-content step="3">
                  <v-form v-model="valid">
                    <h3>Payments</h3>
                    <br>
                    <v-text-field
                      label="Primay purpose for sending cross boarder payments"
                      v-model="client.payments.purpose"
                      :rules="rules.purposeOfPayment"
                      required
                    ></v-text-field>
                    <br>
                    <h4>Expected Frequency of Payments</h4>
                    <br>
                    <v-layout row wrap>
                      <v-flex xs12 md2>
                        <v-checkbox
                          label="Daily"
                          v-model="client.payments.frequency"
                          value="daily"
                          color="primary"
                        ></v-checkbox>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-checkbox
                          label="Weekly"
                          v-model="client.payments.frequency"
                          value="weekly"
                          color="primary"
                        ></v-checkbox>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-checkbox
                          label="Monthly"
                          v-model="client.payments.frequency"
                          value="monthly"
                          color="primary"
                        ></v-checkbox>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-checkbox
                          label="Quartlery"
                          v-model="client.payments.frequency"
                          value="quarterly"
                          color="primary"
                        ></v-checkbox>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-checkbox
                          label="Yearly"
                          v-model="client.payments.frequency"
                          value="yearly"
                          color="primary"
                        ></v-checkbox>
                      </v-flex>
                    </v-layout>
                    <v-text-field
                      label="Expected Volume of Payments Anually (in USD)"
                      prepend-icon="attach_money"
                      v-model="client.payments.volume"
                      :rules="rules.paymentsVolume"
                      required
                    ></v-text-field>
                    <v-select
                      label="Primary Countries Funds Will Be Sent To"
                      v-model="client.payments.countries"
                      :items="countries"
                      item-text="name"
                      item-value="countryAbbr"
                      multiple
                      chips
                      deletable-chips
                      required
                    >
                      <template slot="item" slot-scope="data">
                        <flag :squared="false" :iso="data.item.countryAbbr"></flag>&nbsp;{{data.item.name}}
                      </template>
                    </v-select>
                  </v-form>
                  <v-btn color="primary" @click.native="e1 = 4">Continue</v-btn>
                  <v-btn flat @click.native="e1 = 2">Back</v-btn>
                </v-stepper-content>
                <v-stepper-content step="4">
                  <span>Please list all directors/appointed officers</span>
                  <v-spacer></v-spacer>
                  <br>
                  <div v-for="(officer, i) in client.officers" :key="i">
                    <h3>Director / Appointed Officer {{i + 1}}</h3>
                    <br>
                    <br>
                    <h4>Title</h4>
                    <br>
                    <v-form>
                      <v-layout row wrap>
                        <v-flex xs12 md2>
                          <v-checkbox
                            label="Mr."
                            v-model="officer.title"
                            value="Mr."
                            color="primary"
                          ></v-checkbox>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-checkbox
                            label="Mrs."
                            v-model="officer.title"
                            value="Mrs."
                            color="primary"
                          ></v-checkbox>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-checkbox
                            label="Miss"
                            v-model="officer.title"
                            value="Miss"
                            color="primary"
                          ></v-checkbox>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-checkbox
                            label="Ms."
                            v-model="officer.title"
                            value= "Ms."
                            color="primary"
                          ></v-checkbox>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-checkbox
                            label="Dr."
                            v-model="officer.title"
                            value="Dr."
                            color="primary"
                          ></v-checkbox>
                        </v-flex>
                      </v-layout>
                      <v-text-field
                        label="First Name"
                        v-model="officer.firstName"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Last Name"
                        v-model="officer.lastName"
                        required
                      ></v-text-field>
                      <v-menu
                        v-if="e1 === 4 && officer"
                        ref="menu"
                        lazy
                        :close-on-content-click="false"
                        v-model="officer.menu"
                        transition="scale-transition"
                        offset-y
                        full-width
                        :nudge-right="40"
                        min-width="290px"
                      >
                        <v-text-field
                          slot="activator"
                          label="Date of Birth"
                          v-model="officer.dob"
                          append-icon="event"
                          readonly
                          required
                        ></v-text-field>
                        <v-date-picker header-color="primary" color="primary lighten-1" v-model="officer.dob" scrollable :show-current="false" :max="new Date().toISOString().substr(0, 10)">
                          <v-spacer></v-spacer>
                          <v-btn flat color="primary" @click="officer.menu = false">Cancel</v-btn>
                          <v-btn flat color="primary" @click="officer.menu = false">OK</v-btn>
                        </v-date-picker>
                      </v-menu>
                      <v-text-field
                        label="Job Title"
                        v-model="officer.jobTitle"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Citizenship"
                        v-model="officer.citizenship"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Street Address"
                        v-model="officer.address"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="City"
                        v-model="officer.city"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="State"
                        v-model="officer.state"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Postal Code"
                        v-model="officer.postalCode"
                        required
                      ></v-text-field>
                      <v-select
                        label="Identification Type"
                        :items="identificationTypes"
                        item-text="name"
                        item-value="value"
                        v-model="officer.idType"
                        autocomplete
                        required
                      ></v-select>
                      <v-text-field
                        label="Identification Number"
                        v-model="officer.idNumber"
                        :mask="officer.idType === 'ssn' ? 'social' : null"
                        required
                      ></v-text-field>
                      <br>
                      <v-checkbox v-model="officer.owner" color="primary">
                        <div slot="label">
                          Owns 25% or more of {{client.companyName}}
                        </div>
                      </v-checkbox>
                      <v-flex xs6 md3 lg2>
                        <v-text-field
                          v-if="officer.owner"
                          v-model="officer.ownership"
                          hint="e.g. 50%"
                          label="Ownership %"
                          suffix="%"
                          mask="###"
                        ></v-text-field>
                      </v-flex>
                    </v-form>
                  </div>
                  <br>
                  <v-btn fab color="primary" @click.native="client.officers.push({})">
                    <v-icon>person_add</v-icon>
                  </v-btn>
                  <br>
                  <br>
                  <v-btn color="primary" @click.native="e1 = 5">Continue</v-btn>
                  <v-btn flat @click.native="e1 = 3">Back</v-btn>
                </v-stepper-content>
                <v-stepper-content step="5">
                  <span>Please list all individuals who own 25% or more of {{client.companyName}}.</span>
                  <br>
                  <span style="font-weight: 600">Note: Must be a person, cannot be a legal entity</span>
                  <v-spacer></v-spacer>
                  <br>
                  <div v-for="(owner, i) in client.owners" :key="i">
                    <h3>Owner {{i + 1}}</h3>
                    <br>
                    <br>
                    <h4>Title</h4>
                    <br>
                    <v-form>
                      <v-layout row wrap>
                        <v-flex xs12 md2>
                          <v-checkbox
                            label="Mr."
                            v-model="owner.title"
                            value="Mr."
                            color="primary"
                          ></v-checkbox>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-checkbox
                            label="Mrs."
                            v-model="owner.title"
                            value="Mrs."
                            color="primary"
                          ></v-checkbox>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-checkbox
                            label="Miss"
                            v-model="owner.title"
                            value="Miss."
                            color="primary"
                          ></v-checkbox>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-checkbox
                            label="Ms."
                            v-model="owner.title"
                            value="Ms."
                            color="primary"
                          ></v-checkbox>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-checkbox
                            label="Dr."
                            v-model="owner.title"
                            value="Dr."
                            color="primary"
                          ></v-checkbox>
                        </v-flex>
                      </v-layout>
                      <v-text-field
                        label="First Name"
                        v-model="owner.firstName"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Last Name"
                        v-model="owner.lastName"
                        required
                      ></v-text-field>


                      <v-menu
                        v-if="e1 === 5"
                        ref="menu"
                        lazy
                        :close-on-content-click="false"
                        v-model="owner.menu"
                        transition="scale-transition"
                        offset-y
                        full-width
                        :nudge-right="40"
                        min-width="290px"
                      >
                        <v-text-field
                          slot="activator"
                          label="Date of Birth"
                          v-model="owner.dob"
                          append-icon="event"
                          readonly
                          required
                        ></v-text-field>
                        <v-date-picker header-color="primary" color="primary lighten-1" v-model="owner.dob" scrollable :show-current="false" :max="new Date().toISOString().substr(0, 10)">
                          <v-spacer></v-spacer>
                          <v-btn flat color="primary" @click="owner.menu = false">Cancel</v-btn>
                          <v-btn flat color="primary" @click="owner.menu = false">OK</v-btn>
                        </v-date-picker>
                      </v-menu>


                      <v-text-field
                        label="Job Title"
                        v-model="owner.jobTitle"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Citizenship"
                        v-model="owner.citizenship"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Street Address"
                        v-model="owner.address"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="City"
                        v-model="owner.city"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="State"
                        v-model="owner.state"
                        required
                      ></v-text-field>
                      <v-text-field
                        label="Postal Code"
                        v-model="owner.postalCode"
                        required
                      ></v-text-field>
                      <v-select
                        label="Identification Type"
                        :items="identificationTypes"
                        item-text="name"
                        item-value="value"
                        v-model="owner.idType"
                        autocomplete
                        required
                      ></v-select>
                      <v-text-field
                        label="Identification Number"
                        v-model="owner.idNumber"
                        :mask="owner.idType === 'ssn' ? 'social' : null"
                        required
                      ></v-text-field>
                      <v-flex xs6 md3 lg2>
                        <v-text-field
                          v-model="client.owners[i].ownership"
                          hint="e.g. 25.50%"
                          label="Percentage of Ownership"
                          suffix="%"
                          mask="###"
                          required
                        ></v-text-field>
                      </v-flex>
                    </v-form>
                    <br>
                  </div>
                  <v-btn fab color="primary" @click.native="client.owners.push({})">
                    <v-icon>person_add</v-icon>
                  </v-btn>
                  <br>
                  <v-btn color="primary" @click.native="e1 = 6">Continue</v-btn>
                  <v-btn flat @click.native="e1 = 4">Back</v-btn>
                </v-stepper-content>
                <!-- <v-stepper-content step="6">
                  <v-form v-model="valid">
                    <h3>Direct Debit Details</h3>
                    <br>
                    <v-text-field
                      label="Account Name (for your use only)"
                      v-model="client.account.name"
                      required
                    ></v-text-field>
                    <v-text-field
                      label="First Name"
                      v-model="client.account.firstName"
                      :rules="rules.name"
                      required
                    ></v-text-field>
                    <v-text-field
                      label="Last Name"
                      v-model="client.account.lastName"
                      :rules="rules.name"
                      required
                    ></v-text-field>
                    <v-text-field
                      label="Account Number"
                      v-model="client.account.accountNumber"
                      required
                    ></v-text-field>
                    <v-text-field
                      label="Routing Number"
                      v-model="client.account.routingNumber"
                      required
                    ></v-text-field>
                  </v-form>
                  <v-btn color="primary" @click.native="e1 = 7">Continue</v-btn>
                  <v-btn flat @click.native="e1 = 5">Back</v-btn>
                </v-stepper-content> -->
                <v-stepper-content step="6">
                  <v-card flat class="mb-5">
                    <v-list three-line subheader>
                      <v-subheader>Verify Data Below is Correct</v-subheader>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Company Origin</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.country}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Company Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.companyName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="client.dba">
                        <v-list-tile-content>
                          <v-list-tile-title>DBA</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.dbaName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="client.structure">
                        <v-list-tile-content>
                          <v-list-tile-title>Legal Structure</v-list-tile-title>
                          <v-list-tile-sub-title>{{getStructureName(client.structure)}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Regitration / Incorporation Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.incorporationNumber}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Date of Formation / Incorporation</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.dateOfIncorporation}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="client.website">
                        <v-list-tile-content>
                          <v-list-tile-title>Business Website</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.website}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile v-if="client.phone">
                        <v-list-tile-content>
                          <v-list-tile-title>Business Phone Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.phone}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-subheader>Business Primary Address</v-subheader>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Street Address</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.address}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>City</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.city}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>State</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.state}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Postal Code</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.postalCode}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-subheader>Payments</v-subheader>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Purpose of Payments</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.payments.purpose}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Expected Frequency of Payments</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.payments.frequency}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Expected Volume of Payments Annually (in USD)</v-list-tile-title>
                          <v-list-tile-sub-title>{{client.payments.volume}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Primary Countries Funds Will be Sent</v-list-tile-title>
                          <v-list-tile-sub-title v-for="(country, i) in client.payments.countries" :key="i">{{getCountry(country)}}<br></v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-subheader>Personel</v-subheader>
                      <div v-for="(officer, i) in client.officers" :key="i">
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Title</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.title}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>First Name</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.firstName}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Last Name</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.lastName}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Date of Birth</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.dob}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Job Title</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.jobTitle}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Citizenship</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.citizenship}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Street Address</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.address}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>City</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.city}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>State</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.state}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Postal Code</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.postalCode}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile v-if="officer.ssn">
                          <v-list-tile-content>
                            <v-list-tile-title>SSN</v-list-tile-title>
                            <v-list-tile-sub-title>{{officer.ssn}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </div>

                      <v-subheader v-if="client.owners.length > 0">Owners</v-subheader>
                      <div v-for="(owner, i) in client.owners" :key="i">
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Title</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.title}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>First Name</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.firstName}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Last Name</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.lastName}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Date of Birth</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.dob}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Job Title</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.jobTitle}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Citizenship</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.citizenship}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Street Address</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.address}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>City</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.city}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>State</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.state}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Postal Code</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.postalCode}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile v-if="owner.ssn">
                          <v-list-tile-content>
                            <v-list-tile-title>SSN</v-list-tile-title>
                            <v-list-tile-sub-title>{{owner.ssn}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </div>
                      <v-subheader>Acknowledgements</v-subheader>
                      <br>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Account Management</v-list-tile-title>
                          <v-checkbox v-model="client.allowAccountManagement" color="primary">
                            <span slot="label">
                              I agree to have Routefusion open and manage an account on my behalf with AFEX, and Wyre<br>
                            </span>
                          </v-checkbox>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Terms</v-list-tile-title>
                          <v-checkbox v-model="client.agreedToTerms" color="primary">
                            <span slot="label">I agree to the AFEX <a href="/static/afextc.pdf" target="_blank">Terms and Conditions</a>; I agree to the Wyre <a href="/static/wyretc.pdf" target="_blank">Terms and Conditions</a></span>
                          </v-checkbox>
                        </v-list-tile-content>
                      </v-list-tile>
                      <!-- <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>First Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{account.firstName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Last Name</v-list-tile-title>
                          <v-list-tile-sub-title>{{account.lastName}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Date of Birth</v-list-tile-title>
                          <v-list-tile-sub-title>{{account.dob}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Phone Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{account.phoneNumber}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Account Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{account.accountNumber}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Routing Number</v-list-tile-title>
                          <v-list-tile-sub-title>{{account.routingNumber}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>Default Currency</v-list-tile-title>
                          <v-list-tile-sub-title>{{account.defaultCurrency}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile> -->
                    </v-list>
                  </v-card>
                  <p style="color: green" v-if="success === true">Accound data sent succesfully! You will be redirected shortly</p>
                  <v-btn color="primary" @click.native="submitForm" :disabled="!client.allowAccountManagement || !client.agreedToTerms || clickedSubmit">Submit</v-btn>
                  <v-btn flat @click.native="e1 = 5">Back</v-btn>
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
import * as decode from "jwt-decode";
import axios from "axios";
import * as countries from "../lib/countries";

export default {
  data() {
    return {
      clickedSubmit: false,
      success: false,
      error: false,
      menu: false,
      e1: 0,
      addNewAccount: false,
      valid: false,
      rules: {
        name: [],
        incorporationNumberUS: [],
        purposeOfPayment: [],
        paymentFrequency: [],
        paymentVolume: []
      },
      countries: countries,
      businessTypes: [
        { name: "S Corporation", value: "corpS" },
        { name: "C Corporation", value: "corpC" },
        { name: "Partnership (LP, LLP, LLLP)", value: "partnership" },
        { name: "Limited Liability Company", value: "llc" },
        { name: "Sole Proprietorship", value: "soleP" },
        { name: "Government Entity", value: "gov" },
        { name: "Publicly Traded Company", value: "public" },
        { name: "Non Profit", value: "nonProfit" },
        { name: "Trust", value: "trust" }
      ],
      identificationTypes: [{ name: "Drivers License", value: "dl" }, { name: "Passport", value: "passport" }, { name: "Social Security Number", value: "ssn" }],
      officers: [{}],
      owners: [],
      client: {
        country: "US",
        officers: [{}],
        owners: [],
        payments: {},
        account: {}
      }
    };
  },

  created() {},

  methods: {
    decodeToken() {
      return decode(localStorage.token);
    },

    setHeaders() {
      let token = localStorage.token;
      return { headers: { token: token } };
    },

    submitForm() {
      var body = { KYC: this.client };
      var userId = this.decodeToken().userId;
      var self = this;

      axios
        .post(`${process.env.API_URL}/users/${userId}/verify`, body, this.setHeaders())
        .then(function(response) {
          self.success = true;
          self.clickedSubmit = true;
          self.$root.$emit("verification-submitted");
          localStorage.submitted = true;
          setTimeout(
            function() {
              self.$router.push(`/rf/dashboard`);
            }.bind(self),
            5000
          );

          return;
        })
        .catch(function(error) {
          console.log("error", error);
          self.error = true;
        });
    },

    clearForm() {
      this.client = {
        officers: [{}],
        owners: [],
        payments: {
          countries: []
        },
        account: {}
      };

      return (this.e1 = 1);
    },

    getCountry(abbr) {
      var selection = this.countries.find(function(element) {
        return element.countryAbbr === abbr;
      });

      return selection.name;
    },

    getStructureName(data) {
      var selection = this.businessTypes.find(function(element) {
        return element.value === data;
      });

      return selection.name;
    }
  },

  components: {}
};
</script>
<style>
.input-group-text-field {
  color: #79589f !important;
}
</style>
