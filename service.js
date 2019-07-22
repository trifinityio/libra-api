const {LibraClient, LibraNetwork, Account, LibraWallet} = require('libra-core');

function hasValidParameter(parameter, parameters) {
	return (parameter in parameters && parameters[parameter]);
}

class LibraService
{
	static async handleCreateWallet(request, response) {
		const client = new LibraClient({network: LibraNetwork.Testnet});
		const wallet = new LibraWallet();
		const account = wallet.newAccount();

		await client.mintWithFaucetService(account.getAddress(), 1000e6);

		const accountState = await client.getAccountState(account.getAddress());

		response.send({
			address: account.getAddress().toString(),
			mnemonic: wallet.config.mnemonic,
			balance: accountState.balance.toString()
		});
	}

	static async handleGetBalance(request, response) {
		if (!hasValidParameter('address', request.body)) {
			response.status(500).send({msg: 'Missing parameters'});

			return;
		}

		const address = request.body.address;
		const client = new LibraClient({network: LibraNetwork.Testnet});
		const accountState = await client.getAccountState(address);

		response.send({
			address: address,
			balance: accountState.balance.toString()
		});
	}

	static async handleGetAddress(request, response) {
		if (!hasValidParameter('mnemonic', request.body)) {
			response.status(500).send({msg: 'Missing parameters'});

			return;
		}

		const client = new LibraClient({network: LibraNetwork.Testnet});
		const wallet = new LibraWallet({mnemonic: request.body.mnemonic.split(';')[0]});
		const account = wallet.generateAccount(0);

		response.send({
			address: account.getAddress().toString()
		});
	}

	static async handleTransfer(request, response) {
		if (!hasValidParameter('mnemonic', request.body) || !hasValidParameter('toAddress', request.body) || !hasValidParameter('amount', request.body)) {
			response.status(500).send({msg: 'Missing parameters'});

			return;
		}

		const toAddress = request.body.toAddress;
		const amount = request.body.amount;
		const client = new LibraClient({network: LibraNetwork.Testnet});
		const wallet = new LibraWallet({mnemonic: request.body.mnemonic.split(';')[0]});
		const account = wallet.generateAccount(0);
		const transferResponse = await client.transferCoins(account, toAddress, amount);

		await transferResponse.awaitConfirmation(client);

		response.send({
			address: account.getAddress().toString(),
			toAddress: toAddress,
			amount: amount
		});
	}

	static async handleMint(request, response) {
		if (!hasValidParameter('address', request.body) || !hasValidParameter('amount', request.body)) {
			response.status(500).send({msg: 'Missing parameters'});

			return;
		}

		const address = request.body.address;
		const amount = request.body.amount;
		const client = new LibraClient({network: LibraNetwork.Testnet});

		await client.mintWithFaucetService(address, amount);

		response.send({
			address: address,
			amount: amount
		});
	}
}

module.exports = LibraService;
