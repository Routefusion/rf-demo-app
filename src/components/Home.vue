<template>
  <v-app>
    <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="grey lighten-5">
      <img src="../assets/pinniped-seal.png" height="auto" style="margin-left: 8px; width: 150px"/>
      <v-spacer></v-spacer>
      <v-btn class="sign-in-btn" small flat v-if="!loggedIn" :to="{name: 'Sign In'}">Sign In</v-btn>
      <v-menu bottom left class="dot-menu" v-if="loggedIn">
        <v-btn icon slot="activator">
          <v-icon style="color: #7171da">more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile :to="{name: 'Ciao'}">
            <v-list-tile-title style="color: #7171da">DASHBOARD</v-list-tile-title>
          </v-list-tile>
          <v-list-tile :to="{name: 'Sign Out'}">
            <v-list-tile-title style="color: #7171da">SIGN OUT</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-btn class="nav-btn" small flat v-if="loggedIn" :to="{name: 'Ciao'}">Dashboard</v-btn>
      <v-btn class="nav-btn" small flat v-if="loggedIn" :to="{name: 'Sign Out'}">Sign Out</v-btn>

    </v-toolbar>
    <v-content>
      <section>
        <v-parallax :src="require('@/assets/hero-image.png')" height="650">
          <v-layout
            column
            align-center
            justify-center
            class="white--text"
          >

            <h1 class="white--text mb-2 display-3 text-xs-center" v-bind:style="styles.PGPheader">Global Payments Done Right</h1>
            <div class="subheading mb-3 text-xs-center">Sign Up today for your first free transfer</div>
            <v-btn
              style="border: 3px solid white; color: white; background: transparent!important"
              class="mt-5"
              round
              large
              :to="{name: 'Sign Up'}"
            >
              Sign Up
            </v-btn>
          </v-layout>
        </v-parallax>
      </section>

      <section>
        <v-layout
          column
          wrap
          class="my-1"
          align-center
        >
          <v-flex xs12 sm4 class="my-10 mt-4">
            <div class="text-xs-center" style="margin-bottom: 10px">
              <h2 class="headline">Sending money has never been easier!</h2>
              <span class="subheading">
                6X cheaper and 10X faster
              </span>
            </div>
          </v-flex>
          <v-flex xs12>
            <v-container grid-list-xl>
              <v-layout row wrap align-center style="text-align: center">
                <v-flex xs12 md4>
                  <v-card class="elevation-0 transparent">
                    <v-card-text class="text-xs-center">
                      <v-icon size="50px" style="color: #7171da">flash_on</v-icon>
                    </v-card-text>
                    <v-card-title primary-title class="layout justify-center">
                      <div class="headline text-xs-center">Instant Payouts</div>
                    </v-card-title>
                    <v-card-text>
                      Sending money to a Mexico bank account happens instantly.  The receiving party will receive payment in 6 hours.
                    </v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card class="elevation-0 transparent">
                    <v-card-text class="text-xs-center">
                      <v-icon size="50px" style="color: #7171da">trending_up</v-icon>
                    </v-card-text>
                    <v-card-title primary-title class="layout justify-center">
                      <div class="headline">Mid-Market Rates</div>
                    </v-card-title>
                    <v-card-text>
                      No more 10% markup on exchange rates.  We give you the same exchange rate that the banks are using. &nbsp; &nbsp; &nbsp; &nbsp;
                    </v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card class="elevation-0 transparent">
                    <v-card-text class="text-xs-center">
                      <v-icon size="50px" style="color: #7171da">tag_faces</v-icon>
                    </v-card-text>
                    <v-card-title primary-title class="layout justify-center">
                      <div class="headline text-xs-center">Transparent</div>
                    </v-card-title>
                    <v-card-text>
                      No fees, ever. No more charges on top of an inflated exchange rate.
                      With Pinniped, what you see is what you will get.
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-flex>
        </v-layout>
      </section>

      <section>
        <v-parallax :src="require('@/assets/hero-image3.png')" height="400" style="filter: saturate(60%)">
          <v-layout column align-center justify-center>
            <div class=" white--text mb-3 text-l-center" style="font-size: 30px; font-weight: 500; text-align: center">Sending money has never been easier</div>
            <em style="font-size: 15px; font-weight: 500">Start saving time and money today!</em>
            <v-btn
              class="mt-5"
              style="border: solid; border-color: white; background: transparent!important"
              round
              dark
              large
              :to="{name: 'Sign Up'}"
            >
              Get Started
            </v-btn>
          </v-layout>
        </v-parallax>
      </section>

      <section>
          <v-layout row wrap justify-center class="ma-3">
            <v-flex xs6 left>
              <img src="../assets/love-austin4.png" width="53" height="auto"/>
            </v-flex>
            <v-flex xs6 right my-auto style="position: relative">
              <p v-bind:style="styles.footerContact">Contact us at <a href="mailto: info@routefusion.co" style="color: #7171da; font-weight: 600">info@routefusion.co</a></p>
            </v-flex>
          </v-layout>
      </section>
    </v-content>
  </v-app>
</template>

<script>
  import Footer from "./Footer";
  import auth from "../router/auth";

  export default {
    data () {
      return {
        loggedIn: auth.loggedIn(),
        styles: {
          PGPheader: {
            fontSize: '8vh',
            fontWeight: 400,
            lineHeight: '1.35 !important',
            letterSpacing: '-.02em !important'
          },

          navLogo: {
            height: '40vw',
            width: 'auto',
            background: 'black',
            fill: 'black'
          },

          footerContact: {
            color: '#7171da',
            fontWeight: 200,
            float: 'right',
            display: 'inline-block',
            marginBottom: 'unset',
            position: 'absolute',
            right: 0,
            bottom: '30%',
            textAlign: 'right'
          },
        }
      }
    },

    components: {
      'footer-meow': Footer
    },

    created() {
      auth.onChange = loggedIn => {
        this.loggedIn = loggedIn
      }
    }
  }
</script>

<style>
  .dot-menu {
    display: inline-block!important;
    color: #7171da
  }

  .nav-btn {
    display: none!important;
  }

  .subheading {
    font-weight: 500!important;
  }

  .sign-in-btn {
    color: #7171da!important;
  }

  @media (max-width: 415px) {
    .sign-in-btn {
      color: #7171da;
      margin-right: unset!important;
      padding-left: 6px;
    }
  }

  @media (min-width: 415px) {
    .dot-menu {
      display: none!important;
    }

    .nav-btn {
      display: inline-block!important;
      color: #7171da!important;
    }
  }
</style>
