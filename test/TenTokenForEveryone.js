const { expect } = require("chai");

describe("Token contract", function () {

    let Token;
    let hardhatToken;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        Token = await ethers.getContractFactory("TenTokenForEveryone");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        hardhatToken = await Token.deploy("name", "symbol", 1000);
    });

    describe("On deployment", function () {
        it("Initial supply zero fails", async function () {
            await expect(Token.deploy("name", "symbol", 0))
                .to.be.revertedWith("Initial supply must be greater than zero");
        });

        it("Deployment assigns initial supply to contract own address", async function () {
            expect(await hardhatToken.totalSupply()).to.equal(1000);

            const contractAddressBalance = await hardhatToken.balanceOf(hardhatToken.address);
            expect(contractAddressBalance).to.equal(1000);
        });

        it("Deployment sets name and symbol", async function () {
            const name = await hardhatToken.name();
            const symbol = await hardhatToken.symbol();

            expect(name).to.equal("name");
            expect(symbol).to.equal("symbol");

            const anotherDeployedToken = await Token.deploy("newName", "newSymbol", 1000)

            const anotherTokenName = await anotherDeployedToken.name();
            const anotherTokenSymbol = await anotherDeployedToken.symbol();

            expect(anotherTokenName).to.equal("newName");
            expect(anotherTokenSymbol).to.equal("newSymbol");
        });
    });

    describe("On claiming", function (){
        it("Claiming tokens decreases contract creator balance by 10", async function () {
            // initial state
            expect(await hardhatToken.balanceOf(hardhatToken.address)).to.equal(1000);
            expect(await hardhatToken.totalSupply()).to.equal(1000);

            expect(await hardhatToken.balanceOf(addr1.address)).to.equal(0);
            expect(await hardhatToken.connect(addr1).hasAlreadyClaimed()).to.equal(false);
            await hardhatToken.connect(addr1).claim();
            expect(await hardhatToken.balanceOf(addr1.address)).to.equal(10);
            expect(await hardhatToken.connect(addr1).hasAlreadyClaimed()).to.equal(true);

            // total supply did not change
            expect(await hardhatToken.totalSupply()).to.equal(1000);
            // owner balance changed by -10
            expect(await hardhatToken.balanceOf(hardhatToken.address)).to.equal(990);
        });

        it("Claiming tokens for second time fails", async function () {
            await hardhatToken.connect(addr1).claim();
            expect(await hardhatToken.connect(addr1).hasAlreadyClaimed()).to.equal(true);
            await expect(hardhatToken.connect(addr1).claim())
                .to.be.revertedWith("Account already has tokens");
        });

        it("Transfer of tokens works as part of ERC20", async function () {
            await hardhatToken.connect(addr1).claim();
            expect(await hardhatToken.balanceOf(addr1.address)).to.equal(10);

            await hardhatToken.connect(addr2).claim();
            expect(await hardhatToken.balanceOf(addr2.address)).to.equal(10);

            // transferring between addresses
            await hardhatToken.connect(addr2).transfer(addr1.address, 10);
            // balances changed
            expect(await hardhatToken.balanceOf(addr2.address)).to.equal(0);
            expect(await hardhatToken.balanceOf(addr1.address)).to.equal(20);
        });

        it("Excessive amount to transfer fails", async function() {
            await expect(hardhatToken.transfer(addr1.address, 10000))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        })

        it("Must emit Transfer event after successful claim", async function() {
            await expect(hardhatToken.connect(addr1).claim())
                .to.emit(hardhatToken, "Transfer")
                .withArgs(hardhatToken.address, addr1.address, 10);
        });
    });
});