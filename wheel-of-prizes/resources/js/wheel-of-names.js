import React, { useEffect, useState, useRef} from "react";

const WheelComponent = ({
  segments,
  segColors,
  winningSegment,
  onFinished,
  primaryColor,
  contrastColor,
  buttonText,
  isOnlyOnce,
  onSpinStart,
  spinDuration, // Default duration in milliseconds
}) => {
  const [isFinished, setFinished] = useState(false);
  let canvasContext = null;
  const winningSegmentRef = useRef(winningSegment);
  let angleCurrent = 0;
  let angleDelta = 0;
  const size = 520; //Size of drawing
  let maxSpeed = Math.PI / 2;
  const upTime = spinDuration / 2;  // Half the duration for acceleration
  const downTime = spinDuration / 2;  // Half the duration for deceleration
  let spinStart = 0;
  let frames = 0;
  const centerX = 700; //X coordinate for adjusting the drawing
  const centerY = 530; //Y coordinate for adjusting the drawing
  let timerHandle = 0;
  const timerDelay = 20; // Adjust for smoother animation
  let currentSegment = "";
  let isStarted = false;
  const [isSpinning, setIsSpinning] = useState(false);
  useEffect(() => {
    if (winningSegment !== null) {
      console.log("Winning Segment:", winningSegment);
      winningSegmentRef.current = winningSegment;
    }
  }, [winningSegment]);
  
  //Function to update the segments
  useEffect(() => {
    wheelInit();
    return () => {
      if (timerHandle) {
        clearInterval(timerHandle);
      }
    };
  }, [segments]); 


  // Initialize the canvas and the wheel
  const wheelInit = () => {
    initCanvas();
    clear();
    wheelDraw();
  };

  // Reset the state when spinning is finished
  const resetWheel = () => {
    setFinished(false);
    angleCurrent = 0; // Reset angle for next spin
  };

  const initCanvas = () => {
    let canvas = document.getElementById("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("width", 900);
      canvas.setAttribute("height", 900);
      canvas.setAttribute("id", "canvas");
      document.getElementById("wheel").style.backgroundColor = "#2371b9";
      document.getElementById("wheel").appendChild(canvas);
    }
    canvas.addEventListener("click", spin, false);
    canvasContext = canvas.getContext("2d");

  };

  const spin = () => {
    if (segments.length <= 1) {
      console.log("Spin disabled: Only one segment left");
      return;  
    }
  
    if (isFinished && !isOnlyOnce) {
      resetWheel();
    }
    isStarted = true;
    if (timerHandle === 0) {
      // Trigger onSpinStart when spin starts
      if (onSpinStart) {
        onSpinStart();  // Call the new callback
      }
      
      spinStart = new Date().getTime();
      maxSpeed = Math.PI / 4; //Lower divisor will result to faster spin
      frames = 0;
      timerHandle = setInterval(onTimerTick, timerDelay);
    }
  };
  
  const wheelDraw = () => {
    drawWheel();
};

  const draw = () => {
    clear();
    drawWheel();

  };

  const drawSegment = (key, lastAngle, angle, isWinning) => {
    const ctx = canvasContext;
    const value = segments[key].name;

    const color1 = '#B20000';  // Red
    const color2 = '#006400';  // Green

    const color = key % 2 === 0 ? color1 : color2;

    // Apply color and highlight the winning segment
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, size, lastAngle, angle, false);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();

    // If it's the winning segment, use a different color
    ctx.fillStyle = isWinning ? '#FFD700' : color; // Gold for winning segment
    ctx.strokeStyle = '#000000'; // Black outline

    ctx.fill();
    ctx.stroke();

    // Draw segment text
    ctx.restore();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((lastAngle + angle) / 2);
    ctx.fillStyle = '#FFFFFF'; // White text
    ctx.font = "bold 1.5em proxima-nova";
    ctx.fillText(value.substr(0, 21), size / 2 + 80, 0);
    ctx.restore();
};

 
const drawWheel = (winningSegmentIndex) => {
  const ctx = canvasContext;
  let lastAngle = angleCurrent;
  const len = segments.length;
  const PI2 = Math.PI * 2;
  ctx.lineWidth = 1;
  ctx.strokeStyle = primaryColor || "black";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = "1em proxima-nova";

  for (let i = 1; i <= len; i++) {
    const angle = PI2 * (i / len) + angleCurrent;
    const isWinning = winningSegmentIndex !== null && (i - 1 === winningSegmentIndex);  // Check if this is the winning segment
    drawSegment(i - 1, lastAngle, angle, isWinning);  // Pass the isWinning flag
    lastAngle = angle;
  }

  // Draw the center circle and outer circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 50, 0, PI2, false);
  ctx.closePath();
  ctx.fillStyle = primaryColor || "black";
  ctx.lineWidth = 10;
  ctx.strokeStyle = contrastColor || "white";
  ctx.fill();
  ctx.font = "bold 2em proxima-nova";
  ctx.fillStyle = contrastColor || "white";
  ctx.textAlign = "center";
  ctx.fillText(buttonText || "Spin", centerX, centerY + 3);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, size, 0, PI2, false);
  ctx.closePath();
  ctx.lineWidth = 10;
  ctx.strokeStyle = primaryColor || "black";
  ctx.stroke();
};

  const onTimerTick = () => {
    frames++;
    draw();
  
    const duration = new Date().getTime() - spinStart;
    let progress = 0;
    let finished = false;
    const segmentAngularWidth = Math.PI * 2 / segments.length;
  
    // Regardless of the winning segment index, we add 2 full rotations
    // to the target angle, ensuring the wheel spins for at least 2 full rotations.
    const twoFullRotations = 2 * Math.PI * 2; // Two full rotations in radians
    
       const winningSegmentIndex = segments.findIndex(
    (segment) => segment.name === winningSegmentRef.current.name
  );
    console.log("This is the index", winningSegmentIndex);
  
    // Calculate the target angle by adding two full rotations to the target angle.
    const targetAngle = (winningSegmentIndex * segmentAngularWidth + twoFullRotations);
  
    let angleDifference = (targetAngle - angleCurrent + Math.PI * 2) % (Math.PI * 2);
    let angleToTarget = angleDifference;
  
    // Ensure that the spin continues until two full rotations are done
    if (frames > 0 && angleToTarget < 0.001 && duration >= 2 * upTime + 2 * downTime) {
      progress = 1;
      angleDelta = 0;
    } else {
      const totalDuration = upTime + downTime;
      if (duration < upTime) {
        progress = duration / upTime;
        angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2);
      } else {
        progress = (duration - upTime) / downTime;
        angleDelta = maxSpeed * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
      }
    }
  
    // If the spin is finished (duration is complete), set the final angle
    if (angleToTarget === targetAngle || duration >= upTime + downTime || progress >= 1) {
      finished = true;
      angleDelta = angleDifference;
    }
  
    // Update the current angle with the delta
    angleCurrent += angleDelta;
    angleCurrent = angleCurrent % (Math.PI * 2);
  
    // Calculate the current segment based on the angle
    const epsilon = 1e-6;
    let segmentIndex = Math.floor(((angleCurrent + epsilon) / (Math.PI * 2)) * segments.length) % segments.length;
    if (segmentIndex < 0) segmentIndex += segments.length;
    currentSegment = segments[segmentIndex];
  
    // Only highlight the winning segment after the spin is finished
    if (finished) {
      setFinished(true);
      onFinished(currentSegment);
      clearInterval(timerHandle);
      timerHandle = 0;
      angleDelta = 0;
    }
  
    // Update the drawing, passing `finished` to decide whether to highlight the winning segment
    drawWheel(finished ? winningSegmentIndex : null);  // Pass null when not finished to prevent highlighting
  };
  

  
  
  
  const clear = () => {
    const ctx = canvasContext;
    if (ctx) {
        ctx.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
    }
};

  return (
    <canvas
      id="canvas"
      width="1500"
      height="1500"
      style={{
        pointerEvents: isFinished && !isOnlyOnce ? "none" : "auto",
      }}
    />
  );
};

export default WheelComponent;
