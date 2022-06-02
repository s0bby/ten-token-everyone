const { expect } = require("chai");

describe("Token contract", function () {

    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    let Token;
    let hardhatToken;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        Token = await ethers.getContractFactory("TenTokenForEveryone");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        hardhatToken = await Token.deploy("name", "symbol");
    });

    describe("On deployment", function () {
        it("Deployment should assigns the total supply of tokens to zero", async function () {
            expect(await hardhatToken.totalSupply()).to.equal(0);

            const ownerBalance = await hardhatToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(0);
        });

        it("Deployment sets name and symbol", async function () {
            const name = await hardhatToken.name();
            const symbol = await hardhatToken.symbol();

            expect(name).to.equal("name");
            expect(symbol).to.equal("symbol");

            const anotherDeployedToken = await Token.deploy("newName", "newSymbol")

            const anotherTokenName = await anotherDeployedToken.name();
            const anotherTokenSymbol = await anotherDeployedToken.symbol();

            expect(anotherTokenName).to.equal("newName");
            expect(anotherTokenSymbol).to.equal("newSymbol");
        });
    });

    describe("On claiming", function (){
        it("Claiming tokens increments total supply and changes account balance to 10", async function () {
            await hardhatToken.transfer(owner.address, 10);

            const ownerBalance = await hardhatToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(10);

            const totalSupply = await hardhatToken.totalSupply();
            expect(totalSupply).to.equal(10);

            const addr1BalanceBefore = await hardhatToken.balanceOf(addr1.address);
            expect(addr1BalanceBefore).to.equal(0);

            await hardhatToken.connect(addr1).transfer(addr1.address, 10);
            const addr1BalanceAfter = await hardhatToken.balanceOf(addr1.address);
            expect(addr1BalanceAfter).to.equal(10);

            const totalSupply2 = await hardhatToken.totalSupply();
            expect(totalSupply2).to.equal(20);
        });

        it("Claiming tokens for second time fails", async function () {
            await hardhatToken.connect(addr1).transfer(addr1.address, 10);
            await expect(hardhatToken.connect(addr1).transfer(addr1.address, 10))
                .to.be.revertedWith("Account already has tokens");
        });

        it("Claiming different amount than 10 fails", async function () {
            await expect(hardhatToken.connect(addr1).transfer(addr1.address, 0))
                .to.be.revertedWith("Only ten tokens available for claim");

            await expect(hardhatToken.connect(addr1).transfer(addr1.address, 1))
                .to.be.revertedWith("Only ten tokens available for claim");

            await expect(hardhatToken.connect(addr1).transfer(addr1.address, 500))
                .to.be.revertedWith("Only ten tokens available for claim");
        });

        it("Only current sender can claim tokens for himself", async function () {
            await expect(hardhatToken.connect(addr1).transfer(owner.address, 10))
                .to.be.revertedWith("Only sender can claim tokens");

            await expect(hardhatToken.connect(owner).transfer(addr2.address, 10))
                .to.be.revertedWith("Only sender can claim tokens");
        });

        it("Must emit Transfer event after successful transfer", async function() {
            await expect(hardhatToken.connect(addr1).transfer(addr1.address, 10))
                .to.emit(hardhatToken, "Transfer")
                .withArgs(ZERO_ADDRESS, addr1.address, 10);
        });
    });
});