import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Box, MeshReflectorMaterial, OrbitControls, Plane } from "@react-three/drei";
import { MeshBasicMaterial } from "three";
import { Car } from "./Car";

const slotData = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // Example data from backend

function ParkingScene({ slots }) {
    return (
        <Canvas
            style={{ height: "100vh", width: "100vw" }}
         camera={{ position: [0, 5, 10], fov: 50 }}>
            <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="gray" />
            </Plane>
            {slots.map((slot, index) =>
                slot === 1 ? (
                    <>
                        {/* <Box key={index} position={[(index % 4) * 2 - 3, 0.5, -Math.floor(index / 4) * 2]}>
                            <meshStandardMaterial color="blue" />
                        </Box> */}
                        <Car
                            
                            key={index}
                            position={[
                                2 * (index % 4) - 3,
                                0.5,
                                -2 * (index >> 2)
                            ]}
                        />
                        
                    </>
                ) : null
            )}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} />
            <OrbitControls/>
        </Canvas>
    );
}

export default function ParkingDisplay() {
    const [slots, setSlots] = useState(slotData);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch("/api/parking-data") // Replace with actual backend URL
                .then((res) => res.json())
                .then((data) => setSlots(data.slots));
        }, 5000); // Fetch data every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return <ParkingScene slots={slots} />;
}
