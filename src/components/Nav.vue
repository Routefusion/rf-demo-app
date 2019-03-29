<template>
  <div>
    <v-navigation-drawer
      clipped
      v-model="drawer"
      enable-resize-watcher
      app
    >
      <v-list dense>
        <v-list-tile v-for="(route, index) in routes" :key="index" :to="route.path">
          <v-list-tile-action>
            <v-icon>{{ route.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ route.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar style="border-bottom: 1px solid #E7E7EC !important" color='white' fixed flat clipped-left prominent app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer" style="color: #79589F"></v-toolbar-side-icon>
      <v-toolbar-title style="color: #534A93; font-size: 22px !important;">Routefusion</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <v-btn icon slot="activator">
          <v-avatar light style="color: #79589F" size="30">
            <v-icon v-if="!avatarSrc" dark>account_circle</v-icon>
            <img v-if="avatarSrc" :src="avatarSrc" v-on:error="avatarSrc = !avatarSrc" alt="You Win!">
          </v-avatar>
        </v-btn>
        <v-list v-for="(menu, m) in menuItems" :key="m">
          <v-list-tile :to="{name: menu.path}">
            <v-list-tile-title style="color: #000">{{ menu.title }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
  </div>
</template>

<script>
import * as rf from "../utils/sdk.js";
import * as local from "../utils/localStorage.js";

export default {
  data: () => ({
    avatarSrc: null,
    drawer: true,
    routes: null,
    menuItems: [
      {
        title: "Account Settings",
        path: "AccountSettings"
      }
    ]
  }),

  created() {
    //Check if stored and call and store if not
    var user = local.getLocal("user");
    if (user.verify) {
      this.getRoutes(user);
    } else
      rf
        .getUser()
        .then(res => {
          local.setLocal("user", res);
          this.getRoutes(res);
        })
        .catch(err => err);

    //Need to change this probably / maybe
    localStorage.avatarSrc === "undefined" || localStorage.avatarSrc === "null" ? (this.avatarSrc = null) : (this.avatarSrc = localStorage.avatarSrc);
  },

  mounted() {
    this.$root.$on(
      "verification-submitted",
      function() {
        this.getRoutes({ verificationSubmitted: true });
      }.bind(this)
    );
  },

  methods: {
    getRoutes(user) {
      let routes = [
        {
          title: "Verify Account",
          path: "/verification",
          icon: "verified_user"
        },
        {
          title: "Home",
          path: "/dashboard",
          icon: "home"
        },
        {
          title: "Send Money",
          path: "/payments",
          icon: "attach_money"
        },
        {
          title: "Beneficiaries",
          path: "/beneficiaries",
          icon: "group"
        },
        {
          title: "Transactions",
          path: "/transactions",
          icon: "receipt"
        }
      ];

      //if verfication submitted, remove verfiy tab
      if (user.verificationSubmitted) {
        routes.shift();
      }
      return (this.routes = routes);
    }
  }
};
</script>
<style>
@media screen and (min-width: 415px) {
  .mobile {
    display: none;
  }
}

@media screen and (max-width: 415px) {
  .desktop {
    display: none;
  }
}
</style>
