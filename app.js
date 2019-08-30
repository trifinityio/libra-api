const Dotenv = require('dotenv');
const Express = require('express');
const Morgan = require('morgan');
const LibraService = require('./service');

Dotenv.config();

const app = Express();
app.use(Express.json());
app.use(Express.urlencoded({extended: true}));
app.use(Morgan(function (tokens, request, response) {
	return tokens.url(request, response) + ': ' + JSON.stringify(request.body);
}, {immediate: true}));
app.post('/createWallet', LibraService.handleCreateWallet);
app.post('/getBalance', LibraService.handleGetBalance);
app.post('/getAddress', LibraService.handleGetAddress);
app.post('/transactionHistory', LibraService.handleTransactionHistory);
app.post('/transfer', LibraService.handleTransfer);
app.post('/mint', LibraService.handleMint);
const port = (process.env.PORT || 3000);
const host = (process.env.HOST || 'localhost');
app.listen(port, host, () => {
	console.log(`App started. Listening on ${host}:${port}`);
});
