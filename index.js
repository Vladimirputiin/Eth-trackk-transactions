
const fs = require('fs');
const Web3 = require('web3');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Load addresses
const addressList = new Set(
  fs.readFileSync('Ethereum_Addresses__Cleaned_.csv', 'utf8')
    .split('\n')
    .map(line => line.trim().toLowerCase())
);

// Setup Web3
const web3 = new Web3(new Web3.providers.WebsocketProvider(`wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`));

// Setup Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

// Subscribe to new blocks
web3.eth.subscribe('newBlockHeaders', async (blockHeader) => {
  try {
    const block = await web3.eth.getBlock(blockHeader.hash, true);
    for (const tx of block.transactions) {
      const from = tx.from?.toLowerCase();
      const to = tx.to?.toLowerCase();
      if (addressList.has(from) || addressList.has(to)) {
        const msg = `TX ALERT:
From: ${from}
To: ${to}
Value: ${web3.utils.fromWei(tx.value, 'ether')} ETH
Hash: https://etherscan.io/tx/${tx.hash}`;
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg);
      }
    }
  } catch (error) {
    console.error("Error processing block:", error);
  }
});
