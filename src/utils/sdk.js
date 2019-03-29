import rf from 'routefusion-sdk'

/***********AUTHORIZATION******/
//https://developer.routefusion.co/#getting-started
//routefusion.co
// signin -> developer -> create key

var sdk = rf.Instance({
  RF_CLIENT_ID: process.env.RF_CLIENT_ID,
  RF_SECRET: process.env.RF_SECRET,
  RF_BASE_URL: process.env.RF_BASE_URL
});

/**********USER*************/
//https://developer.routefusion.co/#get-user

export const getUser = () => sdk.getUser().then(res => res).catch(err => err)

export const updateUser = (body) => sdk.updateUser(body).then(resp => resp).catch(err => err)

export const getMaster = (UUID) => sdk.getUserByUUid(UUID).then(res => res).catch(err => err)

export const updateMaster = (UUID) => sdk.updateUserByUUid(UUID, body).then(res => res).catch(err => err)

export const createMaster = (body) => sdk.createUserByUUid(body).then(res => res).catch(err => err)

export const getUsers = () => sdk.getUsers().then(res => res).catch(err => err)


/**********BENEFICIARY*************/
//https://developer.routefusion.co/#beneficiaries

export const getBen = (ben_id) => ben_id ?
  sdk.getBeneficiary(ben_id).then(res => res).catch(err => err) :
  sdk.getBenefiaries().then(res => res).catch(err => err)

export const createBen = (body) => sdk.createBenefiary(body).then(res => res).catch(err => err)

export const updateBen = (ben_id, body) => sdk.updateBeneficiary(ben_id, body).then(res => res).catch(err => err)


/***********QUOTE********************/

export const createQuote = (body) => sdk.createQuote(body).then(res => res).catch(err => err)


/***********Transfers***************/
//https://developer.routefusion.co/#transfers

export const createTransfer = (body) => sdk.createTransfer(body).then(res => res).catch(err => err)

export const getTransfer = (transfer_id) => transfer_id ?
  sdk.getTransfer(transfer_id).then(res => res).catch(err => err) :
  sdk.getAllTransfers().then(res => res).catch(err => err)


//MASSPAY


/*************VERIFICATION*************/
//https://developer.routefusion.co/#send-kyc-information

export const sendVerification = (body) => sdk.sendVerificationData(body).then(res => res).catch(err => err)
