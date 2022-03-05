import { useEffect , useState } from "react"; 
import { ethers } from 'ethers';
import { timeLockAddress , abi } from '../config';
import { useRouter } from 'next/router';
import { ToastContainer , toast } from 'react-toastify';

export default function Home() {
const [loader, setLoader] = useState(false);
const [time, setTime] = useState(1);
const [timeUnits, setTimeUnits] = useState('minutes');
const [matic, setMatic] = useState(1);
const [timeLeft, setTimeLeft] = useState(null);
// const [moneyReceived, setMoneyReceived] = useState(false);
// const [deposit, setDeposit] = useState(false);
const router = useRouter();

  const options = [
    {
      label: "Minutes",
      value: "minutes",
    },
    {
      label: "Hours",
      value: "hours",
    },
    {
      label: "Days",
      value: "days",
    },
    {
      label: "Weeks",
      value: "weeks",
    },
  ];

//functions to handle state change
  const handleTimeUnits = (e)=>{
      setTimeUnits(e.target.value);
  }
  const handleTimeInput = (e) =>{
      setTime(e.target.value);
  }
  const handleMatic = (e)=>{
      setMatic(e.target.value);
  }
  const onSubmit = async()=>{
    setLoader(true);
      if(matic<=0){
          toast.alert('Amount of MATIC cannot be less than or equal to 0');
          return;
      }
      if(time<=0){
        toast.alert('Amount of Time cannot be less than or equal to 0');
        return;
    }
      // web3 stuff
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      let contract = new ethers.Contract(timeLockAddress,abi,signer);

      const options = {value: ethers.utils.parseEther(matic.toString())}
      let transaction = await contract.deposit(time,timeUnits,options);
      await transaction.wait(() => router.reload(window.location.pathname));
      setLoader(false);
      
      } catch (error) {
        setLoader(false);
        toast.alert(error.data.message);
      }
      
  }

  // const formatTime = (t) =>{
  //   let q;
  //   q.minutes = Math.floor(t/60);
  //   q.hours = Math.floor(t/(60*60));
  //   q.days = Math.floor(t/(60*60*24));
  //   q.weeks = Math.floor(t/(60*60*24*7));
  //   setTime(q);
  // }

  const checkTimeLeft = async() =>{
    setLoader(true);
    // web3 stuff
    try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(timeLockAddress,abi,signer);

    // const options = {value: ethers.utils.parseEther(matic.toString())}
    let transaction = await contract.withdrawTime();
    setLoader(false);
    setTimeLeft(parseInt(transaction._hex));
    } catch (error) {
      console.log(error);
      setLoader(false);
      if(error.data){
        if(error.data.message !== "execution reverted: 0")
        {
        toast.error(error.data.message);
        setTimeLeft(0);
        }
      }
    }
  }

  const withdrawMoney = async()=>{
    setLoader(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(timeLockAddress,abi,signer);

    // const options = {value: ethers.utils.parseEther(matic.toString())}
    let transaction = await contract.withdraw();
    await transaction.wait();
    setMoneyReceived(true);
    setLoader(false);
    toast.success('Received money, check metamask');
    } catch (error) {
      setLoader(false);
      if(error.data){
        toast.error(error.data.message,{
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          });
      }
    }
  }

  const connection = async() =>{
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    let t = await ethereum.request({ method : 'eth_chainId' })
    if(t!=='0x13881')
    {
      toast.warning('shift to mumbai testnet chain');
    }
  }
  useEffect(() => {
    if(!ethereum.isConnected()){
      toast.warning('connect');
    }
    connection();
    checkTimeLeft();
  }, []);
  return (
    <div className="bg-fire h-screen text-creame flex flex-col items-center p-5 font-raleway">
            {/* {currentAccount === ''? (<button
				className='text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
				onClick={connectWallet}
				>
				Connect Wallet
				</button>) : (<></>)} */}
            <h1 className="text-3xl m-5 font-bold text-center ">Welcome To Time Wallet!</h1>
            <p className="text-lg w-4/5 md:w-1/2 text-center">Lock your MATIC in this Time Wallet for a given period of time. Your MATIC is locked with a smart contract deployed on Polygon Testnet (Safe and Secure)</p>
            <p className="text-lg w-4/5 md:w-1/2 text-center mt-4 md:mt-2">Note : Testnet MATIC used is in this project. Get some testnet MATIC from : <a className="underline" target="_blank" href="https://faucet.polygon.technology/">here</a>
            </p>
            <div className="mt-16 flex text-black items-center">
                <label className="mr-3 font-semibold" htmlFor="amtMATIC">Enter amount of MATIC : </label>
                <input defaultValue={1} type="number" name="MATIC" id="amtMATIC" min={1}
                className="mr-3 rounded-sm w-32 outline-none py-2 px-3"
                onChange={handleMatic}
                 />
            </div>
            <div className="mt-10 flex text-black items-center">
                <label className="mr-3 font-semibold" htmlFor="amtTime">Enter lock time : </label>
                <input defaultValue={1} type="number" id="amtTime" onChange={handleTimeInput} min={1} className="mr-3 rounded-sm w-32 outline-none py-2 px-3" />
                <select defaultValue="minutes" onChange={handleTimeUnits} className="rounded-sm outline-none py-2 px-3">
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <button onClick={onSubmit} className="bg-creame rounded-lg text-fire px-3 py-2 font-semibold mt-10">
                Submit
            </button>
            {/* {sentMatic && */}
            {/* ADD THIS AFTER UPDATING CONTRACT */}
                <button 
                  onClick={checkTimeLeft}
                  className="bg-creame rounded-lg text-fire px-3 py-2 font-semibold mt-10">
                  Check Time Left 
                </button>
                { timeLeft && <p>{timeLeft} seconds</p>}

                {/* {(timeLeft===0 && !moneyReceived) &&  (*/}
                <button 
                  onClick={withdrawMoney}
                  className="bg-creame rounded-lg text-fire px-3 py-2 font-semibold mt-10">
                  Withdraw Money 
                </button>
            {loader && 
              <div className="flex items-center justify-center mt-10 ">
                <div className="w-16 h-16 border-b-2 border-creame-900 rounded-full animate-spin"></div>
              </div>
             } 
            <ToastContainer />
        </div>
  )
}
