# BitShares notifications service
## Using the service

This service monitors BitShares and notifies subscribers by Email or Telegram regarding the following activity types:
- Transfer
- Fill order

## For Email-notifications
Send 50 BTS to account name "BITSHARES-NOTIFIER" with your email in the transaction memo.

## For Telegram-notifications
Open Telegram app, launch bot @trustywalletapp and follow instructions.


## Running the service on your own node 
``
cp config.sample.js config.js
``

Then add your credentials including service account brainkey and email options.

You can also set System asset and Price for subscription (default is bts and 0)

Then typicaly start:
``
npm install && npm start
``
