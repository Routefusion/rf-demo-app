import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import HelloWorld from '@/components/HelloWorld';
import AccountVerification from '@/components/AccountVerification';
import Dash from '@/components/Dash';
import Contact from '@/components/Contact';
import SignUp from '@/components/SignUp';
import SignIn from '@/components/SignIn';
import Payment from '@/components/Payment';
import Beneficiary from '@/components/Beneficiary';
import Transaction from '@/components/Transaction';
import Developer from '@/components/Developer';
import Verify from '@/components/Verify';
import FundAccount from '@/components/FundAccount';
import auth from './auth';
import ResetPassword from '@/components/ResetPassword';
import MultiFactorAuth from '@/components/mfa';
import AccountSettings from '@/components/AccountSettings';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/rf',
      component: Dash,
      beforeEnter: AuthDatShit,
      children: [
        {
          path: 'dashboard',
          component: HelloWorld,
          name: 'Ciao'
        },
        {
          path: 'payments',
          component: Payment,
          name: 'Payment'
        },
        {
          path: 'beneficiaries',
          component: Beneficiary,
          name: 'Beneficiary'
        },
        {
          path: 'transactions',
          component: Transaction,
          name: 'Transaction'
        },
        {
          path: 'verification',
          component: AccountVerification,
          name: 'Account'
        },
        {
          path: 'fund_account',
          component: FundAccount,
          name: 'FundAccount'
        },
        {
          path: 'developer',
          component: Developer,
          name: 'Developer'
        },
        {
          path: 'verify',
          component: Verify,
          name: 'Verify'
        },
        {
          path: 'mfa',
          component: MultiFactorAuth,
          name: 'mfa'
        },
        {
          path: 'account_settings',
          component: AccountSettings,
          name: 'AccountSettings'
        }
      ]
    },
    {
      path: '/sign_in',
      component: SignIn,
      name: "SignIn"
    },
    {
      path: '/sign_up',
      component: SignUp,
      name: "Sign Up"
    },
    {
      path: '/contact',
      component: Contact,
      name: "Contact"
    },
    {
      path: '/',
      component: SignIn,
      name: "Home"
    },
    {
      path: "/sign_out",
      name: "Sign Out",
      beforeEnter (to, from, next) {
        auth.logout()
        next('/')
      }
    },
    {
      path: '/reset_password/:token',
      component: ResetPassword,
      name: "Reset Password"
    }
  ]
})

// this was amazing https://github.com/vuejs/vue-router/blob/dev/examples/auth-flow/app.js
function AuthDatShit (to, from, next) {
  if (auth.loggedIn()) {
    next();
  } else {
    next({
      path: '/sign_in',
      query: { redirect: to.fullPath }
    });
  }
}
