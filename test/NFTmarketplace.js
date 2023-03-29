const {expect}=require("chai")
const { ethers } = require('hardhat');

const toWei=(num)=>ethers.utils.parseEther(num.toString());
const fromWei=(num)=>ethers.utils.formatEther(num);



describe("Marketplace", ()=>{
  let nft,marketplace,deployer,add1,add2,add3,add4;
  let feePercent=1;
  let URI="test uri";
  
  beforeEach(async ()=>{
    const Marketplace= await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(feePercent);
    [deployer,add1,add2,add3]=await ethers.getSigners();

    

    const NFT = await ethers.getContractFactory("NFT");
     nft = await NFT.deploy();
    


  })
  describe("Deployment",()=>{
    it("returns nft name and token",async ()=>{
      expect(await nft.name()).to.be.equal("Dapp NFT")
      expect(await nft.symbol()).to.be.equal("DAPP")
    })
    it("returns feeAccount and feePercent",async()=>{
      expect(await marketplace.feeAccount()).to.be.equal(deployer.address);
      expect(await marketplace.feePercent()).to.be.equal(feePercent);
    })
  })
  describe("Minting",async()=>{
    
    it("returns the tokencount",async ()=>{
      //account1
      await nft.connect(add1).mint(URI);
      expect(await nft.tokenCount()).to.be.equal(1);
      expect(await nft.balanceOf(add1.address)).to.be.equal(1);
      expect(await nft.tokenURI(1)).to.be.equal(URI);

      //account 2
      let tx=await nft.connect(add2).mint(URI);
      await tx.wait
      expect(await nft.tokenCount()).to.be.equal(2);
      expect(await nft.balanceOf(add2.address)).to.be.equal(1);
      expect(await nft.tokenURI(2)).to.be.equal(URI);
    })
  })

  describe("making of an Item",()=>{
    beforeEach(async ()=>{
      await nft.connect(add1).mint(URI);
      await nft.connect(add1).setApprovalForAll(marketplace.address,true);

    })
    it("should track newly created nft and transfer from seller to marketplace and emmit offered event",async()=>{
      expect(await marketplace.connect(add1).makeItem(nft.address,1,toWei(1)))
      .to.emit(marketplace,'Offered')
      .withArgs(
        1,
        nft.address,
        1,
        toWei(1),
        add1.address
      )
    })
    it("should fail if the price is zero",async()=>{
      await expect(marketplace.connect(add1).makeItem(nft.address,1,0))
      .to.be.revertedWith('the price should be greater than 0')
    })
    

  })

  describe("purchasing marketplace item",()=>{
    beforeEach(async ()=>{
      await nft.connect(add1).mint(URI);
      await nft.connect(add1).setApprovalForAll(marketplace.address,true);
      await nft.connect(add1).makeItem(nft.address,1,toWei(2))
    })
    it("should pay seller ,markitem as sold,it should transfer nft to buyer, charge fee and emit bought event",async()=>{
      
    })
  })

})