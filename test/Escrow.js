const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether');
};

describe('Escrow', () => {
	let buyer, seller, inspector, lender;
	let realEstate, escrow;

	beforeEach(async () => {
		[buyer, seller, inspector, lender] = await ethers.getSigners();

		// Deploy RealEstate contract
		const RealEstate = await ethers.getContractFactory('RealEstate');
		realEstate = await RealEstate.deploy();

		let transaction = await realEstate
			.connect(seller)
			.mint(
				'https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/1.png'
			);

		await transaction.wait();

		const Escrow = await ethers.getContractFactory('Escrow');
		escrow = await Escrow.deploy(
			realEstate.address,
			seller.address,
			inspector.address,
			lender.address
		);

		// Approve property
		transaction = await realEstate.connect(seller).approve(escrow.address, 1);
		await transaction.wait();

		// List property
		transaction = await escrow
			.connect(seller)
			.list(1, buyer.address, tokens(10), tokens(5));
		await transaction.wait();
	});

	// Deployment
	describe('Deployment', () => {
		it('Returns NFT address', async () => {
			const response = await escrow.nftAddress();
			expect(response).to.be.equal(realEstate.address);
		});

		it('Returns seller', async () => {
			const response = await escrow.seller();
			expect(response).to.be.equal(seller.address);
		});

		it('Returns inspector', async () => {
			const response = await escrow.inspector();
			expect(response).to.be.equal(inspector.address);
		});

		it('Returns lender', async () => {
			const response = await escrow.lender();
			expect(response).to.be.equal(lender.address);
		});
	});

	// Listing
	describe('Listing', () => {
		it('Updates ownership', async () => {
			expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
		});

		it('Returns buyer', async () => {
			const response = await escrow.buyer(1);
			expect(response).to.be.equal(buyer.address);
		});

		it('Returns purchase price', async () => {
			const response = await escrow.purchasePrice(1);
			expect(response).to.be.equal(tokens(10));
		});

		it('Returns escrow amount', async () => {
			const response = await escrow.escrowAmount(1);
			expect(response).to.be.equal(tokens(5));
		});

		it('Updates as listed', async () => {
			const result = await escrow.isListed(1);
			expect(result).to.be.equal(true);
		});
	});

	// Deposits
	describe('Deposits', () => {
		it('Updates contract balance', async () => {
			const transaction = await escrow
				.connect(buyer)
				.depositEarnest(1, { value: tokens(5) });
			await transaction.wait();

			const balance = await escrow.getBalance();
			expect(balance).to.be.equal(tokens(5));
		});
	});

	// Inspection
	describe('Inspection', () => {
		it('Updates inspection status', async () => {
			let transaction = await escrow
				.connect(inspector)
				.updateInspectionStatus(1, true);

			await transaction.wait();

			const response = await escrow.inspectionPassed(1);
			expect(response).to.be.equal(true);
		});
	});

	// Approval
	describe('Approval', () => {
		it('Updates approval status', async () => {
			let transaction = await escrow.connect(buyer).approveSale(1);
			await transaction.wait();

			transaction = await escrow.connect(seller).approveSale(1);
			await transaction.wait();

			transaction = await escrow.connect(lender).approveSale(1);
			await transaction.wait();

			expect(await escrow.approval(1, buyer.address)).to.be.equal(true);
			expect(await escrow.approval(1, seller.address)).to.be.equal(true);
			expect(await escrow.approval(1, lender.address)).to.be.equal(true);
		});
	});
});
