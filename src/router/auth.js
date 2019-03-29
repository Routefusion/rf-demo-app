/* globals localStorage */

export default {
  // login (email, pass, cb) {
  //   cb = arguments[arguments.length - 1]
  //   if (localStorage.token) {
  //     if (cb) cb(true)
  //     this.onChange(true)
  //     return
  //   }
  //   pretendRequest(email, pass, (res) => {
  //     if (res.authenticated) {
  //       localStorage.token = res.token
  //       if (cb) cb(true)
  //       this.onChange(true)
  //     } else {
  //       if (cb) cb(false)
  //       this.onChange(false)
  //     }
  //   })
  // },

  getToken () {
    return localStorage.token
  },

  logout (callback) {
    delete localStorage.token
    delete localStorage.userId
    delete localStorage.submitted
    if (callback) callback()
    this.onChange(false)
  },

  loggedIn () {
    return !!localStorage.token
  },

  onChange () {}
}