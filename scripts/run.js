const hre = require("hardhat");

const main = async () => {
    const contractFactory = await hre.ethers.getContractFactory("M3mentoRSVP");
    const contract = await contractFactory.deploy();
    await contract.deployed();
    console.log("contract deployed to: ", contract.address);

    const [ deployer, address1, address2 ] = await hre.ethers.getSigners();

    let deposit = hre.ethers.utils.parseEther("1");
    let maxCapacity = 3;
    let timestamp = 1718926200;
    let eventDataCID =
  "bafybeibhwfzx6oo5rymsxmkdxpmkfwyvbjrrwcl7cekmbzlupmp5ypkyfi";

    let createEventTxn = await contract.createEvent(
        timestamp,
        deposit,
        maxCapacity,
        eventDataCID
    )

    let eventCreated = await createEventTxn.wait();
    let eventID = eventCreated.events[0].args.eventID;

    let createNewRSVPTxn = await contract.createNewRSVP(eventID, {value: deposit});
    let newRSVP = await createNewRSVPTxn.wait();

    createNewRSVPTxn = await contract.connect(address1).createNewRSVP(eventID, {value: deposit});
    newRSVP = await createNewRSVPTxn.wait();

    createNewRSVPTxn = await contract.connect(address2).createNewRSVP(eventID, {value: deposit});
    newRSVP = await createNewRSVPTxn.wait();


    let confirmAllAttendeesTxn = await contract.confirmAllAttendees(eventID);
    let confirmedAllAttendees = await confirmAllAttendeesTxn.wait();

    confirmedAllAttendees.events.forEach((e) => console.log('confirmed', e.args.attendee));

    // wait 10y years
    await hre.network.provider.send("evm_increaseTime", [15778800000000]);
    let withdrawUnclaimedDepositsTxn = await contract.withdrawUnclaimedDeposits(eventID);
    let withdraw = await withdrawUnclaimedDepositsTxn.wait();
    console.log('withdraw:', withdraw.events[0].event, withdraw.events[0].args)

};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}

runMain()