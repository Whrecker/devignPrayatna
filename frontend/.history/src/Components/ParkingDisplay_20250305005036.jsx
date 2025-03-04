import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Box, Environment, MeshReflectorMaterial, OrbitControls, Plane, Text } from "@react-three/drei";
import { MeshBasicMaterial, MeshStandardMaterial } from "three";
import { Car2 } from "./Car2";

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

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
                    <Car2
                        key={index}
                        rotation={[0, Math.random() < 0.5 ? 0 : Math.PI, 0]}
                        position={[
                            2 * (index % 4) - 3,
                            0,
                            -2 * (index >> 2)
                        ]}
                        scale={[0.02, 0.02, 0.02]}
                        color={getRandomColor()}
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
    const [slots, setSlots] = useState(null);

    useEffect(() => {
        // Fetch initial slot data from Flask API
        fetch("http://127.0.0.1:5000/api/initial-slot-data")
            .then((res) => res.json())
            .then((data) => setSlots(data));

        const interval = setInterval(() => {
            fetch("http://127.0.0.1:5000/api/parking-data") // Replace with actual backend URL
                .then((res) => res.json())
                .then((data) => setSlots(data));
        }, 5000); // Fetch data every 5 seconds

        return () => clearInterval(interval);
    }, []);

    if (!slots) {
        return <div>Loading...</div>;
    }

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