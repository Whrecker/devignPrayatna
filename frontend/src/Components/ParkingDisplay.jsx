import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Box, Environment, MeshReflectorMaterial, OrbitControls, Plane, Text } from "@react-three/drei";
import { Car2 } from "./Car2";

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function ParkingScene({ slots, parkingName }) {
  return (
    <Canvas style={{ height: "50vh", width: "50vw" }} camera={{ position: [0, 5, 10], fov: 50 }}>
      <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <MeshReflectorMaterial color="black" />
      </Plane>
      {slots.map((slot, index) =>
        slot === 1 ? (
          <Car2
            key={index}
            rotation={[0, Math.random() < 0.5 ? 0 : Math.PI, 0]}
            position={[2 * (index % 4) - 3, 0, -2 * (index >> 2)]}
            scale={[0.02, 0.02, 0.02]}
            color={getRandomColor()}
          />
        ) : null
      )}
      <Text position={[0, 4, 0]} fontSize={0.5} color="black" anchorX="center" anchorY="middle">
        {parkingName}
      </Text>
      <Environment preset="city" />
      <OrbitControls />
    </Canvas>
  );
}

export default function ParkingDisplay() {
  const [slots, setSlots] = useState(null);

  useEffect(() => {
    // Use EventSource to connect to the SSE endpoint
    const eventSource = new EventSource("http://192.168.137.143:5000/stream");

    eventSource.onmessage = (event) => {
      // Log the raw data for debugging
      console.log("SSE data received:", event.data);
      try {
        const jsonData = JSON.parse(event.data);
        setSlots(jsonData);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (!slots) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
      {Object.keys(slots).map((parking) => (
        <div key={parking}>
          <ParkingScene slots={slots[parking]} parkingName={parking} />
        </div>
      ))}
    </div>
  );
}
