import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Box, Environment, MeshReflectorMaterial, OrbitControls, Plane, Text } from "@react-three/drei";
import { MeshBasicMaterial, MeshStandardMaterial } from "three";
import { Car } from "./Car";

const initialSlotData = {
    PA1: [1, 1, 1, 1, 1, 1, 1, 1],
    PA2: [1, 1, 1, 1, 1, 1, 1, 1],
    PA3: [1, 1, 1, 1, 1, 1, 1, 1],
    PA4: [1, 1, 1, 1, 1, 1, 1, 1]
};

function ParkingScene({ slots, position, parkingName }) {
    return (
        <Canvas
            style={{ height: "50vh", width: "50vw" }}
            camera={{ position: [0, 5, 10], fov: 50 }}
        >
            <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <MeshReflectorMaterial
                    color="black"
                />
                {/* <meshStandardMaterial color="black"/> */}
            </Plane>
            {slots.map((slot, index) =>
                slot === 1 ? (
                    <Car
                        scale={0.02}
                        key={index}
                        rotation={[0, Math.random() < 0.5 ? 0 : Math.PI, 0]}
                        position={[
                            2 * (index % 4) - 3,
                            0,
                            -2 * (index >> 2)
                        ]}
                    />
                ) : null
            )}
            <Text
                position={[0, 4, 0]}
                fontSize={0.5}
                color="black"
                anchorX="center"
                anchorY="middle"
            >
                {parkingName}
            </Text>
            <Environment preset="city" />
            <OrbitControls />
        </Canvas>
    );
}

export default function ParkingDisplay() {
    const [slots, setSlots] = useState(initialSlotData);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch("/api/parking-data") // Replace with actual backend URL
                .then((res) => res.json())
                .then((data) => setSlots(data));
        }, 5000); // Fetch data every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
            {Object.keys(slots).map((parking, index) => (
                <div key={parking} >
                    <ParkingScene
                        slots={slots[parking]}
                        position={[index % 2 * 10, 0, -Math.floor(index / 2) * 10]}
                        parkingName={parking}
                    />
                </div>
            ))}
        </div>
    );
}