/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/models/Car2.glb -o src/components/Car2.jsx -k -r public 
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(color,props) {
  const { nodes, materials } = useGLTF('/models/Car2.glb')
  return (
    <group {...props} dispose={null}>
      <mesh name="Car" geometry={nodes.Car.geometry} material={materials.Mat} />
      <mesh name="carBody" geometry={nodes.carBody.geometry} material={materials.Mat} />
    </group>
  )
}

useGLTF.preload('/models/Car2.glb')
