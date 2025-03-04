import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Box, OrbitControls, Plane } from "@react-three/drei";

const slotData = [0, 0, 1, 1, 1, 0, 1, 1]; // Example data from backend

function ParkingScene({ slots }) {
    return (
        <Canvas
            
         camera={{ position: [0, 5, 10], fov: 50 }}>
            {/* Ground Plane */}
            <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="gray" />
            </Plane>

            {/* Parking Slots */}
            {slots.map((slot, index) =>
                slot === 1 ? (
                    <Box key={index} position={[(index % 4) * 2 - 3, 0.5, -Math.floor(index / 4) * 2]}>
                        <meshStandardMaterial color="blue" />
                    </Box>
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
