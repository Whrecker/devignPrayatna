import React from 'react';
import { useGLTF } from '@react-three/drei';

export function ParkingLot(props) {
  const { nodes, materials } = useGLTF('/models/parkingLot.glb');
  return (
    <group {...props} dispose={null}>
      <mesh name="Plane_Plane008-Mesh" geometry={nodes['Plane_Plane008-Mesh'].geometry} material={materials.Street} />
      <mesh name="Plane_Plane008-Mesh_1" geometry={nodes['Plane_Plane008-Mesh_1'].geometry} material={materials['Gray.004']} />
      <mesh name="Plane_Plane008-Mesh_2" geometry={nodes['Plane_Plane008-Mesh_2'].geometry} material={materials.Road} />
      <mesh name="Plane_Plane008-Mesh_3" geometry={nodes['Plane_Plane008-Mesh_3'].geometry} material={materials.None} />
      <mesh name="Plane_Plane008-Mesh_4" geometry={nodes['Plane_Plane008-Mesh_4'].geometry} material={materials.Leaves} />
      <mesh name="Plane_Plane008-Mesh_5" geometry={nodes['Plane_Plane008-Mesh_5'].geometry} material={materials.Grass} />
      <mesh name="Plane_Plane008-Mesh_6" geometry={nodes['Plane_Plane008-Mesh_6'].geometry} material={materials.Sidewalk} />
      <mesh name="Plane_Plane008-Mesh_7" geometry={nodes['Plane_Plane008-Mesh_7'].geometry} material={materials.Tree} />
    </group>
  );
}

useGLTF.preload('/models/parkingLot.glb');