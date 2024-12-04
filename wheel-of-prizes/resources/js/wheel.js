import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import WheelComponent from "./wheel-of-names";
import ReactConfetti from "react-confetti";
import { AudioPlayer } from "react-audio-play"; 
import axios from "axios";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

function Wheel() {
  const [prize, setPrize] = useState(null);
  const [segments, setSegments] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [winner, setWinner] = useState(null);
  const [audioSource, setAudioSource] = useState(null);
  const audioPlayerRef = useRef(null); 
  const segColors = ['#B20000', '#006400']; // Darker Red and Darker Green

  const [showModal, setShowModal] = useState(false);
  const [customPrize, setCustomPrize] = useState("");
  const [selectedRound, setSelectedRound] = useState("1");
  const [winningSegment, setWinningSegment] = useState(null);
  const [spinCount, setSpinCount] = useState(0); // Track number of spins

  const customPrizeRef = useRef(customPrize);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
  
      reader.onload = () => {
        const fileContent = reader.result;
        const lines = fileContent.split("\n"); // Split by lines
        const newSegments = lines
          .filter(line => line.trim()) // Filter out any empty lines
          .map(line => {
            const [name, category] = line.split(",").map(item => item.trim()); // Split by comma and trim spaces
            return { name, category }; // Create a segment object
          });
  
        setSegments(newSegments); // Update the segments state with the parsed data
      };
  
      reader.onerror = () => {
        console.error("Error reading file.");
      };
  
      reader.readAsText(file); // Reads the file as text
    }
  };
  
  useEffect(() => {
    customPrizeRef.current = customPrize; 
  }, [customPrize]); 

  // Function to HEX generator for random color
  function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]; 
    }
    return color;
  }

  const onFinished = (winner) => {
    console.log("Winner:", winner);
    const prizeForWinner = customPrizeRef.current || "No prize available"; // Access prize from ref
    setAudioSource("/celebrate.mp3");
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
      audioPlayerRef.current.play();
    }
  
    setTimeout(() => {
      setSegments((prevSegments) => prevSegments.filter((segment) => segment !== winner));
    }, 7000);
  
    setConfetti(true);
  
    setPrize(prizeForWinner);
    setWinner(winner.name);
    setTimeout(() => {
      setPrize(null);
      setWinner(null);
    }, 7000);
  
    setTimeout(() => {
      setConfetti(false);
      setWinningSegment(null); // Clear the winning segment
    }, 7000);
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "auto";
    };
  }, []);

  const wheelKey = segments.join("-");

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
      audioPlayerRef.current.play();
    }
  }, [audioSource]);

  //Determine round based on spin count
  const determineRound = () => {
    if (spinCount <= 15) return "1";
    if (spinCount <= 30) return "2";
    if (spinCount <= 46) return "3";
    if (spinCount <= 62) return "4";
    return "5"; // For spin count > 62
  };

  useEffect(() => {
    const currentRound = determineRound();
    setSelectedRound(currentRound);
  }, [spinCount]);

  const startSpin = () => {
    setSpinCount(prevCount => prevCount + 1); // Increment spin count on each spin
    setAudioSource("/drumroll.mp3");
  
    console.log(audioSource);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
      audioPlayerRef.current.play();
    }
  
    // Filter segments based on the selected round
    const filteredSegments = segments.filter(
      (segment) => segment.category === `Round ${selectedRound}`
    );
  
    // Randomly pick a winner from the filtered segments
    if (filteredSegments.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredSegments.length);
      const randomSegment = filteredSegments[randomIndex];
      setWinningSegment(randomSegment);  // Set the winning segment
    } else {
      setWinningSegment(null); // If no segments available, reset
    }
  };
  

  return (
    <div
      id="wheelCircle"
      style={{
        display: "flex",
        justifyContent: "center",
        paddingBottom: "150px",
        paddingLeft: "150px",
        position: "relative",
        overflow: "hidden", 
      }}
    >
      {confetti && <ReactConfetti width={windowWidth} height={windowHeight} />}

      {/* Hidden Player */}
      <AudioPlayer
        ref={audioPlayerRef}
        src={audioSource}
        autoPlay={false}
        loop={false}
        onPlay={() => console.log("Music started")}
        style={{ display: "none" }} 
      />

      <WheelComponent
        key={wheelKey}
        segments={segments}
        segColors={segColors}
        winningSegment={winningSegment}
        onFinished={(winner) => onFinished(winner)}
        primaryColor="black"
        primaryColoraround="#ffffffb4"
        contrastColor="white"
        buttonText="Spin"
        isOnlyOnce={true}
        upDuration={50} 
        downDuration={4000}
        spinDuration={5000}
        onSpinStart={startSpin}
      />

      {(winner) && (
        <div
          style={{
            position: "absolute",
            top: "-5px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#fff",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "10px",
            borderRadius: "10px",
            zIndex: 10,
          }}
        >
          {`Winner: ${winner}`}
        </div>
      )}

      {/* Input field for uploading the text file */}
      <input 
        type="file" 
        id="fileInput" 
        style={{ position: "absolute", top: "20px", right: "20px" }} 
        onChange={handleFileUpload} 
      />
    </div>
  );
}

export default Wheel;

if (document.getElementById("wheel")) {
  ReactDOM.render(<Wheel />, document.getElementById("wheel"));
}
