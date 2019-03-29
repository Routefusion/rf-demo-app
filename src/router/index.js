import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import AccountVerification from '@/components/AccountVerification';
import Dash from '@/components/Dash';
import Payment from '@/components/Payment';
import Beneficiary from '@/components/Beneficiary';
import Transaction from '@/components/Transaction';
import Verify from '@/components/Verify';
import FundAccount from '@/components/FundAccount';
import MultiFactorAuth from '@/components/mfa';
import AccountSettings from '@/components/AccountSettings';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      component: Dash,
      children: [
        {
          path: '/',
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
  ]
})

