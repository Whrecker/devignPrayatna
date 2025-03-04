/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/models/Car.glb -o src/components/Car.jsx -k -r public 
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/models/Car.glb')
  return (
    <group {...props} dispose={null}>
      <mesh name="Car" geometry={nodes.Car.geometry} material={materials.Mat} />
    </group>
  )
}

useGLTF.preload('/models/Car.glb')
